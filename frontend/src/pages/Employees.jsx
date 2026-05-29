import React, { useState, useEffect } from 'react';
import apiClient from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Plus, Search, Edit2, Trash2, Loader2, User, Mail, Phone, Briefcase, DollarSign, Calendar, ShieldCheck, X } from 'lucide-react';

export default function Employees() {
  const { hasRole } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('Active');
  const [salary, setSalary] = useState('3000');
  const [hireDate, setHireDate] = useState('');
  const [role, setRole] = useState('sales');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isWriteAllowed = hasRole(['admin', 'manager']);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/employees');
      setEmployees(res.data || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingEmployee(null);
    setName('');
    setEmail('');
    setPhone('');
    setPosition('');
    setDepartment('Sales');
    setStatus('Active');
    setSalary('3000');
    setHireDate(new Date().toISOString().split('T')[0]);
    setRole('sales');
    setError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (e) => {
    setEditingEmployee(e);
    setName(e.name);
    setEmail(e.email);
    setPhone(e.phone || '');
    setPosition(e.position);
    setDepartment(e.department);
    setStatus(e.status);
    setSalary(String(e.salary));
    setHireDate(e.hireDate);
    setRole(e.role);
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !position || !department || !hireDate) {
      setError('Please fill in all required employee fields.');
      return;
    }

    setSubmitting(true);
    const payload = {
      name,
      email,
      phone,
      position,
      department,
      status,
      salary: Number(salary),
      hireDate,
      role
    };

    try {
      if (editingEmployee) {
        const res = await apiClient.put(`/employees/${editingEmployee._id}`, payload);
        setEmployees(employees.map(e => e._id === editingEmployee._id ? res.data : e));
      } else {
        const res = await apiClient.post('/employees', payload);
        setEmployees([...employees, res.data]);
      }
      setModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while saving employee records.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee contract record? This will revoke active dashboard accounts.')) {
      return;
    }
    try {
      await apiClient.delete(`/employees/${id}`);
      setEmployees(employees.filter(e => e._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting employee');
    }
  };

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-slate-600 font-sans antialiased">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Employee Directory</h2>
          <p className="text-xs text-slate-500 mt-1">Coordinate worker shifts, contracts, salaries, and security system privileges.</p>
        </div>
        {isWriteAllowed && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll New Employee</span>
          </button>
        )}
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white px-4 py-3 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3 focus-within:border-sky-500/80 transition-colors">
        <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter staff by name, department, role, or position label..."
          className="w-full text-sm bg-transparent border-0 focus:outline-none text-slate-800 placeholder-slate-400"
        />
      </div>

      {/* DIRECTORY TABLE / CONTAINER */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-sky-600"></div>
        </div>
      ) : filteredEmployees.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                <tr>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Staff Member</th>
                  <th className="py-3.5 px-5">Department & Title</th>
                  <th className="py-3.5 px-5">Monthly Wage</th>
                  <th className="py-3.5 px-5">System Role</th>
                  <th className="py-3.5 px-5">Contact Points</th>
                  <th className="py-3.5 px-5">Hired Date</th>
                  {isWriteAllowed && <th className="py-3.5 px-5 text-center">Management Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredEmployees.map((emp) => {
                  const isActive = emp.status === 'Active';
                  const initials = emp.name ? emp.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'EM';
                  
                  return (
                    <tr key={emp._id} className="hover:bg-slate-50/40 transition-colors group">
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide border ${
                          isActive 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' 
                            : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                          {emp.status}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-[11px] text-sky-700 border tracking-tight shrink-0 ${
                            isActive ? 'bg-sky-50/60 border-sky-100' : 'bg-slate-50 border-slate-200'
                          }`}>
                            {initials}
                          </div>
                          <span className="font-bold text-slate-900 text-sm tracking-tight">{emp.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="space-y-0.5">
                          <span className="block font-bold text-slate-800 text-xs">{emp.position}</span>
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">{emp.department}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <span className="font-extrabold font-mono text-slate-900 text-sm">
                          ${emp.salary?.toLocaleString() || '3,000'}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] bg-slate-100 text-slate-700 font-bold uppercase tracking-wide border border-slate-200/40 font-mono">
                          {emp.role}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <div className="space-y-1">
                          <span className="flex items-center gap-1.5 text-slate-600 font-medium font-mono text-[11px]">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            {emp.email}
                          </span>
                          {emp.phone && (
                            <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                              <Phone className="w-3 h-3 text-slate-350 shrink-0" />
                              {emp.phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-5 text-slate-400 font-mono font-medium">{emp.hireDate}</td>
                      {isWriteAllowed && (
                        <td className="py-4 px-5 text-center">
                          <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleOpenEdit(emp)}
                              title="Update staff parameters"
                              className="p-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-sky-600 transition-all shadow-2xs cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(emp._id)}
                              title="Terminate record"
                              className="p-1.5 rounded-lg bg-white hover:bg-rose-50 border border-slate-200 text-slate-600 hover:text-rose-600 transition-all shadow-2xs cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center text-slate-400 font-mono text-xs">
          No employee profiles matching. Try clearing filtering parameters or enrolling a new team member.
        </div>
      )}

      {/* CREATE / EDIT EMPLOYEE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl relative border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Title bar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-sky-600" />
                <span>{editingEmployee ? 'Update Core Staff Profile' : 'Enroll Enterprise Employee'}</span>
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="mb-4 bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs font-semibold text-rose-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px]">Full Name *</label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-sky-500/80 focus:ring-4 focus:ring-sky-500/10 transition-all text-slate-800 placeholder-slate-400 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px]">Portal Role Access *</label>
                  <div className="relative">
                    <ShieldCheck className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-sky-500/80 focus:ring-4 focus:ring-sky-500/10 transition-all text-slate-800 font-semibold cursor-pointer"
                    >
                      <option value="sales">Sales Representative</option>
                      <option value="storekeeper">Warehouse Storekeeper</option>
                      <option value="manager">Operations Manager</option>
                      <option value="admin">System Administrator</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px]">Business Email *</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@company.com"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-sky-500/80 focus:ring-4 focus:ring-sky-500/10 transition-all text-slate-800 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px]">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 555-0199"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-sky-500/80 focus:ring-4 focus:ring-sky-500/10 transition-all text-slate-800 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px]">Position / Title *</label>
                  <input
                    type="text"
                    required
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Logistics Analyst"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-sky-500/80 focus:ring-4 focus:ring-sky-500/10 transition-all text-slate-800 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px]">Department *</label>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Logistics"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-sky-500/80 focus:ring-4 focus:ring-sky-500/10 transition-all text-slate-800 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px]">Contract Status *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:border-sky-500/80 text-slate-800 font-semibold cursor-pointer"
                  >
                    <option value="Active">Active Staff</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px]">Wage ($ / Month) *</label>
                  <div className="relative">
                    <DollarSign className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="number"
                      required
                      min="1"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl font-mono font-bold focus:outline-none focus:border-sky-500/80 focus:ring-4 focus:ring-sky-500/10 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px]">Hire Date *</label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
                    <input
                      type="date"
                      required
                      value={hireDate}
                      onChange={(e) => setHireDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl font-mono font-medium focus:outline-none focus:border-sky-500/80 text-slate-800 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Action trigger boundaries */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}