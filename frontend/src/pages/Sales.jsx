import React, { useState, useEffect } from 'react';
import apiClient from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  Plus, Search, Trash2, Eye, ShoppingCart, Loader2, ArrowLeft, 
  Receipt, User, CreditCard, TrendingUp, Calendar, Clock, 
  X, Minus, Plus as PlusIcon, CheckCircle2, AlertCircle,
  Filter, Download, Printer, Share2, Zap, Sparkles, 
  Wallet, Banknote, Building2, Tag, Package, ChevronRight
} from 'lucide-react';

export default function Sales() {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all'); // all, cash, card, transfer

  // POS Workflow
  const [posMode, setPosMode] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [submitting, setSubmitting] = useState(false);
  const [posError, setPosError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Selected Sale for Detailed overlay Modal
  const [selectedSaleDetail, setSelectedSaleDetail] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

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
      setPosError(`${p.name} is out of stock!`);
      setTimeout(() => setPosError(''), 3000);
      return;
    }

    const existing = cartItems.find(item => item.productId === productId);
    if (existing) {
      if (existing.quantity >= p.quantity) {
        setPosError(`Only ${p.quantity} units available for ${p.name}`);
        setTimeout(() => setPosError(''), 3000);
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
        total: p.price,
        sku: p.sku
      }]);
    }
  };

  const handleUpdateCartQty = (productId, qty) => {
    const qValue = Number(qty);
    const p = products.find(prod => prod._id === productId);
    if (!p || qValue <= 0) return;

    if (qValue > p.quantity) {
      setPosError(`Maximum available stock: ${p.quantity}`);
      setTimeout(() => setPosError(''), 2000);
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
      setPosError('Shopping cart is empty.');
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
      setSuccessMessage(`Sale completed successfully! Total: $${res.data.totalAmount?.toFixed(2)}`);
    } catch (err) {
      setPosError(err.response?.data?.message || 'Failed to process sale.');
    } finally {
      setSubmitting(false);
    }
  };

  const cartTotal = cartItems.reduce((acc, item) => acc + item.total, 0);

  // Filter sales
  const filteredSales = sales.filter(s => {
    const matchesSearch = 
      s.saleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.salesRep && s.salesRep.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPayment = selectedFilter === 'all' || 
      (selectedFilter === 'cash' && s.paymentMethod === 'Cash') ||
      (selectedFilter === 'card' && s.paymentMethod === 'Credit Card') ||
      (selectedFilter === 'transfer' && s.paymentMethod === 'Bank Transfer');
    
    return matchesSearch && matchesPayment;
  });

  // Statistics
  const totalRevenue = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const totalTransactions = sales.length;
  const averageValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
  const cashSales = sales.filter(s => s.paymentMethod === 'Cash').reduce((sum, s) => sum + (s.totalAmount || 0), 0);

  const getPaymentIcon = (method) => {
    switch(method) {
      case 'Cash': return <Banknote className="w-3.5 h-3.5" />;
      case 'Credit Card': return <CreditCard className="w-3.5 h-3.5" />;
      default: return <Building2 className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/20">
      
      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 shadow-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <p className="text-sm text-emerald-800">{successMessage}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Header Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 rounded-2xl shadow-2xl">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-white rounded-full mix-blend-overlay animate-pulse" />
            <div className="absolute bottom-0 -right-4 w-72 h-72 bg-purple-400 rounded-full mix-blend-overlay animate-pulse delay-1000" />
          </div>
          
          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="px-2 py-1 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Sparkles className="w-4 h-4 text-indigo-200" />
                  </div>
                  <span className="text-xs font-semibold tracking-wider text-indigo-200 uppercase">Transaction Hub</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  Sales Ledger
                </h1>
                <p className="text-indigo-100 text-sm mt-2 max-w-2xl leading-relaxed">
                  Process customer transactions, manage sales records, and track revenue performance in real-time.
                </p>
              </div>
              
              <button
                onClick={() => setPosMode(!posMode)}
                className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 group cursor-pointer ${
                  posMode 
                    ? 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/20' 
                    : 'bg-white text-indigo-700 hover:bg-indigo-50'
                }`}
              >
                {posMode ? (
                  <>
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span>Back to Ledger</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Start POS Session</span>
                  </>
                )}
              </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="flex items-center gap-2 text-indigo-200 text-xs">Total Revenue</div>
                <div className="text-2xl font-bold text-white mt-1">${totalRevenue.toLocaleString()}</div>
                <div className="text-[10px] text-indigo-300 mt-0.5">all time</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="flex items-center gap-2 text-emerald-200 text-xs">Transactions</div>
                <div className="text-2xl font-bold text-white mt-1">{totalTransactions}</div>
                <div className="text-[10px] text-emerald-300 mt-0.5">total orders</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="flex items-center gap-2 text-amber-200 text-xs">Average Order</div>
                <div className="text-2xl font-bold text-white mt-1">${averageValue.toFixed(2)}</div>
                <div className="text-[10px] text-amber-300 mt-0.5">per transaction</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="flex items-center gap-2 text-cyan-200 text-xs">Cash Sales</div>
                <div className="text-2xl font-bold text-white mt-1">${cashSales.toLocaleString()}</div>
                <div className="text-[10px] text-cyan-300 mt-0.5">total cash</div>
              </div>
            </div>
          </div>
        </div>

        {posMode ? (
          /* Enhanced POS Terminal Interface */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Products Grid */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50 to-indigo-50/30 px-5 py-4 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Package className="w-4 h-4 text-indigo-600" />
                        Product Catalog
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">Click on any product to add to cart</p>
                    </div>
                    <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-lg">
                      {products.length} Items
                    </span>
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
                    {products.map((p) => {
                      const outOfStock = p.quantity <= 0;
                      const lowStock = p.quantity > 0 && p.quantity <= p.minStockAlert;
                      return (
                        <button
                          key={p._id}
                          onClick={() => !outOfStock && handleAddToCart(p._id)}
                          disabled={outOfStock}
                          className={`group p-4 rounded-xl border-2 transition-all text-left ${
                            outOfStock 
                              ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed' 
                              : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md cursor-pointer'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                {p.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <code className="text-[10px] font-mono text-slate-400">{p.sku}</code>
                                {lowStock && !outOfStock && (
                                  <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                                    Low Stock
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-indigo-600">${p.price?.toFixed(2)}</p>
                              <p className={`text-[10px] font-medium ${outOfStock ? 'text-red-500' : lowStock ? 'text-amber-600' : 'text-slate-400'}`}>
                                Stock: {p.quantity}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Shopping Cart */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg sticky top-6">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-white" />
                      <h3 className="font-bold text-white">Active Cart</h3>
                    </div>
                    <span className="text-xs text-indigo-200">{cartItems.length} items</span>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {posError && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-rose-700">{posError}</p>
                    </div>
                  )}

                  {/* Customer Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Customer *</label>
                    {customers.length > 0 ? (
                      <select
                        value={selectedCustomer}
                        onChange={(e) => setSelectedCustomer(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
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
                        placeholder="Enter customer name"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    )}
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Payment Method</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Cash', 'Credit Card', 'Bank Transfer'].map(method => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                            paymentMethod === method
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          {getPaymentIcon(method)}
                          {method === 'Credit Card' ? 'Card' : method === 'Bank Transfer' ? 'Transfer' : method}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cart Items */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Order Items</label>
                    <div className="border border-slate-200 rounded-xl max-h-64 overflow-y-auto divide-y divide-slate-100">
                      {cartItems.length > 0 ? (
                        cartItems.map((item) => (
                          <div key={item.productId} className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-semibold text-slate-800 text-sm">{item.name}</p>
                                <p className="text-[10px] text-slate-400">${item.price?.toFixed(2)} each</p>
                              </div>
                              <button
                                onClick={() => handleRemoveFromCart(item.productId)}
                                className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleUpdateCartQty(item.productId, Math.max(1, item.quantity - 1))}
                                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => handleUpdateCartQty(item.productId, parseInt(e.target.value) || 1)}
                                  className="w-12 px-2 py-1 text-center border border-slate-200 rounded-lg text-sm font-mono"
                                />
                                <button
                                  onClick={() => handleUpdateCartQty(item.productId, item.quantity + 1)}
                                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                                >
                                  <PlusIcon className="w-3 h-3" />
                                </button>
                              </div>
                              <p className="font-bold text-slate-800">${item.total?.toFixed(2)}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-slate-400">
                          <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-xs">Cart is empty</p>
                          <p className="text-[10px] mt-1">Click products to add</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="border-t border-slate-200 pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-semibold text-slate-600">Total Amount</span>
                      <span className="text-2xl font-bold text-indigo-600">${cartTotal.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={handleCheckout}
                      disabled={submitting || cartItems.length === 0}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Complete Sale
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Sales History View */
          <>
            {/* Filter Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by invoice number, customer name, or sales rep..."
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={selectedFilter}
                      onChange={(e) => setSelectedFilter(e.target.value)}
                      className="pl-9 pr-8 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer appearance-none"
                    >
                      <option value="all">All Payments</option>
                      <option value="cash">Cash Only</option>
                      <option value="card">Card Only</option>
                      <option value="transfer">Transfer Only</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Sales Table */}
            {loading ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-2xl border border-slate-200 shadow-lg">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                  <Receipt className="w-5 h-5 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-sm text-slate-500 mt-4 font-medium">Loading transactions...</p>
              </div>
            ) : filteredSales.length > 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gradient-to-r from-slate-50 to-indigo-50/30 border-b-2 border-slate-200">
                      <tr>
                        <th className="py-4 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice</th>
                        <th className="py-4 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                        <th className="py-4 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                        <th className="py-4 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Method</th>
                        <th className="py-4 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Sales Rep</th>
                        <th className="py-4 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                        <th className="py-4 px-5 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredSales.map((sale) => (
                        <tr key={sale._id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="py-3.5 px-5">
                            <p className="font-mono font-bold text-slate-800">{sale.saleNumber}</p>
                          </td>
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-2">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-medium text-slate-700">{sale.customer}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-5">
                            <span className="font-bold text-indigo-600 text-lg">${sale.totalAmount?.toFixed(2)}</span>
                          </td>
                          <td className="py-3.5 px-5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                              sale.paymentMethod === 'Cash' ? 'bg-emerald-50 text-emerald-700' :
                              sale.paymentMethod === 'Credit Card' ? 'bg-blue-50 text-blue-700' :
                              'bg-purple-50 text-purple-700'
                            }`}>
                              {getPaymentIcon(sale.paymentMethod)}
                              {sale.paymentMethod === 'Credit Card' ? 'Card' : sale.paymentMethod === 'Bank Transfer' ? 'Transfer' : sale.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-slate-600">{sale.salesRep}</td>
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-1 text-slate-500 text-xs">
                              <Calendar className="w-3 h-3" />
                              {new Date(sale.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="py-3.5 px-5 text-center">
                            <button
                              onClick={() => setSelectedSaleDetail(sale)}
                              className="p-1.5 px-3 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all text-xs font-medium flex items-center gap-1 mx-auto"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-16 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
                  <Receipt className="w-10 h-10 text-indigo-400" />
                </div>
                <p className="text-lg font-semibold text-slate-700">No sales records found</p>
                <p className="text-sm text-slate-400 mt-1">Start a POS session to create your first sale</p>
                <button
                  onClick={() => setPosMode(true)}
                  className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all shadow-lg"
                >
                  <Zap className="w-4 h-4" />
                  Start Selling
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Sale Detail Modal */}
      {selectedSaleDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-white" />
                  <h3 className="font-bold text-white">Invoice Details</h3>
                </div>
                <button
                  onClick={() => setSelectedSaleDetail(null)}
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-indigo-200 text-xs mt-1 font-mono">{selectedSaleDetail.saleNumber}</p>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Customer</p>
                  <p className="font-semibold text-slate-800 text-sm">{selectedSaleDetail.customer}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Sales Rep</p>
                  <p className="font-semibold text-slate-800 text-sm">{selectedSaleDetail.salesRep}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2">Items Purchased</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedSaleDetail.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{item.product}</p>
                        <p className="text-[10px] text-slate-400">{item.quantity} × ${item.price?.toFixed(2)}</p>
                      </div>
                      <p className="font-bold text-slate-800">${item.total?.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-600">Total Amount</span>
                  <span className="text-2xl font-bold text-indigo-600">${selectedSaleDetail.totalAmount?.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    {getPaymentIcon(selectedSaleDetail.paymentMethod)}
                    Payment Method
                  </span>
                  <span className="text-xs font-medium text-slate-700">{selectedSaleDetail.paymentMethod}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Date
                  </span>
                  <span className="text-xs text-slate-700">
                    {new Date(selectedSaleDetail.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedSaleDetail(null)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-colors mt-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}