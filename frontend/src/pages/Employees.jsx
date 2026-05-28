import React, { useState, useEffect } from 'react';
import apiClient from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Plus, Search, Edit2, Trash2, Loader2, User, UserPlus, FileText, DollarSign, Calendar } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight font-sans">Employee Directory</h2>
          <p className="text-sm text-gray-500">Coordinate worker shifts, contracts, salaries, and security system privileges.</p>
        </div>
        {isWriteAllowed && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll New Employee</span>
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
          placeholder="Filter staff by name, department, role, or position label..."
          className="w-full text-sm bg-transparent border-0 focus:outline-hidden text-slate-800"
        />
      </div>

      {/* Employee List Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
        </div>
      ) : filteredEmployees.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-gray-150 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">
                <tr>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Department & Position</th>
                  <th className="py-3 px-4">Wage / month</th>
                  <th className="py-3 px-4">Portal Role</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Hire Date</th>
                  {isWriteAllowed && <th className="py-3 px-4 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-700 font-sans">
                {filteredEmployees.map((emp) => {
                  const isActive = emp.status === 'Active';
                  return (
                    <tr key={emp._id} className="hover:bg-slate-50/50">
                      <td className="py-4 px-4 font-mono">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                          isActive 
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                            : 'bg-slate-100 text-slate-600 border-slate-250'
                        }`}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-850">
                        {emp.name}
                      </td>
                      <td className="py-4 px-4">
                        <span className="block font-semibold text-slate-700">{emp.position}</span>
                        <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono">{emp.department}</span>
                      </td>
                      <td className="py-4 px-4 font-bold font-mono text-slate-800">
                        ${emp.salary?.toLocaleString() || '3,000'}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-bold uppercase tracking-widest font-mono">
                          {emp.role}
                        </span>
                      </td>
                      <td className="py-4 px-4 space-y-0.5">
                        <span className="block font-medium text-slate-650">{emp.email}</span>
                        {emp.phone && <span className="block text-[10px] text-gray-400 font-mono">{emp.phone}</span>}
                      </td>
                      <td className="py-4 px-4 text-gray-400 font-mono font-medium">{emp.hireDate}</td>
                      {isWriteAllowed && (
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(emp)}
                              title="Update staff parameters"
                              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-sky-600 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(emp._id)}
                              title="Terminate record"
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
          No employee profiles matching. Try clearing filtering or creating a contract profile.
        </div>
      )}

      {/* CREATE / EDIT EMPLOYEE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95 Duration-150">
            <h3 className="text-lg font-bold text-slate-850 tracking-tight font-sans mb-4">
              {editingEmployee ? 'Update Staff File' : 'Enroll Employee'}
            </h3>

            {error && (
              <div className="mb-4 bg-rose-50 border border-rose-150 rounded-lg p-3 text-xs text-rose-750">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-705 font-bold mb-1 uppercase tracking-wider text-[10px]">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-705 font-bold mb-1 uppercase tracking-wider text-[10px]">Portal Role Access *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-hidden text-slate-800"
                  >
                    <option value="sales">Sales Representative</option>
                    <option value="storekeeper">Warehouse Storekeeper</option>
                    <option value="manager">Operations Manager</option>
                    <option value="admin">System Administrator</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-705 font-bold mb-1 uppercase tracking-wider text-[10px]">Business Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@dab.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-705 font-bold mb-1 uppercase tracking-wider text-[10px]">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555-1212"
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-705 font-bold mb-1 uppercase tracking-wider text-[10px]">Position / Title *</label>
                  <input
                    type="text"
                    required
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Warehouse Lead"
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-705 font-bold mb-1 uppercase tracking-wider text-[10px]">Department *</label>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Logistics"
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-slate-705 font-bold mb-1 uppercase tracking-wider text-[10px]">Status *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-sky-500 text-slate-800"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="col-span-1">
                  <label className="block text-slate-705 font-bold mb-1 uppercase tracking-wider text-[10px]">Wage ($) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-lg font-mono focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-slate-750 font-bold mb-1 uppercase tracking-wider text-[10px]">Hire Date *</label>
                  <input
                    type="date"
                    required
                    value={hireDate}
                    onChange={(e) => setHireDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-gray-200 rounded-lg font-mono focus:ring-1 focus:ring-sky-500 text-[11px]"
                  />
                </div>
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
