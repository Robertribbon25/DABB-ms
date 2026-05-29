import React, { useState, useEffect } from 'react';
import apiClient from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Plus, Search, ArrowUp, ArrowDown, Settings, Loader2, Package, RefreshCw, X, FileText, CheckCircle2 } from 'lucide-react';

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
      setLogs([res.data, ...logs]);
      
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
    log.product?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.reason && log.reason.toLowerCase().includes(searchTerm.toLowerCase())) ||
    log.user?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 antialiased font-sans">
      <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* TOP HEADER PLATFORM */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2.5 text-xs font-semibold tracking-wider text-sky-600 uppercase">
              <FileText className="w-4 h-4" />
              <span>Warehouse Operations</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Inventory Ledger
            </h2>
            <p className="text-sm text-slate-500 mt-1.5 max-w-2xl">
              Real-time audit trailing, physical item overrides, and absolute stock adjustments for secure warehouse compliance.
            </p>
          </div>
          
          {isWriteAllowed && (
            <button
              onClick={handleOpenModal}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 active:scale-[0.98] text-white text-sm font-semibold shadow-md shadow-sky-600/10 transition-all duration-150 group cursor-pointer"
            >
              <Plus className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
              <span>Record Stock Audit</span>
            </button>
          )}
        </div>

        {/* METRICS DASHBOARD PANELS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between group hover:border-slate-300 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-sky-50 text-sky-600 rounded-xl group-hover:scale-110 transition-transform">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total SKUs Registered</p>
                <h4 className="text-2xl font-black text-slate-800 mt-1">{products.length}</h4>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between group hover:border-slate-300 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Actions Logged</p>
                <h4 className="text-2xl font-black text-slate-800 mt-1">{logs.length}</h4>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between group hover:border-slate-300 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Filtered Matches</p>
                <h4 className="text-2xl font-black text-slate-800 mt-1">{filteredLogs.length}</h4>
              </div>
            </div>
          </div>
        </div>

        {/* FILTER CONTROL BAR */}
        <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs focus-within:ring-4 focus-within:ring-sky-500/10 focus-within:border-sky-500/80 transition-all duration-200 flex items-center gap-3">
          <div className="pl-3.5 text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search instantly by product name, adjustment notes, or supervisor..."
            className="w-full text-base py-2.5 bg-transparent border-0 focus:outline-hidden text-slate-800 placeholder-slate-400"
          />
        </div>

        {/* SECURE DATA LEDGER GRID */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-2xl border border-slate-200 shadow-xs">
            <Loader2 className="w-9 h-9 animate-spin text-sky-600" />
            <p className="text-sm text-slate-400 mt-3 font-semibold tracking-wide">Retrieving ledger state...</p>
          </div>
        ) : filteredLogs.length > 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden hover:shadow-md transition-shadow duration-300">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-slate-50/70 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-4 px-6">Ledger Action</th>
                    <th className="py-4 px-6">Product Details</th>
                    <th className="py-4 px-4 text-center">Shift</th>
                    <th className="py-4 px-4 text-center">Prior Stock</th>
                    <th className="py-4 px-4 text-center">Post Stock</th>
                    <th className="py-4 px-6">Authorized By</th>
                    <th className="py-4 px-6">Audit Description Statement</th>
                    <th className="py-4 px-6 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {[...filteredLogs].reverse().map((log) => {
                    const isIn = log.type === 'in';
                    const isOut = log.type === 'out';
                    return (
                      <tr key={log._id} className="hover:bg-slate-50/40 transition-colors group">
                        <td className="py-4 px-6 whitespace-nowrap">
                          {isIn ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/50">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              STOCK IN
                            </span>
                          ) : isOut ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-rose-50 text-rose-700 font-bold border border-rose-200/50">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                              STOCK OUT
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-amber-50 text-amber-800 font-bold border border-amber-200/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              OVERRIDE
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 max-w-xs truncate">
                          <span className="font-bold text-slate-900 block group-hover:text-sky-600 transition-colors">{log.product}</span>
                          <span className="text-xs text-slate-400 font-mono block mt-0.5 tracking-tight">{log.productId}</span>
                        </td>
                        <td className={`py-4 px-4 text-center font-black font-mono text-base ${isIn ? 'text-emerald-600' : isOut ? 'text-rose-600' : 'text-slate-800'}`}>
                          {isIn ? '+' : isOut ? '-' : ''}{log.quantity}
                        </td>
                        <td className="py-4 px-4 text-center font-mono text-slate-400 text-xs">
                          {log.previousQuantity} units
                        </td>
                        <td className="py-4 px-4 text-center font-bold font-mono text-slate-900 bg-slate-50/40 group-hover:bg-slate-50 transition-colors">
                          {log.newQuantity} units
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-600 whitespace-nowrap">
                          {log.user}
                        </td>
                        <td className="py-4 px-6 text-slate-500 text-xs max-w-sm break-words font-medium leading-relaxed">
                          {log.reason || <span className="text-slate-300 italic font-normal">No descriptive notes added.</span>}
                        </td>
                        <td className="py-4 px-6 text-right text-slate-400 font-mono text-xs whitespace-nowrap">
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
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center text-slate-400 font-medium shadow-xs">
            <Package className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <p className="text-base text-slate-500 font-semibold">No system ledger records found</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting your filter string or record an explicit adjustment action above.</p>
          </div>
        )}

        {/* MANAGEMENT FORM DIALOG MODAL */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-lg p-7 shadow-2xl relative border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    Stock Audit Adjustment
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Modify structural parameters of product warehouse volumes.</p>
                </div>
                <button 
                  onClick={() => setModalOpen(false)} 
                  className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="mb-5 bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs font-semibold text-rose-800 leading-relaxed shadow-xs">
                  {formError}
                </div>
              )}

              <form onSubmit={handleStockAdjust} className="space-y-5 text-sm">
                
                <div>
                  <label className="block text-slate-500 font-bold mb-1.5 uppercase tracking-wider text-[10px]">Select Target Asset *</label>
                  {products.length > 0 ? (
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all text-sm cursor-pointer font-medium"
                    >
                      {products.map(p => (
                        <option key={p._id} value={p._id}>{p.name} — [SKU: {p.sku} | In-Stock: {p.quantity}]</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      disabled
                      placeholder="No active inventory structures registered."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 focus:outline-hidden"
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1.5 uppercase tracking-wider text-[10px]">Adjustment Protocol *</label>
                    <select
                      value={adjustmentType}
                      onChange={(e) => setAdjustmentType(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all text-sm cursor-pointer font-medium"
                    >
                      <option value="in">Increase Quantity (Stock In)</option>
                      <option value="out">Decrease Quantity (Stock Out)</option>
                      <option value="adjustment">Physical Override (Absolute)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1.5 uppercase tracking-wider text-[10px]">Delta Variance Quantity *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-hidden focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1.5 uppercase tracking-wider text-[10px]">Justification Log Reason *</label>
                  <textarea
                    rows="3"
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Provide detailed, audit-compliant description notes regarding this physical change..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all text-sm placeholder-slate-400 leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100 mt-6">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || products.length === 0}
                    className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer text-sm shadow-md shadow-sky-600/5"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Commit Ledger Entry</span>
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}