import React, { useState, useEffect } from 'react';
import apiClient from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  Plus, Search, Edit2, Trash2, ShieldAlert, Loader2, 
  Package, TrendingUp, TrendingDown, AlertTriangle, 
  DollarSign, Tag, Layers, Truck, X, CheckCircle2,
  Filter, Grid, List, ArrowUpDown, Eye, Copy, Archive
} from 'lucide-react';

export default function Products() {
  const { hasRole, user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
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
        setSuccessMessage('Product updated successfully!');
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
        setSuccessMessage('Product created successfully!');
      }
      setModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while saving product item.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('⚠️ Warning: Deleting this product will affect all related transactions. Continue?')) {
      return;
    }
    try {
      await apiClient.delete(`/products/${id}`);
      setProducts(products.filter(p => p._id !== id));
      setSuccessMessage('Product deleted successfully');
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

  const totalValue = filteredProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  const lowStockCount = filteredProducts.filter(p => p.quantity <= p.minStockAlert).length;
  const outOfStockCount = filteredProducts.filter(p => p.quantity <= 0).length;

  const uniqueCategories = ['all', ...new Set(products.map(p => p.category))];

  const getStockStatus = (quantity, minStockAlert) => {
    if (quantity <= 0) return { label: 'Out of Stock', color: 'red', icon: AlertTriangle };
    if (quantity <= minStockAlert) return { label: 'Low Stock', color: 'amber', icon: ShieldAlert };
    return { label: 'In Stock', color: 'emerald', icon: CheckCircle2 };
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 min-h-screen">
      
      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 shadow-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <p className="text-sm text-emerald-800">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-indigo-200 uppercase">
              <Package className="w-3.5 h-3.5" />
              <span>Inventory Management</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mt-2">
              Products Catalog
            </h1>
            <p className="text-indigo-100 text-sm mt-2 max-w-2xl">
              Manage your product inventory, track stock levels, and monitor supply chain metrics in real-time.
            </p>
          </div>
          
          {isWriteAllowed && (
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white text-sm font-semibold shadow-lg transition-all duration-200 group cursor-pointer border border-white/20"
            >
              <Plus className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
              <span>Create New Product</span>
            </button>
          )}
        </div>

        {/* Stats Row */}
        <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-2 text-indigo-200 text-xs">Total Products</div>
            <div className="text-2xl font-bold text-white mt-1">{filteredProducts.length}</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-2 text-emerald-200 text-xs">
              <DollarSign className="w-3 h-3" /> Inventory Value
            </div>
            <div className="text-2xl font-bold text-white mt-1">${totalValue.toLocaleString()}</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-2 text-amber-200 text-xs">
              <AlertTriangle className="w-3 h-3" /> Low Stock
            </div>
            <div className="text-2xl font-bold text-white mt-1">{lowStockCount}</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-2 text-rose-200 text-xs">Out of Stock</div>
            <div className="text-2xl font-bold text-white mt-1">{outOfStockCount}</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products by name, SKU, category, or supplier..."
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'card' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs text-slate-400">Sort by:</span>
          {['name', 'price', 'quantity'].map(field => (
            <button
              key={field}
              onClick={() => toggleSort(field)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sortBy === field 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {field === 'name' ? 'Product Name' : field === 'price' ? 'Price' : 'Stock'}
              {sortBy === field && (
                <ArrowUpDown className={`w-3 h-3 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Products Display */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl border border-slate-200 shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm text-slate-400 mt-3 font-medium">Loading product catalog...</p>
        </div>
      ) : filteredProducts.length > 0 ? (
        viewMode === 'table' ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gradient-to-r from-slate-50 to-indigo-50/30 border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                    <th className="py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                    <th className="py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cost</th>
                    <th className="py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                    <th className="py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Margin</th>
                    <th className="py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
                    <th className="py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Supplier</th>
                    {isWriteAllowed && <th className="py-3.5 px-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => {
                    const status = getStockStatus(p.quantity, p.minStockAlert);
                    const StatusIcon = status.icon;
                    const margin = ((p.price - p.cost) / p.price * 100).toFixed(1);
                    return (
                      <tr key={p._id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium bg-${status.color}-50 text-${status.color}-700 border border-${status.color}-200`}>
                            <StatusIcon className={`w-3 h-3 text-${status.color}-500`} />
                            {status.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{p.name}</p>
                          <p className="text-[10px] font-mono text-slate-400 mt-0.5">{p.sku}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium">
                            {p.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-slate-600">${p.cost?.toFixed(2)}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold font-mono text-slate-800">${p.price?.toFixed(2)}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-xs font-semibold ${margin > 30 ? 'text-emerald-600' : margin > 15 ? 'text-amber-600' : 'text-rose-600'}`}>
                            {margin}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all ${
                                  p.quantity <= 0 ? 'bg-red-500' : 
                                  p.quantity <= p.minStockAlert ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(100, (p.quantity / (p.minStockAlert * 2)) * 100)}%` }}
                              />
                            </div>
                            <span className={`font-bold text-sm ${p.quantity <= 0 ? 'text-red-600' : p.quantity <= p.minStockAlert ? 'text-amber-600' : 'text-slate-700'}`}>
                              {p.quantity}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">Alert: {p.minStockAlert}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1 text-slate-600">
                            <Truck className="w-3 h-3" />
                            <span className="text-xs">{p.supplier}</span>
                          </div>
                        </td>
                        {isWriteAllowed && (
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleOpenEdit(p)}
                                className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 transition-all cursor-pointer group"
                                title="Edit product"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(p._id)}
                                className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-all cursor-pointer group"
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((p) => {
              const status = getStockStatus(p.quantity, p.minStockAlert);
              const StatusIcon = status.icon;
              const margin = ((p.price - p.cost) / p.price * 100).toFixed(1);
              return (
                <div key={p._id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group">
                  <div className={`h-1 w-full ${
                    p.quantity <= 0 ? 'bg-red-500' : 
                    p.quantity <= p.minStockAlert ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{p.name}</h3>
                        <p className="text-xs font-mono text-slate-400 mt-0.5">{p.sku}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-${status.color}-50 text-${status.color}-700`}>
                        <StatusIcon className={`w-3 h-3 text-${status.color}-500`} />
                        {status.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-slate-400 uppercase">Cost</p>
                        <p className="font-bold text-slate-700">${p.cost?.toFixed(2)}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-slate-400 uppercase">Price</p>
                        <p className="font-bold text-indigo-600">${p.price?.toFixed(2)}</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-500">Stock Level</span>
                        <span className={`font-bold ${p.quantity <= p.minStockAlert ? 'text-amber-600' : 'text-slate-700'}`}>
                          {p.quantity} / {p.minStockAlert}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            p.quantity <= 0 ? 'bg-red-500' : 
                            p.quantity <= p.minStockAlert ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, (p.quantity / (p.minStockAlert * 2)) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-slate-500">
                        <Tag className="w-3 h-3" />
                        <span>{p.category}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500">
                        <Truck className="w-3 h-3" />
                        <span>{p.supplier}</span>
                      </div>
                    </div>

                    {p.description && (
                      <p className="text-xs text-slate-500 italic border-t border-slate-100 pt-3 mt-1">
                        {p.description}
                      </p>
                    )}

                    {isWriteAllowed && (
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-medium transition-colors flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-medium transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
          <Package className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-base text-slate-600 font-medium">No products found</p>
          <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filters</p>
          {isWriteAllowed && (
            <button
              onClick={handleOpenCreate}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create your first product
            </button>
          )}
        </div>
      )}

      {/* Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300 my-8">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {editingProduct ? 'Edit Product' : 'Create New Product'}
                  </h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {editingProduct ? 'Update product information' : 'Add a new product to your catalog'}
                  </p>
                </div>
                <button 
                  onClick={() => setModalOpen(false)} 
                  className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

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
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
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
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
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
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
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
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Supplier *</label>
                    {suppliers.length > 0 ? (
                      <select
                        value={supplier}
                        onChange={(e) => setSupplier(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
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
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {editingProduct && (
                      <p className="text-[10px] text-amber-600 mt-1">Use inventory ledger to adjust stock</p>
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
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer shadow-sm"
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