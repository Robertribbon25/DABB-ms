import React, { useState, useEffect } from 'react';
import apiClient from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Plus, Search, Edit2, Trash2, Folder, Loader2 } from 'lucide-react';

export default function Categories() {
  const { hasRole } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isWriteAllowed = hasRole(['admin', 'manager']);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/categories');
      setCategories(res.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      setError('Category Name is required.');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      if (editingCategory) {
        // Edit Action
        const res = await apiClient.put(`/categories/${editingCategory._id}`, { name, description });
        setCategories(categories.map(c => c._id === editingCategory._id ? res.data : c));
      } else {
        // Create Action
        const res = await apiClient.post('/categories', { name, description });
        setCategories([...categories, res.data]);
      }
      setModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? This operation is irreversible.')) {
      return;
    }
    try {
      await apiClient.delete(`/categories/${id}`);
      setCategories(categories.filter(c => c._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting category');
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight font-sans">Categories</h2>
          <p className="text-sm text-gray-500">Organize and group your commercial catalog inventories</p>
        </div>
        {isWriteAllowed && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Category</span>
          </button>
        )}
      </div>

      {/* Filters Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter categories name or description..."
          className="w-full text-sm bg-transparent border-0 focus:outline-hidden text-slate-800"
        />
      </div>

      {/* Categories Grid Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
        </div>
      ) : filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((cat) => (
            <div key={cat._id} className="bg-white p-5 rounded-xl border border-gray-200 hover:border-sky-200 transition-all shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                    <Folder className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-850 text-base">{cat.name}</h3>
                </div>
                <p className="text-xs text-gray-500 line-clamp-3">{cat.description || 'No description designated.'}</p>
              </div>

              {isWriteAllowed && (
                <div className="flex items-center gap-2 justify-end pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1 px-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-sky-600 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className="p-1 px-1.5 rounded-md hover:bg-rose-50 text-rose-600 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 font-mono text-xs">
          No categories found. Try clearing filtering or creating a new category module.
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95Duration-150">
            <h3 className="text-lg font-bold text-slate-850 tracking-tight font-sans mb-4">
              {editingCategory ? 'Update Category' : 'Create Category'}
            </h3>

            {error && (
              <div className="mb-4 bg-rose-50 border border-rose-150 rounded-lg p-3 text-xs text-rose-750">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-700 font-bold mb-1.5 uppercase tracking-wider text-[10px]">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Computer Components"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-gray-200 rounded-lg text-slate-800 text-xs focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5 uppercase tracking-wider text-[10px]">Description</label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize the products catalog elements in this category..."
                  className="w-full px-3 py-2.5 bg-slate-50 border border-gray-200 rounded-lg text-slate-800 text-xs focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
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
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
