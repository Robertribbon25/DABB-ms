import React, { useState, useEffect } from 'react';
import apiClient from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  Plus, Search, Edit2, Trash2, ShieldAlert, Loader2, 
  Package, TrendingUp, TrendingDown, AlertTriangle, 
  DollarSign, Tag, Layers, Truck, X, CheckCircle2,
  Filter, Grid, List, ArrowUpDown, Eye, Copy, Archive,
  Sparkles, Zap, BarChart3, ShoppingBag, Star, Clock,
  ChevronLeft, ChevronRight, Download, Printer, Share2
} from 'lucide-react';

export default function Products() {
  const { hasRole, user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('card');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  
  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('0');
  const [cost, setCost] = useState('0');
  const [quantity, setQuantity] = useState('0');
  const [minStockAlert, setMinStockAlert] = useState('5');
  const [supplier, setSupplier] = useState('');
  const [description, setDescription] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isWriteAllowed = hasRole(['admin', 'manager', 'storekeeper']);

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
      const [prodRes, catRes, supRes] = await Promise.all([
        apiClient.get('/products'),
        apiClient.get('/categories'),
        apiClient.get('/suppliers')
      ]);
      setProducts(prodRes.data || []);
      setCategories(catRes.data || []);
      setSuppliers(supRes.data || []);
      
      if (catRes.data && catRes.data.length > 0) setCategory(catRes.data[0].name);
      if (supRes.data && supRes.data.length > 0) setSupplier(supRes.data[0].name);

    } catch (err) {
      console.error('Error fetching catalog assets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setName('');
    setSku('');
    setPrice('0');
    setCost('0');
    setQuantity('0');
    setMinStockAlert('5');
    setDescription('');
    setError('');
    
    if (categories.length > 0) setCategory(categories[0].name);
    if (suppliers.length > 0) setSupplier(suppliers[0].name);

    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setName(p.name);
    setSku(p.sku);
    setCategory(p.category);
    setPrice(String(p.price));
    setCost(String(p.cost));
    setQuantity(String(p.quantity));
    setMinStockAlert(String(p.minStockAlert));
    setSupplier(p.supplier);
    setDescription(p.description || '');
    setError('');
    
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!name || !sku || !category || !supplier) {
      setError('Name, SKU, Category, and Supplier are required.');
      return;
    }
    
    setSubmitting(true);

    const payload = {
      name,
      sku,
      category,
      price: Number(price),
      cost: Number(cost),
      quantity: Number(quantity),
      minStockAlert: Number(minStockAlert),
      supplier,
      description
    };

    try {
      if (editingProduct) {
        const res = await apiClient.put(`/products/${editingProduct._id}`, payload);
        setProducts(products.map(p => p._id === editingProduct._id ? res.data : p));
        setSuccessMessage('✨ Product updated successfully!');
      } else {
        const res = await apiClient.post('/products', payload);
        setProducts([...products, res.data]);

        await apiClient.post('/inventory', {
          productId: res.data._id,
          type: 'in',
          quantity: Number(quantity),
          reason: 'Initial catalog stock ingestion on registration.',
          user: user?.name || 'hub'
        });
        setSuccessMessage('🎉 Product created successfully!');
      }
      setModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while saving product item.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/products/${id}`);
      setProducts(products.filter(p => p._id !== id));
      setSuccessMessage('🗑️ Product deleted successfully');
      setDeleteConfirm(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting product catalog item');
    }
  };

  // Filtering and Sorting
  const filteredProducts = products
    .filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.supplier.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      if (sortBy === 'price' || sortBy === 'cost' || sortBy === 'quantity') {
        aVal = Number(aVal);
        bVal = Number(bVal);
      }
      if (sortOrder === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  const totalCost = products.reduce((sum, p) => sum + (p.cost * p.quantity), 0);
  const totalProfit = totalValue - totalCost;
  const lowStockCount = products.filter(p => p.quantity <= p.minStockAlert && p.quantity > 0).length;
  const outOfStockCount = products.filter(p => p.quantity <= 0).length;
  const healthyStockCount = products.filter(p => p.quantity > p.minStockAlert).length;

  const uniqueCategories = ['all', ...new Set(products.map(p => p.category))];

  const getStockStatus = (quantity, minStockAlert) => {
    if (quantity <= 0) return { label: 'Out of Stock', color: 'red', icon: AlertTriangle, bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
    if (quantity <= minStockAlert) return { label: 'Low Stock', color: 'amber', icon: ShieldAlert, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    return { label: 'In Stock', color: 'emerald', icon: CheckCircle2, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getMarginColor = (margin) => {
    if (margin >= 40) return 'text-emerald-600 bg-emerald-50';
    if (margin >= 25) return 'text-cyan-600 bg-cyan-50';
    if (margin >= 15) return 'text-amber-600 bg-amber-50';
    return 'text-rose-600 bg-rose-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/20">
      
      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 shadow-xl flex items-center gap-3 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-sm font-medium text-slate-800">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Product?</h3>
              <p className="text-sm text-slate-500 mb-6">
                This action cannot be undone. This will permanently delete the product and all related data.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium transition-colors"
                >
                  Delete Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        
        {/* Enhanced Header Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 rounded-2xl shadow-2xl">
          {/* Animated background elements */}
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
                  <span className="text-xs font-semibold tracking-wider text-indigo-200 uppercase">Product Management Suite</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  Products Catalog
                </h1>
                <p className="text-indigo-100 text-sm mt-2 max-w-2xl leading-relaxed">
                  Manage your complete product inventory, track real-time stock levels, and optimize your supply chain operations.
                </p>
              </div>
              
              {isWriteAllowed && (
                <button
                  onClick={handleOpenCreate}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 text-sm font-semibold shadow-lg transition-all duration-200 group cursor-pointer"
                >
                  <Plus className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
                  <span>Add New Product</span>
                </button>
              )}
            </div>

            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 hover:bg-white/15 transition-all">
                <div className="flex items-center gap-2 text-indigo-200 text-xs">Total SKUs</div>
                <div className="text-2xl font-bold text-white mt-1">{products.length}</div>
                <div className="text-[10px] text-indigo-300 mt-0.5">active products</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 hover:bg-white/15 transition-all">
                <div className="flex items-center gap-2 text-emerald-200 text-xs">
                  <DollarSign className="w-3 h-3" /> Inventory Value
                </div>
                <div className="text-xl font-bold text-white mt-1">${totalValue.toLocaleString()}</div>
                <div className="text-[10px] text-emerald-300 mt-0.5">total value</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 hover:bg-white/15 transition-all">
                <div className="flex items-center gap-2 text-cyan-200 text-xs">
                  <TrendingUp className="w-3 h-3" /> Potential Profit
                </div>
                <div className="text-xl font-bold text-white mt-1">${totalProfit.toLocaleString()}</div>
                <div className="text-[10px] text-cyan-300 mt-0.5">total margin</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 hover:bg-white/15 transition-all">
                <div className="flex items-center gap-2 text-emerald-200 text-xs">
                  <CheckCircle2 className="w-3 h-3" /> Healthy
                </div>
                <div className="text-2xl font-bold text-white mt-1">{healthyStockCount}</div>
                <div className="text-[10px] text-emerald-300 mt-0.5">in stock</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 hover:bg-white/15 transition-all">
                <div className="flex items-center gap-2 text-amber-200 text-xs">
                  <AlertTriangle className="w-3 h-3" /> Low Stock
                </div>
                <div className="text-2xl font-bold text-white mt-1">{lowStockCount}</div>
                <div className="text-[10px] text-amber-300 mt-0.5">needs reorder</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 hover:bg-white/15 transition-all">
                <div className="flex items-center gap-2 text-rose-200 text-xs">Out of Stock</div>
                <div className="text-2xl font-bold text-white mt-1">{outOfStockCount}</div>
                <div className="text-[10px] text-rose-300 mt-0.5">unavailable</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-5 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search products by name, SKU, category, or supplier..."
                className="w-full pl-11 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9 pr-8 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer appearance-none"
                >
                  {uniqueCategories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('card')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'card' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-400 font-medium">Sort by:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { field: 'name', label: 'Product Name', icon: Tag },
                { field: 'price', label: 'Price', icon: DollarSign },
                { field: 'quantity', label: 'Stock Level', icon: Package }
              ].map(({ field, label, icon: Icon }) => (
                <button
                  key={field}
                  onClick={() => toggleSort(field)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    sortBy === field 
                      ? 'bg-indigo-100 text-indigo-700 shadow-sm' 
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                  {sortBy === field && (
                    <ArrowUpDown className={`w-3 h-3 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Display */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[500px] bg-white rounded-2xl border border-slate-200 shadow-lg">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <Package className="w-6 h-6 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-sm text-slate-500 mt-4 font-medium">Loading product catalog...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <>
            {viewMode === 'card' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedProducts.map((p, idx) => {
                  const status = getStockStatus(p.quantity, p.minStockAlert);
                  const StatusIcon = status.icon;
                  const margin = ((p.price - p.cost) / p.price * 100).toFixed(1);
                  const marginColor = getMarginColor(parseFloat(margin));
                  
                  return (
                    <div 
                      key={p._id} 
                      className="group bg-white rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden animate-in fade-in slide-in-from-bottom-4"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      {/* Gradient Header Bar */}
                      <div className={`h-1.5 w-full transition-all duration-300 group-hover:h-2 ${
                        p.quantity <= 0 ? 'bg-gradient-to-r from-red-500 to-red-600' : 
                        p.quantity <= p.minStockAlert ? 'bg-gradient-to-r from-amber-500 to-amber-600' : 
                        'bg-gradient-to-r from-emerald-500 to-emerald-600'
                      }`} />
                      
                      <div className="p-5 space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                                <Package className="w-4 h-4 text-indigo-600" />
                              </div>
                              <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                                {p.name}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2 ml-10">
                              <code className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                {p.sku}
                              </code>
                            </div>
                          </div>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium ${status.bg} ${status.text} border ${status.border} shadow-sm`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center p-2 rounded-xl bg-slate-50">
                            <p className="text-[10px] text-slate-400 uppercase font-medium">Cost</p>
                            <p className="text-sm font-bold text-slate-700">${p.cost?.toFixed(2)}</p>
                          </div>
                          <div className="text-center p-2 rounded-xl bg-slate-50">
                            <p className="text-[10px] text-slate-400 uppercase font-medium">Price</p>
                            <p className="text-sm font-bold text-indigo-600">${p.price?.toFixed(2)}</p>
                          </div>
                          <div className="text-center p-2 rounded-xl bg-slate-50">
                            <p className="text-[10px] text-slate-400 uppercase font-medium">Margin</p>
                            <p className={`text-sm font-bold px-1 py-0.5 rounded ${marginColor}`}>{margin}%</p>
                          </div>
                        </div>

                        {/* Stock Progress */}
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-slate-500 font-medium">Stock Level</span>
                            <span className={`font-bold text-sm ${p.quantity <= p.minStockAlert ? 'text-amber-600' : 'text-slate-700'}`}>
                              {p.quantity} / {p.minStockAlert}
                            </span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                p.quantity <= 0 ? 'bg-gradient-to-r from-red-500 to-red-600' : 
                                p.quantity <= p.minStockAlert ? 'bg-gradient-to-r from-amber-500 to-amber-600' : 
                                'bg-gradient-to-r from-emerald-500 to-emerald-600'
                              }`}
                              style={{ width: `${Math.min(100, (p.quantity / (p.minStockAlert * 2)) * 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Meta Info */}
                        <div className="flex items-center justify-between text-xs pt-1">
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Tag className="w-3.5 h-3.5" />
                            <span>{p.category}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Truck className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[100px]">{p.supplier}</span>
                          </div>
                        </div>

                        {p.description && (
                          <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg border-l-2 border-indigo-300">
                            {p.description.length > 80 ? p.description.substring(0, 80) + '...' : p.description}
                          </p>
                        )}

                        {/* Actions */}
                        {isWriteAllowed && (
                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-medium transition-all flex items-center gap-1.5 group/btn"
                            >
                              <Edit2 className="w-3 h-3 transition-transform group-hover/btn:scale-110" />
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(p._id)}
                              className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-medium transition-all flex items-center gap-1.5 group/btn"
                            >
                              <Trash2 className="w-3 h-3 transition-transform group-hover/btn:scale-110" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gradient-to-r from-slate-50 to-indigo-50/50 border-b-2 border-slate-200">
                      <tr>
                        <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                        <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                        <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cost</th>
                        <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                        <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Margin</th>
                        <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Stock</th>
                        <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Supplier</th>
                        {isWriteAllowed && <th className="py-4 px-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedProducts.map((p) => {
                        const status = getStockStatus(p.quantity, p.minStockAlert);
                        const StatusIcon = status.icon;
                        const margin = ((p.price - p.cost) / p.price * 100).toFixed(1);
                        return (
                          <tr key={p._id} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${status.bg} ${status.text} border ${status.border}`}>
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <p className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{p.name}</p>
                              <p className="text-[10px] font-mono text-slate-400 mt-0.5">{p.sku}</p>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-medium">
                                {p.category}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-600">${p.cost?.toFixed(2)}</td>
                            <td className="py-3.5 px-4 font-bold font-mono text-slate-800">${p.price?.toFixed(2)}</td>
                            <td className="py-3.5 px-4">
                              <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${getMarginColor(parseFloat(margin))}`}>
                                {margin}%
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2 min-w-[120px]">
                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all ${
                                      p.quantity <= 0 ? 'bg-red-500' : 
                                      p.quantity <= p.minStockAlert ? 'bg-amber-500' : 'bg-emerald-500'
                                    }`}
                                    style={{ width: `${Math.min(100, (p.quantity / (p.minStockAlert * 2)) * 100)}%` }}
                                  />
                                </div>
                                <span className={`font-bold text-sm min-w-[40px] ${p.quantity <= 0 ? 'text-red-600' : p.quantity <= p.minStockAlert ? 'text-amber-600' : 'text-slate-700'}`}>
                                  {p.quantity}
                                </span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-1.5 text-slate-600">
                                <Truck className="w-3.5 h-3.5" />
                                <span className="text-xs">{p.supplier}</span>
                              </div>
                            </td>
                            {isWriteAllowed && (
                              <td className="py-3.5 px-4 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => handleOpenEdit(p)}
                                    className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 transition-all"
                                    title="Edit product"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirm(p._id)}
                                    className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-all"
                                    title="Delete product"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between flex-wrap gap-3 pt-4">
                <p className="text-sm text-slate-500">
                  Showing <span className="font-medium text-slate-700">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                  <span className="font-medium text-slate-700">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span> of{' '}
                  <span className="font-medium text-slate-700">{filteredProducts.length}</span> products
                </p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                          currentPage === pageNum
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-16 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-indigo-400" />
            </div>
            <p className="text-lg font-semibold text-slate-700">No products found</p>
            <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filters</p>
            {isWriteAllowed && (
              <button
                onClick={handleOpenCreate}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Create your first product
              </button>
            )}
          </div>
        )}
      </div>

      {/* Product Modal - Enhanced */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300 my-8">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {editingProduct ? 'Edit Product' : 'Create New Product'}
                  </h3>
                  <p className="text-indigo-200 text-sm mt-0.5">
                    {editingProduct ? 'Update product information' : 'Add a new product to your catalog'}
                  </p>
                </div>
                <button 
                  onClick={() => setModalOpen(false)} 
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-5 bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-rose-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Wireless Router AX6000"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">SKU *</label>
                    <input
                      type="text"
                      required
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="e.g., RTR-AX6K-001"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category *</label>
                    {categories.length > 0 ? (
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all cursor-pointer"
                      >
                        {categories.map(c => (
                          <option key={c._id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        required
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="e.g., Electronics"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Supplier *</label>
                    {suppliers.length > 0 ? (
                      <select
                        value={supplier}
                        onChange={(e) => setSupplier(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all cursor-pointer"
                      >
                        {suppliers.map(s => (
                          <option key={s._id} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        required
                        value={supplier}
                        onChange={(e) => setSupplier(e.target.value)}
                        placeholder="e.g., TechSupply Co."
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Cost ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Initial Stock</label>
                    <input
                      type="number"
                      min="0"
                      required
                      disabled={!!editingProduct}
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {editingProduct && (
                      <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Use inventory ledger to adjust stock
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Alert Level</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={minStockAlert}
                      onChange={(e) => setMinStockAlert(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                  <textarea
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Product specifications, warehouse location, handling instructions..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{submitting ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}