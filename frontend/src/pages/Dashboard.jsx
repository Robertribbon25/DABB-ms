import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell
} from 'recharts';
import { 
  DollarSign, 
  Boxes, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  ShoppingBag, 
  ArrowUpRight,
  ShieldAlert
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
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
  // Group by date
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
    <div className="space-y-10">
      {/* Welcome Board */}
      <div className="bg-slate-900/40 p-10 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black font-display text-white tracking-tight">
            Greetings, {user?.name || 'User'}!
          </h2>
          <p className="text-xs text-slate-400 mt-2 max-w-xl font-medium tracking-wide">
            Here's the operational overview for DAB Enterprise Ltd. You have <span className="font-bold text-red-400">{lowStockCount} inventory alert{lowStockCount === 1 ? '' : 's'}</span> active.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/25 text-[10px] font-black uppercase tracking-[0.15em] text-emerald-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Operational Live</span>
        </div>
      </div>

      {/* Primary KPI Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI: Total Sales */}
        <div className="border-l-2 border-emerald-500 pl-6 py-4 bg-slate-900/10 hover:bg-slate-900/20 transition-all">
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">Gross Sales</div>
          <div className="text-4xl font-black text-white tracking-tighter mt-1">
            ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-emerald-400 mt-2 uppercase font-bold tracking-wider flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>+18.3% YEAR OVER YEAR</span>
          </div>
        </div>

        {/* KPI: Active Stock items */}
        <div className="border-l-2 border-slate-700 pl-6 py-4 bg-slate-900/10 hover:bg-slate-900/20 transition-all">
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">Active SKUs</div>
          <div className="text-4xl font-black text-white tracking-tighter mt-1">
            {totalProducts}
          </div>
          <div className="text-[10px] text-slate-400 mt-2 uppercase font-semibold">
            Across {categories.length || 4} Categories
          </div>
        </div>

        {/* KPI: CRM Clients count */}
        <div className="border-l-2 border-slate-700 pl-6 py-4 bg-slate-900/10 hover:bg-slate-900/20 transition-all">
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">Customers</div>
          <div className="text-4xl font-black text-white tracking-tighter mt-1">
            {totalCustomers}
          </div>
          <div className="text-[10px] text-emerald-400 mt-2 uppercase font-bold tracking-wider">
            High Client Retention
          </div>
        </div>

        {/* KPI: Low Stock Alerts */}
        <div className={`border-l-2 pl-6 py-4 bg-slate-900/10 hover:bg-slate-900/20 transition-all ${
          lowStockCount > 0 ? 'border-red-500' : 'border-slate-700'
        }`}>
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">Stock Alerts</div>
          <div className={`text-4xl font-black tracking-tighter mt-1 ${
            lowStockCount > 0 ? 'text-red-400' : 'text-white'
          }`}>
            {lowStockCount}
          </div>
          <div className={`text-[10px] mt-2 uppercase font-bold tracking-wider ${
            lowStockCount > 0 ? 'text-red-400 animate-pulse' : 'text-slate-400'
          }`}>
            {lowStockCount > 0 ? 'Urgent Reorder Needed' : 'Inventory Healthy'}
          </div>
        </div>
      </div>

      {/* GRAPH AND STATS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART: Revenue Trends */}
        <div className="bg-slate-950/20 p-6 rounded-2xl border border-slate-800/80 lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Sales Revenue Trend</h4>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1 font-semibold">Daily transaction aggregates</p>
            </div>
          </div>
          <div className="h-68 w-full text-xs font-mono">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: '10px' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: '10px' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
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
        <div className="bg-slate-950/20 p-6 rounded-2xl border border-slate-800/80 space-y-6">
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Stock Volume by Category</h4>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1 font-semibold font-sans">Total item counts per label</p>
          </div>
          <div className="h-68 w-full text-xs font-mono">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="category" tick={{ fill: '#64748b', fontSize: '10px' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: '10px' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                    formatter={(value) => [`${value} units`, 'Inventory']} 
                  />
                  <Bar dataKey="StockUnits" radius={[4, 4, 0, 0]}>
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
        <div className="bg-slate-950/20 p-6 rounded-2xl border border-slate-800/80 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Recent Sales Ledger</h4>
            <Link to="/sales" className="text-[10px] uppercase font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer flex items-center gap-1">
              <span>View all sales</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-400">
              <thead className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-900/40 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Sale ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {sales.length > 0 ? (
                  sales.slice(-5).reverse().map((sale) => (
                    <tr key={sale._id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-300">{sale.saleNumber}</td>
                      <td className="py-3 px-4 text-slate-200">{sale.customer}</td>
                      <td className="py-3 px-4 font-bold text-white">${sale.totalAmount?.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex px-2 py-0.5 rounded text-[9px] bg-slate-850 text-slate-300 font-bold uppercase tracking-wider border border-slate-800">
                          {sale.paymentMethod}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-slate-600 font-mono uppercase tracking-wider text-[10px]">No sales logged.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts Table */}
        <div className="bg-slate-950/20 p-6 rounded-2xl border border-slate-800/80 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Depleted Stock Alerts</h4>
            <span className="px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest bg-red-400/10 text-red-400 border border-red-500/20 animate-pulse">
              Reorder Needed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-400">
              <thead className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-900/40 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Min Alert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {lowStockAlerts.length > 0 ? (
                  lowStockAlerts.slice(0, 5).map((prod) => (
                    <tr key={prod._id} className="hover:bg-red-500/5 transition-colors">
                      <td className="py-3 px-4 text-slate-200 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-red-500" />
                        <span>{prod.name}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">{prod.sku}</td>
                      <td className="py-3 px-4 font-bold text-red-400">{prod.quantity}</td>
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{prod.minStockAlert}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-emerald-400 font-bold uppercase tracking-widest text-[10px]">
                      🎉 Outstanding! All product stocks are healthy.
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
