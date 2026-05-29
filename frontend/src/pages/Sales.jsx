import React, { useState, useEffect } from 'react';
import apiClient from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Plus, Search, Trash2, Eye, ShoppingCart, Loader2, ArrowLeft, Receipt, User, CreditCard } from 'lucide-react';

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
      setSales([res.data, ...sales]);
      
      setProducts(products.map(p => {
        const cart = cartItems.find(item => item.productId === p._id);
        if (cart) {
          return { ...p, quantity: p.quantity - cart.quantity };
        }
        return p;
      }));

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
    <div className="max-w-7xl mx-auto space-y-6 text-slate-600 font-sans antialiased">
      
      {/* HEADER BAR SUMMARY */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sales Ledger</h2>
          <p className="text-xs text-slate-500 mt-1">Document commercial transactions and verify active business capital flows.</p>
        </div>
        <button
          onClick={() => setPosMode(!posMode)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-xs border transition-all duration-200 cursor-pointer ${
            posMode 
              ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' 
              : 'bg-sky-600 border-sky-600 text-white hover:bg-sky-500 hover:shadow-md'
          }`}
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: Products selection list grid */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-150/80 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm md:text-base">Select Products</h3>
              <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{products.length} Items Available</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[520px] overflow-y-auto pr-1">
              {products.map((p) => {
                const outOfStock = p.quantity <= 0;
                return (
                  <div 
                    key={p._id} 
                    onClick={() => !outOfStock && handleAddToCart(p._id)}
                    className={`p-4 border rounded-xl flex flex-col justify-between h-36 transition-all relative select-none ${
                      outOfStock 
                        ? 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed' 
                        : 'border-slate-200 hover:border-sky-500 hover:bg-slate-50/40 hover:shadow-xs cursor-pointer group'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <span className="block font-bold text-slate-800 line-clamp-2 group-hover:text-sky-600 transition-colors">{p.name}</span>
                        {outOfStock && (
                          <span className="bg-rose-50 text-rose-600 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm flex-shrink-0">Empty</span>
                        )}
                      </div>
                      <span className="block text-[10px] text-slate-400 font-mono mt-1">{p.sku}</span>
                    </div>
                    <div className="flex items-end justify-between mt-2 pt-2 border-t border-slate-100/60">
                      <span className="text-lg font-black text-sky-600">${p.price?.toFixed(2)}</span>
                      <span className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.quantity <= p.minStockAlert ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-500'}`}>
                        Stock: {p.quantity}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Active Shopping Cart parameters checklist */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-150/80 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-sm md:text-base border-b border-slate-100 pb-3 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-sky-600" />
                <span>Active Checkout Cart</span>
              </h3>

              {posError && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-100">
                  {posError}
                </div>
              )}

              {/* CRM Customer Dropdown Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px]">CRM Client Selector *</label>
                  {customers.length > 0 ? (
                    <select
                      value={selectedCustomer}
                      onChange={(e) => setSelectedCustomer(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-sky-500 transition-colors"
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
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 transition-colors"
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px]">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-sky-500 transition-colors"
                  >
                    <option value="Cash">Cash Liquidity</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Bank Transfer">Bank Transfer Wire</option>
                  </select>
                </div>
              </div>

              {/* Cart Items listing */}
              <div className="border border-slate-200/80 rounded-xl max-h-60 overflow-y-auto divide-y divide-slate-100 bg-slate-50/30 mt-2">
                {cartItems.length > 0 ? (
                  cartItems.map((item) => (
                    <div key={item.productId} className="p-3.5 text-xs flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                      <div className="min-w-0 flex-1">
                        <span className="block font-bold text-slate-800 truncate">{item.name}</span>
                        <span className="block text-[10px] text-slate-400 font-mono mt-0.5">${item.price?.toFixed(2)} / unit</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateCartQty(item.productId, e.target.value)}
                          className="w-14 px-2 py-1 border border-slate-200 bg-white rounded-lg text-center text-xs font-mono font-bold focus:outline-none focus:border-sky-500"
                        />
                        <span className="font-bold text-slate-900 font-mono w-16 text-right">
                          ${item.total?.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleRemoveFromCart(item.productId)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-slate-400 font-mono text-[11px]">
                    No cart items added yet. Click product cards on the left to populate this checkout workspace.
                  </div>
                )}
              </div>
            </div>

            {/* Submit checkout billing trigger */}
            <div className="pt-4 border-t border-slate-150 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-700 mb-4 px-1">
                <span className="text-sm">Gross Order Total:</span>
                <span className="text-2xl font-black font-mono text-slate-900">${cartTotal?.toFixed(2)}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={submitting || cartItems.length === 0}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 shadow-xs hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Completing Transaction...</span>
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
          <div className="bg-white px-4 py-3 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3 focus-within:border-sky-500/80 transition-colors">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search past sales numbers, customer fields, or sales rep tags..."
              className="w-full text-sm bg-transparent border-0 focus:outline-none text-slate-800 placeholder-slate-400"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-sky-600"></div>
            </div>
          ) : filteredSales.length > 0 ? (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                    <tr>
                      <th className="py-3.5 px-5">Sale Code</th>
                      <th className="py-3.5 px-5">Bill Customer</th>
                      <th className="py-3.5 px-5">Gross Bill Amount</th>
                      <th className="py-3.5 px-5">Payment Settlement</th>
                      <th className="py-3.5 px-5">Sales Rep</th>
                      <th className="py-3.5 px-5">Audit Date</th>
                      <th className="py-3.5 px-5 text-center">Breakdown</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans text-slate-700">
                    {filteredSales.map((sale) => (
                      <tr key={sale._id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="py-3.5 px-5 font-mono font-bold text-slate-900">{sale.saleNumber}</td>
                        <td className="py-3.5 px-5 font-bold text-slate-800">{sale.customer}</td>
                        <td className="py-3.5 px-5 font-extrabold text-slate-900 font-mono text-sm">${sale.totalAmount?.toFixed(2)}</td>
                        <td className="py-3.5 px-5">
                          <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] bg-slate-100 text-slate-700 font-bold uppercase tracking-wide border border-slate-200/40">
                            {sale.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-slate-500 font-medium">{sale.salesRep}</td>
                        <td className="py-3.5 px-5 text-slate-400 font-mono">
                          {new Date(sale.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-3.5 px-5 text-center">
                          <button
                            onClick={() => setSelectedSaleDetail(sale)}
                            className="p-1.5 px-2.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-sky-600 hover:text-sky-700 transition-all font-semibold inline-flex items-center gap-1 cursor-pointer shadow-xs hover:shadow-xs"
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
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-16 text-center text-slate-400 font-mono text-xs">
              No sales ledger archives found. Try launching the POS terminal to record transactional capital.
            </div>
          )}
        </>
      )}

      {/* INSPECT DETAILED TRANSACTIONS POPUP SLIDE OVERLAY */}
      {selectedSaleDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative border border-slate-100 animate-in fade-in zoom-in-95 duration-150 text-xs text-slate-600">
            
            <div className="border-b border-slate-100 pb-3.5 mb-4 flex items-start justify-between">
              <div className="space-y-0.5">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-sky-600" />
                  <span>Commercial Audit Slip</span>
                </h3>
                <p className="text-[10px] text-slate-400 font-mono tracking-tight">ID: {selectedSaleDetail.saleNumber}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="space-y-0.5">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] flex items-center gap-1"><User className="w-2.5 h-2.5" /> Customer</span>
                  <span className="text-slate-800 font-bold text-xs block truncate">{selectedSaleDetail.customer}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Authorised Rep</span>
                  <span className="text-slate-700 font-semibold block truncate">{selectedSaleDetail.salesRep}</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="block text-slate-400 font-bold uppercase tracking-wider text-[9px]">Purchased Commodities</span>
                
                <div className="divide-y divide-slate-100 max-h-44 overflow-y-auto border border-slate-200/80 rounded-xl bg-white px-3 shadow-2xs">
                  {selectedSaleDetail.items?.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between text-[11px]">
                      <div className="min-w-0 pr-2">
                        <span className="font-bold text-slate-800 block truncate">{item.product}</span>
                        <span className="text-slate-400 font-mono text-[10px]">{item.quantity} units &bull; ${item.price?.toFixed(2)}</span>
                      </div>
                      <span className="font-bold font-mono text-slate-900 text-right flex-shrink-0">${item.total?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-1">
                <div className="flex items-center justify-between font-bold text-sm bg-emerald-50/40 p-3.5 rounded-xl border border-emerald-100/60 text-slate-800">
                  <span>Settled Gross Total:</span>
                  <span className="text-lg font-black font-mono text-emerald-600">${selectedSaleDetail.totalAmount?.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100/70 text-[10px] text-slate-400 font-mono space-y-0.5">
                <p className="flex items-center gap-1"><CreditCard className="w-3 h-3 text-slate-400" /> Settlement: <span className="font-bold text-slate-600">{selectedSaleDetail.paymentMethod}</span></p>
                <p>Timestamp: {new Date(selectedSaleDetail.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center justify-end pt-4 mt-5 border-t border-slate-100">
              <button
                onClick={() => setSelectedSaleDetail(null)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-center transition-all shadow-xs cursor-pointer"
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