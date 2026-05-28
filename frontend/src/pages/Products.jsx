import React, { useState, useEffect } from 'react';
import apiClient from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Plus, Search, Edit2, Trash2, ShieldAlert, Loader2, ArrowUpDown } from 'lucide-react';

export default function Products() {
  const { hasRole, user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
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
      
      // Select defaults if values exist
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
    
    // Default selects
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
        // Edit Action
        const res = await apiClient.put(`/products/${editingProduct._id}`, payload);
        setProducts(products.map(p => p._id === editingProduct._id ? res.data : p));
      } else {
        // Create Action
        const res = await apiClient.post('/products', payload);
        setProducts([...products, res.data]);

        // Automatically log inventory 'in' ledger
        await apiClient.post('/inventory', {
          productId: res.data._id,
          type: 'in',
          quantity: Number(quantity),
          reason: 'Initial catalog stock ingestion on registration.',
          user: user?.name || 'hub'
        });
      }
      setModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while saving product item.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product item? This might affect existing transactions calculations.')) {
      return;
    }
    try {
      await apiClient.delete(`/products/${id}`);
      setProducts(products.filter(p => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting product catalog item');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight font-sans">Products Catalog</h2>
          <p className="text-sm text-gray-500">Manage item inventory specs, supply prices, costs, and alert thresholds.</p>
        </div>
        {isWriteAllowed && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Product</span>
          </button>
        )}
      </div>

      {/* Filter and search bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter products SKU, name, supplier, or category catalog..."
          className="w-full text-sm bg-transparent border-0 focus:outline-hidden text-slate-800"
        />
      </div>

      {/* Product list table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-gray-150 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">
                <tr>
                  <th className="py-3 px-4">Item Status</th>
                  <th className="py-3 px-4">Product Name & SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Cost / unit</th>
                  <th className="py-3 px-4">Price / unit</th>
                  <th className="py-3 px-4">Stock Units</th>
                  <th className="py-3 px-4">Supplier Account</th>
                  {isWriteAllowed && <th className="py-3 px-4 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-700">
                {filteredProducts.map((p) => {
                  const outOfStock = p.quantity <= 0;
                  const stockAlert = p.quantity <= p.minStockAlert;
                  return (
                    <tr key={p._id} className="hover:bg-slate-50/50">
                      <td className="py-4 px-4 font-mono">
                        {outOfStock ? (
                          <span className="inline-flex px-2 py-1 rounded-full text-[9px] bg-red-100 text-red-700 font-bold border border-red-200">
                            OUT OF STOCK
                          </span>
                        ) : stockAlert ? (
                          <span className="inline-flex px-2 py-1 rounded-full text-[9px] bg-amber-105 bg-amber-100 text-amber-700 font-bold border border-amber-200 flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3 text-amber-600" />
                            CRITICAL
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 rounded-full text-[9px] bg-emerald-100 text-emerald-700 font-bold border border-emerald-200">
                            ADEQUATE
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="block font-bold text-slate-800 text-xs sm:text-[13px]">{p.name}</span>
                        <span className="block text-[10px] text-gray-450 font-mono font-medium">{p.sku}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 font-semibold text-slate-705">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-semibold font-mono text-gray-600">${p.cost?.toFixed(2)}</td>
                      <td className="py-4 px-4 font-bold font-mono text-slate-900">${p.price?.toFixed(2)}</td>
                      <td className={`py-4 px-4 font-bold font-mono ${outOfStock ? 'text-red-650' : stockAlert ? 'text-amber-600' : 'text-slate-800'}`}>
                        {p.quantity} <span className="text-[10px] text-slate-405 font-mono">/ alert {p.minStockAlert}</span>
                      </td>
                      <td className="py-4 px-4 text-gray-500 font-medium">{p.supplier}</td>
                      {isWriteAllowed && (
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(p)}
                              title="Edit product parameters"
                              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-sky-600 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(p._id)}
                              title="Delete product item"
                              className="p-1.5 rounded-md hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
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
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 font-mono text-xs">
          No product catalog assets registered. Try clearing searching filters or logging items.
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl relative border border-gray-100 my-8">
            <h3 className="text-base sm:text-lg font-bold text-slate-850 tracking-tight font-sans mb-4">
              {editingProduct ? 'Update Product Catalog Parameters' : 'Add New Product item'}
            </h3>

            {error && (
              <div className="mb-4 bg-rose-50 border border-rose-150 rounded-lg p-3 text-xs text-rose-750">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wider text-[10px]">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Laser Wifi Router"
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wider text-[10px]">SKU Identifier *</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. ROUT-WIFI-AX"
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wider text-[10px]">Inventory Category *</label>
                  {categories.length > 0 ? (
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-hidden text-slate-800"
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
                      placeholder="e.g. Electronics"
                      className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-sky-500"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wider text-[10px]">Supplier Account *</label>
                  {suppliers.length > 0 ? (
                    <select
                      value={supplier}
                      onChange={(e) => setSupplier(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-hidden text-slate-800"
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
                      placeholder="e.g. Apex Wholesales"
                      className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wider text-[10px]">Supply Cost ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-lg font-mono focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wider text-[10px]">Retail Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-lg font-mono focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wider text-[10px]">Initial Stock *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    disabled={!!editingProduct} // Can only manually adjust quantities via specialized Audit Ledger route later
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-lg font-mono focus:ring-1 focus:ring-sky-500 focus:outline-hidden disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wider text-[10px]">Alert Limit *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-lg font-mono focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wider text-[10px]">Product Catalog Notes</label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Insert additional supply dimensions, warehouse location or batch flags here..."
                  className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Catalog specs</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
