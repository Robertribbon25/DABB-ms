import React, { useState, useEffect } from 'react';
import apiClient from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Plus, Search, ArrowUp, ArrowDown, Settings, Loader2 } from 'lucide-react';

export default function Inventory() {
  const { user, hasRole } = useAuth();
  const [logs, setLogs] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Stock audit modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('in');
  const [quantity, setQuantity] = useState('1');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const isWriteAllowed = hasRole(['admin', 'manager', 'storekeeper']);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [logsRes, prodRes] = await Promise.all([
        apiClient.get('/inventory'),
        apiClient.get('/products')
      ]);
      setLogs(logsRes.data || []);
      setProducts(prodRes.data || []);
      
      if (prodRes.data && prodRes.data.length > 0) {
        setSelectedProductId(prodRes.data[0]._id);
      }
    } catch (err) {
      console.error('Error fetching inventory ledgers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setFormError('');
    setQuantity('1');
    setReason('');
    
    if (products.length > 0) {
      setSelectedProductId(products[0]._id);
    }
    setModalOpen(true);
  };

  const handleStockAdjust = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedProductId || !adjustmentType || !quantity) {
      setFormError('All fields are required.');
      return;
    }

    setSubmitting(true);
    const payload = {
      productId: selectedProductId,
      type: adjustmentType,
      quantity: Number(quantity),
      reason,
      user: user?.name || 'hub_operator'
    };

    try {
      const res = await apiClient.post('/inventory', payload);
      // Prepend to current audit lists
      setLogs([res.data, ...logs]);
      
      // Update local products quantities state to reflect change immediately
      setProducts(products.map(p => {
        if (p._id === selectedProductId) {
          let newQty = p.quantity;
          const delta = Number(quantity);
          if (adjustmentType === 'in') newQty += delta;
          else if (adjustmentType === 'out') newQty -= delta;
          else if (adjustmentType === 'adjustment') newQty = delta;
          return { ...p, quantity: newQty };
        }
        return p;
      }));

      setModalOpen(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error occurred while executing stock adjustment.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.reason && log.reason.toLowerCase().includes(searchTerm.toLowerCase())) ||
    log.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-sans">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Inventory Ledger</h2>
          <p className="text-sm text-gray-500">Document warehouse stock counts, physical adjustments, and audit ledger logs.</p>
        </div>
        {isWriteAllowed && (
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Settings className="w-4.5 h-4.5" />
            <span>Record Stock Audit</span>
          </button>
        )}
      </div>

      {/* FILTER PANEL */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter audit entries by product name, transaction description, or operator..."
          className="w-full text-sm bg-transparent border-0 focus:outline-hidden text-slate-800"
        />
      </div>

      {/* AUDIT LOG TABLE */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
        </div>
      ) : filteredLogs.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-gray-150 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">
                <tr>
                  <th className="py-3 px-4">Ledger Action</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4 text-center">Qty Shift</th>
                  <th className="py-3 px-4 text-center">Previous Stock</th>
                  <th className="py-3 px-4 text-center">New Total Stock</th>
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">Audit Description Notes</th>
                  <th className="py-3 px-4">Logged Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-750 font-sans">
                {filteredLogs.reverse().map((log) => {
                  const isIn = log.type === 'in';
                  const isOut = log.type === 'out';
                  return (
                    <tr key={log._id} className="hover:bg-slate-50/20">
                      <td className="py-4 px-4 font-mono">
                        {isIn ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] bg-emerald-100 text-emerald-805 font-bold border border-emerald-150">
                            <ArrowUp className="w-3 h-3 text-emerald-600" />
                            STOCK INGEST
                          </span>
                        ) : isOut ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] bg-red-105 bg-red-100 text-red-650 font-bold border border-red-200">
                            <ArrowDown className="w-3 h-3 text-red-500" />
                            STOCK DEPLETE
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] bg-slate-100 text-slate-655 font-bold border border-slate-200">
                            AUDIT OVERRIDE
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-800 text-[13px]">{log.product}</span>
                        <span className="block text-[10px] text-slate-400 font-mono font-medium">{log.productId}</span>
                      </td>
                      <td className={`py-4 px-4 text-center font-bold font-mono ${isIn ? 'text-emerald-600' : isOut ? 'text-red-550' : 'text-slate-800'}`}>
                        {isIn ? '+' : isOut ? '-' : ''}{log.quantity}
                      </td>
                      <td className="py-4 px-4 text-center font-mono font-medium text-gray-400">
                        {log.previousQuantity} units
                      </td>
                      <td className="py-4 px-4 text-center font-bold font-mono text-slate-900 bg-slate-50/40">
                        {log.newQuantity} units
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-650">
                        {log.user}
                      </td>
                      <td className="py-4 px-4 text-gray-500 font-medium">
                        {log.reason || 'No description notes.'}
                      </td>
                      <td className="py-4 px-4 text-gray-400 font-mono text-[10px]">
                        {new Date(log.createdAt || log.date).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 font-mono text-xs">
          No inventory ledger data logged. Try recording a manual stock audit.
        </div>
      )}

      {/* AUDIT ADJUSTMENT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95 Duration-150">
            <h3 className="text-lg font-bold text-slate-850 tracking-tight font-sans mb-4">
              Stock Audit Adjustment
            </h3>

            {formError && (
              <div className="mb-4 bg-rose-50 border border-rose-150 rounded-lg p-3 text-xs text-rose-750">
                {formError}
              </div>
            )}

            <form onSubmit={handleStockAdjust} className="space-y-4 text-xs font-sans">
              
              <div>
                <label className="block text-slate-705 font-bold mb-1 uppercase tracking-wider text-[10px]">Select Product *</label>
                {products.length > 0 ? (
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-lg text-slate-800 focus:outline-hidden text-xs"
                  >
                    {products.map(p => (
                      <option key={p._id} value={p._id}>{p.name} ({p.sku} | In stock: {p.quantity})</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    disabled
                    placeholder="No product registered."
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-lg text-slate-800 focus:outline-hidden"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-705 font-bold mb-1 uppercase tracking-wider text-[10px]">Adjustment Action *</label>
                  <select
                    value={adjustmentType}
                    onChange={(e) => setAdjustmentType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-lg text-slate-805"
                  >
                    <option value="in">Increase Quantity (Stock In)</option>
                    <option value="out">Decrease Quantity (Stock Out)</option>
                    <option value="adjustment">Physical Override (Adjustment)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-705 font-bold mb-1 uppercase tracking-wider text-[10px]">Change Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-lg font-mono focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-705 font-bold mb-1 uppercase tracking-wider text-[10px]">Audit Reason *</label>
                <textarea
                  rows="3"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Summarize the adjustment reason, e.g. Received shipment, Physical audit correction, Damaged batch..."
                  className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-lg focus:outline-hidden"
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
                  disabled={submitting || products.length === 0}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Audit Entry</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
