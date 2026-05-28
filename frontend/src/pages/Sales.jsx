import React, { useState, useEffect } from 'react';
import apiClient from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Plus, Search, Trash2, Eye, ShoppingCart, Loader2, ArrowLeft } from 'lucide-react';

export default function Sales() {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // POS Workflow Active panel toggle
  const [posMode, setPosMode] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [submitting, setSubmitting] = useState(false);
  const [posError, setPosError] = useState('');

  // Selected Sale for Detailed overlay Modal
  const [selectedSaleDetail, setSelectedSaleDetail] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [salesRes, prodRes, custRes] = await Promise.all([
        apiClient.get('/sales'),
        apiClient.get('/products'),
        apiClient.get('/customers')
      ]);
      setSales(salesRes.data || []);
      setProducts(prodRes.data || []);
      setCustomers(custRes.data || []);
      
      if (custRes.data && custRes.data.length > 0) {
        setSelectedCustomer(custRes.data[0].name);
      }
    } catch (err) {
      console.error('Error fetching transactional components:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (productId) => {
    const p = products.find(prod => prod._id === productId);
    if (!p) return;

    if (p.quantity <= 0) {
      alert(`Critical: ${p.name} is completely out of stock.`);
      return;
    }

    const existing = cartItems.find(item => item.productId === productId);
    if (existing) {
      if (existing.quantity >= p.quantity) {
        alert(`Insufficient stock. Total available in storage: ${p.quantity}`);
        return;
      }
      setCartItems(cartItems.map(item => 
        item.productId === productId 
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price } 
          : item
      ));
    } else {
      setCartItems([...cartItems, {
        productId: p._id,
        name: p.name,
        price: p.price,
        quantity: 1,
        total: p.price
      }]);
    }
  };

  const handleUpdateCartQty = (productId, qty) => {
    const qValue = Number(qty);
    const p = products.find(prod => prod._id === productId);
    if (!p || qValue <= 0) return;

    if (qValue > p.quantity) {
      alert(`Stock shortage. Maximum available is: ${p.quantity}`);
      return;
    }

    setCartItems(cartItems.map(item => 
      item.productId === productId 
        ? { ...item, quantity: qValue, total: qValue * item.price } 
        : item
    ));
  };

  const handleRemoveFromCart = (productId) => {
    setCartItems(cartItems.filter(item => item.productId !== productId));
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setPosError('');

    if (!selectedCustomer) {
      setPosError('Please select a customer for this order.');
      return;
    }

    if (cartItems.length === 0) {
      setPosError('The operational shopping cart is currently empty.');
      return;
    }

    setSubmitting(true);
    const payload = {
      customer: selectedCustomer,
      items: cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      })),
      paymentMethod,
      salesRep: user?.name || 'Sales Agent'
    };

    try {
      const res = await apiClient.post('/sales', payload);
      // Prepend to transactional records list
      setSales([res.data, ...sales]);
      
      // Update local product catalog levels to mirror decremented values
      setProducts(products.map(p => {
        const cart = cartItems.find(item => item.productId === p._id);
        if (cart) {
          return { ...p, quantity: p.quantity - cart.quantity };
        }
        return p;
      }));

      // Flush POS cart states
      setCartItems([]);
      setPosMode(false);
      alert('Transaction ledger saved successfully.');
    } catch (err) {
      setPosError(err.response?.data?.message || 'Verification failed. Could not write sale.');
    } finally {
      setSubmitting(false);
    }
  };

  const cartTotal = cartItems.reduce((acc, item) => acc + item.total, 0);

  const filteredSales = sales.filter(s => 
    s.saleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.salesRep && s.salesRep.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      
      {/* HEADER BAR SUMMARY */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight font-sans">Sales Ledger</h2>
          <p className="text-sm text-gray-500">Document commercial transactions and verify active capital flows.</p>
        </div>
        <button
          onClick={() => setPosMode(!posMode)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold shadow-sm transition-all cursor-pointer"
        >
          {posMode ? (
            <>
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Ledger Logs</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              <span>Launch POS Console</span>
            </>
          )}
        </button>
      </div>

      {posMode ? (
        /* INTERACTIVE POS TERMINAL PANEL INTERFACE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
          
          {/* LEFT: Products selection list grid */}
          <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm md:text-base border-b border-gray-100 pb-2">Select Products</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
              {products.map((p) => {
                const outOfStock = p.quantity <= 0;
                return (
                  <div 
                    key={p._id} 
                    onClick={() => !outOfStock && handleAddToCart(p._id)}
                    className={`p-3.5 border rounded-xl flex flex-col justify-between h-32 transition-all cursor-pointer select-none text-xs ${
                      outOfStock 
                        ? 'bg-slate-50 border-gray-150 opacity-45 cursor-not-allowed' 
                        : 'border-slate-200 hover:border-sky-550 hover:bg-slate-50/50 hover:scale-[1.01]'
                    }`}
                  >
                    <div>
                      <span className="block font-bold text-slate-800 line-clamp-1">{p.name}</span>
                      <span className="block text-[10px] text-zinc-400 font-mono font-medium">{p.sku}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                      <span className="text-base font-extrabold text-[#0ea5e9]">${p.price?.toFixed(2)}</span>
                      <span className={`font-semibold font-mono text-[10px] ${p.quantity <= p.minStockAlert ? 'text-amber-600' : 'text-slate-500'}`}>
                        Qty: {p.quantity} left
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Active Shopping Cart parameters checklist */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-sm md:text-base border-b border-gray-100 pb-2 flex items-center gap-2">
                <ShoppingCart className="w-4.5 h-4.5 text-sky-600" />
                <span>Active Checkout Cart</span>
              </h3>

              {posError && (
                <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs font-semibold">
                  {posError}
                </div>
              )}

              {/* CRM Customer Dropdown Selection */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wider text-[9px]">CRM Client Selector *</label>
                  {customers.length > 0 ? (
                    <select
                      value={selectedCustomer}
                      onChange={(e) => setSelectedCustomer(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-gray-200 rounded-lg text-slate-800 focus:outline-hidden"
                    >
                      {customers.map(c => (
                        <option key={c._id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      value={selectedCustomer}
                      onChange={(e) => setSelectedCustomer(e.target.value)}
                      placeholder="Acme Wholesales"
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-gray-200 rounded-lg focus:outline-hidden"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-slate-705 font-bold mb-1 uppercase tracking-wider text-[9px]">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-gray-200 rounded-lg text-slate-800 focus:outline-hidden"
                  >
                    <option value="Cash">Cash Liquidity</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Bank Transfer">Bank Transfer Wire</option>
                  </select>
                </div>
              </div>

              {/* Cart Items listing */}
              <div className="border border-gray-100 rounded-xl max-h-56 overflow-y-auto divide-y divide-gray-50 bg-slate-50/30">
                {cartItems.length > 0 ? (
                  cartItems.map((item) => (
                    <div key={item.productId} className="p-3 text-xs flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="block font-bold text-slate-800 truncate">{item.name}</span>
                        <span className="block text-[10px] text-slate-400 font-mono">${item.price?.toFixed(2)}/unit</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateCartQty(item.productId, e.target.value)}
                          className="w-12 px-1.5 py-0.5 border border-gray-200 bg-white rounded-md text-center text-xs font-mono focus:outline-hidden"
                        />
                        <span className="font-extrabold text-slate-900 font-mono w-16 text-right">
                          ${item.total?.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleRemoveFromCart(item.productId)}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center text-gray-400 font-mono text-[11px]">
                    No cart items added yet. Click product slots on left to populate order checkout.
                  </div>
                )}
              </div>
            </div>

            {/* Submit checkout billing trigger */}
            <div className="pt-4 border-t border-gray-150 text-xs">
              <div className="flex items-center justify-between font-bold text-sm text-slate-900 mb-4 px-1">
                <span>Gross Order Total:</span>
                <span className="text-xl font-extrabold font-mono text-slate-950">${cartTotal?.toFixed(2)}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={submitting || cartItems.length === 0}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Completing Transaction...
                  </span>
                ) : (
                  'Complete Sales Checkout'
                )}
              </button>
            </div>

          </div>
        </div>
      ) : (
        /* STANDALONE STATIC SALES ARCHIVE TABLE */
        <>
          {/* Filters searching */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3">
            <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search past sales numbers, customer fields, or sales rep tags..."
              className="w-full text-sm bg-transparent border-0 focus:outline-hidden text-slate-800"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
            </div>
          ) : filteredSales.length > 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden text-slate-750">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 border-b border-gray-150 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">
                  <tr>
                    <th className="py-3.5 px-4 h-11">Sale Code</th>
                    <th className="py-3.5 px-4 h-11">Bill Customer</th>
                    <th className="py-3.5 px-4 h-11">Gross Bill Amount</th>
                    <th className="py-3.5 px-4 h-11">Payment Settlement</th>
                    <th className="py-3.5 px-4 h-11">Sales Rep</th>
                    <th className="py-3.5 px-4 h-11">Audit Date</th>
                    <th className="py-3.5 px-4 text-center h-11">Breakdown</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-sans">
                  {filteredSales.map((sale) => (
                    <tr key={sale._id} className="hover:bg-slate-50/30">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{sale.saleNumber}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">{sale.customer}</td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900 font-mono">${sale.totalAmount?.toFixed(2)}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-650 font-bold uppercase tracking-wider">
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-500">{sale.salesRep}</td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[10px]">
                        {new Date(sale.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setSelectedSaleDetail(sale)}
                          title="View sale transaction specifics"
                          className="p-1 px-1.5 rounded-md hover:bg-slate-50 border border-slate-100 text-sky-600 hover:text-sky-700 transition-colors font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 font-mono text-xs">
              No sales ledger archives found. Try launching the POS terminal to record transactional capital.
            </div>
          )}
        </>
      )}

      {/* INSPECT DETAILED TRANSACTIONS POPUP SLIDE OVERLAY */}
      {selectedSaleDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95 Duration-150 text-xs">
            
            <div className="border-b border-gray-150 pb-3 mb-4 space-y-1">
              <h3 className="font-extrabold text-slate-850 text-base font-sans">
                Commercial Audit Slip
              </h3>
              <p className="text-[10px] text-gray-400 font-mono">TRANSACTION ID: {selectedSaleDetail.saleNumber}</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 border-b border-slate-50 pb-3">
                <div>
                  <span className="block text-gray-400 font-bold uppercase font-mono tracking-widest text-[9px] mb-0.5">Bill Customer</span>
                  <span className="text-slate-800 font-bold text-sm">{selectedSaleDetail.customer}</span>
                </div>
                <div>
                  <span className="block text-gray-400 font-bold uppercase font-mono tracking-widest text-[9px] mb-0.5">Authorised Rep</span>
                  <span className="text-slate-700 font-semibold">{selectedSaleDetail.salesRep}</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="block text-gray-450 font-bold uppercase tracking-wider text-[9px]">Purchased Commodities</span>
                
                <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto border border-gray-100 rounded-xl bg-slate-50/40 px-3">
                  {selectedSaleDetail.items?.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-[11px]">
                      <div>
                        <span className="font-bold text-slate-805 block">{item.product}</span>
                        <span className="text-slate-400 font-mono">{item.quantity} units &bull; ${item.price?.toFixed(2)}/u</span>
                      </div>
                      <span className="font-bold font-mono text-slate-850">${item.total?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-150 flex items-center justify-between font-bold text-sm text-slate-850 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span>Settled Gross Total:</span>
                <span className="text-lg font-extrabold font-mono text-sky-605">${selectedSaleDetail.totalAmount?.toFixed(2)}</span>
              </div>

              <div className="text-[10px] text-gray-400 font-mono space-y-0.5">
                <p>Settlement: {selectedSaleDetail.paymentMethod}</p>
                <p>Completed Timestamp: {new Date(selectedSaleDetail.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center justify-end pt-5 mt-4 border-t border-gray-100">
              <button
                onClick={() => setSelectedSaleDetail(null)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-205 text-slate-700 rounded-lg font-bold text-center cursor-pointer"
              >
                Close Audit Slip
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
