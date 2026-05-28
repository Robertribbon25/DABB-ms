import React, { useState, useEffect } from 'react';
import apiClient from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Plus, Search, Edit2, Trash2, Loader2, UserPlus, Building, Mail, Phone } from 'lucide-react';

export default function Customers() {
  const { hasRole } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [company, setCompany] = useState('');
  const [totalPurchases, setTotalPurchases] = useState('0');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isWriteAllowed = hasRole(['admin', 'manager', 'sales']);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/customers');
      setCustomers(res.data || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingCustomer(null);
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setCompany('');
    setTotalPurchases('0');
    setError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCustomer(c);
    setName(c.name);
    setEmail(c.email);
    setPhone(c.phone || '');
    setAddress(c.address || '');
    setCompany(c.company || '');
    setTotalPurchases(String(c.totalPurchases || 0));
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email) {
      setError('Customer name and email are required fields.');
      return;
    }

    setSubmitting(true);
    const payload = {
      name,
      email,
      phone,
      address,
      company,
      totalPurchases: Number(totalPurchases)
    };

    try {
      if (editingCustomer) {
        const res = await apiClient.put(`/customers/${editingCustomer._id}`, payload);
        setCustomers(customers.map(c => c._id === editingCustomer._id ? res.data : c));
      } else {
        const res = await apiClient.post('/customers', payload);
        setCustomers([...customers, res.data]);
      }
      setModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while saving customer record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer file?')) {
      return;
    }
    try {
      await apiClient.delete(`/customers/${id}`);
      setCustomers(customers.filter(c => c._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting customer');
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight font-sans">Customer Directory</h2>
          <p className="text-sm text-gray-500">Manage client contact accounts, addresses, and transactional volumes.</p>
        </div>
        {isWriteAllowed && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register New Customer</span>
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
          placeholder="Filter customers by name, company, or email address..."
          className="w-full text-sm bg-transparent border-0 focus:outline-hidden text-slate-800"
        />
      </div>

      {/* Customer summary table/grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
        </div>
      ) : filteredCustomers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCustomers.map((cust) => (
            <div key={cust._id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:shadow-md hover:border-sky-300 transition-all space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-850 text-base">{cust.name}</h3>
                  {cust.company && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-sky-700 bg-sky-50 font-bold px-2 py-0.5 rounded-md">
                      <Building className="w-3 h-3" />
                      {cust.company}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest font-mono">Gross Purchases</span>
                  <span className="text-base font-extrabold text-slate-800 font-sans">${cust.totalPurchases?.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-500 border-t border-gray-100 pt-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span className="truncate">{cust.email}</span>
                </div>
                {cust.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{cust.phone}</span>
                  </div>
                )}
                {cust.address && (
                  <p className="text-[11px] text-gray-400 line-clamp-1 mt-1 pl-5">
                    {cust.address}
                  </p>
                )}
              </div>

              {isWriteAllowed && (
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleOpenEdit(cust)}
                    className="p-1 px-2 rounded-md hover:bg-slate-100 text-slate-650 hover:text-sky-600 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={() => handleDelete(cust._id)}
                    className="p-1 px-2 rounded-md hover:bg-rose-50 text-rose-500 hover:text-rose-600 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 font-mono text-xs">
          No customer accounts found. Try clearing filters or creating a customer file.
        </div>
      )}

      {/* CREATE / EDIT CUSTOMER MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95 Duration-150">
            <h3 className="text-lg font-bold text-slate-850 tracking-tight font-sans mb-4">
              {editingCustomer ? 'Update Customer Profile' : 'Register Customer Account'}
            </h3>

            {error && (
              <div className="mb-4 bg-rose-50 border border-rose-150 rounded-lg p-3 text-xs text-rose-750">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wider text-[10px]">Client / Contact Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Acme procurement dept"
                  className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wider text-[10px]">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="billing@acme.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wider text-[10px]">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555-0105"
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wider text-[10px]">Enterprise Company</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Corporation"
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wider text-[10px]">Total Gross Purchases ($)</label>
                <input
                  type="number"
                  min="0"
                  value={totalPurchases}
                  onChange={(e) => setTotalPurchases(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-lg font-mono focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 uppercase tracking-wider text-[10px]">Physical Street Address</label>
                <textarea
                  rows="2"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 100 Industrial Parkway, City, Country"
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
                  <span>Save client profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
