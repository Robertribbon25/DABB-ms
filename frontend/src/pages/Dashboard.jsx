import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { 
  DollarSign, 
  Boxes, 
  Users, 
  ArrowUpRight,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesRes, productsRes, customersRes, categoriesRes] = await Promise.all([
          apiClient.get('/sales'),
          apiClient.get('/products'),
          apiClient.get('/customers'),
          apiClient.get('/categories')
        ]);
        setSales(salesRes.data || []);
        setProducts(productsRes.data || []);
        setCustomers(customersRes.data || []);
        setCategories(categoriesRes.data || []);
      } catch (err) {
        console.error('Error fetching dashboard summary:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  // Calculate Metrics
  const totalRevenue = sales.reduce((acc, sale) => acc + (sale.totalAmount || 0), 0);
  const totalProducts = products.length;
  const totalCustomers = customers.length;
  
  // Alert for low stocks
  const lowStockAlerts = products.filter(product => product.quantity <= product.minStockAlert);
  const lowStockCount = lowStockAlerts.length;

  // Process Sales Over Time data for AreaChart
  const processedSalesTrend = () => {
    const dailySales = {};
    sales.forEach(sale => {
      const date = new Date(sale.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      dailySales[date] = (dailySales[date] || 0) + sale.totalAmount;
    });

    const output = Object.keys(dailySales).map(key => ({
      date: key,
      Revenue: Number(dailySales[key].toFixed(2))
    }));
    return output.slice(-7); // Keep recent 7 days
  };

  // Process Categories Inventory Volume data
  const processedCategoryChart = () => {
    const catMap = {};
    products.forEach(p => {
      catMap[p.category] = (catMap[p.category] || 0) + p.quantity;
    });
    return Object.keys(catMap).map(key => ({
      category: key,
      StockUnits: catMap[key]
    }));
  };

  const chartData = processedSalesTrend();
  const categoryData = processedCategoryChart();

  return (
    <div className="p-1 max-w-7xl mx-auto space-y-8 text-slate-300">
      
      {/* Welcome Board */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-8 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="z-10">
          <h2 className="text-3xl font-black font-display text-white tracking-tight">
            Greetings, {user?.name || 'User'}!
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-xl font-medium tracking-wide">
            Here's the operational overview for DAB Enterprise Ltd. You have{' '}
            <span className={`font-bold ${lowStockCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {lowStockCount} inventory alert{lowStockCount === 1 ? '' : 's'}
            </span>{' '}
            active.
          </p>
        </div>
        <div className="z-10 flex items-center gap-2.5 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20 text-xs font-bold uppercase tracking-wider text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Operational Live</span>
        </div>
      </div>

      {/* Primary KPI Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* KPI: Total Sales */}
        <div className="group relative overflow-hidden p-6 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-slate-800/80 hover:border-slate-700/80 transition-all duration-300 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Gross Sales</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform duration-300">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight mt-4">
            ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-emerald-400 mt-3 font-semibold tracking-wide flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.3% YoY growth</span>
          </div>
        </div>

        {/* KPI: Active Stock items */}
        <div className="group relative overflow-hidden p-6 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-slate-800/80 hover:border-slate-700/80 transition-all duration-300 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active SKUs</span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform duration-300">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight mt-4">
            {totalProducts}
          </div>
          <div className="text-xs text-slate-400 mt-3 font-medium">
            Across {categories.length || 4} Categories
          </div>
        </div>

        {/* KPI: CRM Clients count */}
        <div className="group relative overflow-hidden p-6 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-slate-800/80 hover:border-slate-700/80 transition-all duration-300 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Customers</span>
            <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight mt-4">
            {totalCustomers}
          </div>
          <div className="text-xs text-violet-400 mt-3 font-semibold tracking-wide">
            High Client Retention
          </div>
        </div>

        {/* KPI: Low Stock Alerts */}
        <div className={`group relative overflow-hidden p-6 rounded-2xl bg-slate-900/40 backdrop-blur-md border transition-all duration-300 shadow-lg ${
          lowStockCount > 0 ? 'border-rose-500/30 bg-rose-950/5' : 'border-slate-800/80 hover:border-slate-700/80'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Stock Alerts</span>
            <div className={`p-2.5 rounded-xl group-hover:scale-110 transition-transform duration-300 ${
              lowStockCount > 0 ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' : 'bg-slate-800 border border-slate-700 text-slate-400'
            }`}>
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-3xl font-extrabold tracking-tight mt-4 ${
            lowStockCount > 0 ? 'text-rose-400' : 'text-white'
          }`}>
            {lowStockCount}
          </div>
          <div className={`text-xs mt-3 font-semibold tracking-wide ${
            lowStockCount > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-400'
          }`}>
            {lowStockCount > 0 ? 'Urgent Reorder Needed' : 'Inventory Healthy'}
          </div>
        </div>
      </div>

      {/* GRAPH AND STATS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART: Revenue Trends */}
        <div className="bg-slate-900/30 p-6 rounded-2xl border border-slate-800/80 lg:col-span-2 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white tracking-wide">Sales Revenue Trend</h4>
              <p className="text-xs text-slate-500 mt-0.5">Daily transaction performance aggregates</p>
            </div>
          </div>
          <div className="h-72 w-full text-xs font-mono">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: '11px' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: '11px' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                    formatter={(value) => [`$${value}`, 'Revenue']} 
                  />
                  <Area type="monotone" dataKey="Revenue" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-600 font-mono text-xs uppercase tracking-widest">
                No transactions completed yet.
              </div>
            )}
          </div>
        </div>

        {/* CHART: Stock Levels by category */}
        <div className="bg-slate-900/30 p-6 rounded-2xl border border-slate-800/80 space-y-6 shadow-xl">
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide">Stock Volume by Category</h4>
            <p className="text-xs text-slate-500 mt-0.5">Total stock capacity per tag</p>
          </div>
          <div className="h-72 w-full text-xs font-mono">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="category" tick={{ fill: '#64748b', fontSize: '11px' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: '11px' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                    formatter={(value) => [`${value} units`, 'Inventory']} 
                  />
                  <Bar dataKey="StockUnits" radius={[6, 6, 0, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#10b981' : '#334155'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-600 font-mono text-xs uppercase tracking-widest">
                No stock database items available.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RECENT SALES AND STOCK WARNINGS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Transactions List */}
        <div className="bg-slate-900/30 p-6 rounded-2xl border border-slate-800/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h4 className="text-sm font-bold text-white tracking-wide">Recent Sales Ledger</h4>
              <p className="text-xs text-slate-500">Live operational invoices</p>
            </div>
            <Link to="/sales" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors group">
              <span>View all sales</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
          
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
            <table className="w-full text-left text-xs text-slate-400 border-collapse">
              <thead className="text-xs font-semibold text-slate-400 bg-slate-900/70 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Sale ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4 text-right">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 font-medium">
                {sales.length > 0 ? (
                  sales.slice(-5).reverse().map((sale) => (
                    <tr key={sale._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-300">{sale.saleNumber}</td>
                      <td className="py-3 px-4 text-slate-200">{sale.customer}</td>
                      <td className="py-3 px-4 font-bold text-white">${sale.totalAmount?.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] bg-slate-800 text-slate-300 border border-slate-700/50 uppercase tracking-wide font-semibold">
                          {sale.paymentMethod}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-600 font-mono uppercase tracking-wider text-xs">No sales logged.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts Table */}
        <div className="bg-slate-900/30 p-6 rounded-2xl border border-slate-800/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h4 className="text-sm font-bold text-white tracking-wide">Depleted Stock Alerts</h4>
              <p className="text-xs text-slate-500">Critical warehouse limits</p>
            </div>
            {lowStockCount > 0 && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">
                Action Required
              </span>
            )}
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
            <table className="w-full text-left text-xs text-slate-400 border-collapse">
              <thead className="text-xs font-semibold text-slate-400 bg-slate-900/70 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4 text-right">Min Alert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 font-medium">
                {lowStockAlerts.length > 0 ? (
                  lowStockAlerts.slice(0, 5).map((prod) => (
                    <tr key={prod._id} className="hover:bg-rose-500/5 transition-colors">
                      <td className="py-3 px-4 text-slate-200 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
                        <span className="truncate max-w-[140px]">{prod.name}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">{prod.sku}</td>
                      <td className="py-3 px-4 font-bold text-rose-400">{prod.quantity}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500">{prod.minStockAlert}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-emerald-400 font-bold tracking-wide text-xs">
                      🎉 All product stocks are running healthy.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}