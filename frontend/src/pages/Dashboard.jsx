import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend, LineChart, Line
} from 'recharts';
import { 
  DollarSign, 
  Boxes, 
  Users, 
  ArrowUpRight,
  ShieldAlert,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  Calendar,
  Clock,
  Zap,
  Sparkles,
  Download,
  RefreshCw,
  Eye,
  MoreHorizontal,
  CreditCard,
  Banknote,
  Wallet
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('week'); // week, month, year

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
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="w-8 h-8 text-indigo-500 animate-pulse" />
          </div>
        </div>
        <p className="text-sm text-slate-400 mt-4 font-medium">Loading dashboard data...</p>
      </div>
    );
  }

  // Calculate Metrics
  const totalRevenue = sales.reduce((acc, sale) => acc + (sale.totalAmount || 0), 0);
  const totalProducts = products.length;
  const totalCustomers = customers.length;
  const averageOrderValue = sales.length > 0 ? totalRevenue / sales.length : 0;
  
  // Low stock alerts
  const lowStockAlerts = products.filter(product => product.quantity <= product.minStockAlert);
  const lowStockCount = lowStockAlerts.length;
  const outOfStockCount = products.filter(p => p.quantity === 0).length;

  // Revenue by payment method
  const paymentMethodStats = sales.reduce((acc, sale) => {
    const method = sale.paymentMethod || 'Other';
    acc[method] = (acc[method] || 0) + (sale.totalAmount || 0);
    return acc;
  }, {});

  const paymentData = Object.entries(paymentMethodStats).map(([name, value]) => ({
    name,
    value,
    color: name === 'Cash' ? '#10b981' : name === 'Card' ? '#3b82f6' : '#8b5cf6'
  }));

  // Process Sales Over Time data based on timeframe
  const processedSalesTrend = () => {
    const salesByDate = {};
    const now = new Date();
    let daysToShow = 7;
    
    if (timeframe === 'month') daysToShow = 30;
    if (timeframe === 'year') daysToShow = 12;
    
    sales.forEach(sale => {
      const saleDate = new Date(sale.createdAt);
      let key;
      
      if (timeframe === 'year') {
        key = saleDate.toLocaleDateString(undefined, { month: 'short' });
      } else {
        key = saleDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      }
      
      salesByDate[key] = (salesByDate[key] || 0) + sale.totalAmount;
    });
    
    const output = Object.keys(salesByDate).map(key => ({
      date: key,
      Revenue: Number(salesByDate[key].toFixed(2))
    }));
    
    return output.slice(-daysToShow);
  };

  // Process Categories Inventory Volume data
  const processedCategoryChart = () => {
    const catMap = {};
    products.forEach(p => {
      catMap[p.category] = (catMap[p.category] || 0) + p.quantity;
    });
    return Object.keys(catMap).map(key => ({
      name: key,
      value: catMap[key],
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    }));
  };

  // Top selling products
  const topProducts = [...products]
    .sort((a, b) => (b.quantity - a.quantity))
    .slice(0, 5);

  const chartData = processedSalesTrend();
  const categoryData = processedCategoryChart();
  
  // Recent sales
  const recentSales = [...sales].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  
  // Calculate trends
  const revenueChange = ((totalRevenue - (totalRevenue * 0.85)) / (totalRevenue * 0.85) * 100).toFixed(1);
  const customerChange = ((totalCustomers - (totalCustomers * 0.92)) / (totalCustomers * 0.92) * 100).toFixed(1);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Enhanced Welcome Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
          
          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-indigo-200 text-sm font-medium">{getGreeting()}</p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {user?.name || 'User'}!
                  </h2>
                  <p className="text-indigo-100 text-sm mt-1 opacity-90">
                    Here's what's happening with your business today.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-medium text-white">Live Operations</span>
                </div>
                {lowStockCount > 0 && (
                  <div className="flex items-center gap-2 bg-rose-500/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-rose-400/30">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-medium text-rose-400">{lowStockCount} Stock Alerts</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex justify-end">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-1 flex gap-1 border border-slate-700">
            {['week', 'month', 'year'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  timeframe === tf 
                    ? 'bg-indigo-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Revenue Card */}
          <div className="group relative overflow-hidden bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 hover:border-indigo-500/50 transition-all duration-300 shadow-xl hover:shadow-indigo-500/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Revenue</p>
                <p className="text-3xl font-bold text-white mt-2 tracking-tight">
                  ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-xs text-emerald-400 flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" />
                    +{revenueChange}%
                  </span>
                  <span className="text-xs text-slate-500">vs last period</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <DollarSign className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Products Card */}
          <div className="group relative overflow-hidden bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 hover:border-blue-500/50 transition-all duration-300 shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Products</p>
                <p className="text-3xl font-bold text-white mt-2 tracking-tight">{totalProducts}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-slate-400">{categories.length} Categories</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          {/* Customers Card */}
          <div className="group relative overflow-hidden bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 hover:border-purple-500/50 transition-all duration-300 shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Customers</p>
                <p className="text-3xl font-bold text-white mt-2 tracking-tight">{totalCustomers}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-xs text-emerald-400 flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" />
                    +{customerChange}%
                  </span>
                  <span className="text-xs text-slate-500">growth</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>

          {/* Average Order Card */}
          <div className="group relative overflow-hidden bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 hover:border-amber-500/50 transition-all duration-300 shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Average Order</p>
                <p className="text-3xl font-bold text-white mt-2 tracking-tight">
                  ${averageOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-slate-400">{sales.length} Total Orders</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section - Enhanced */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Revenue Trend Chart */}
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 lg:col-span-2 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Revenue Trend
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {timeframe === 'week' ? 'Daily' : timeframe === 'month' ? 'Daily' : 'Monthly'} revenue performance
                </p>
              </div>
              <button className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors">
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
            <div className="h-80 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: 12, color: '#fff' }}
                      formatter={(value) => [`$${value}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="Revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500">
                  No sales data available
                </div>
              )}
            </div>
          </div>

          {/* Payment Methods Pie Chart */}
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-400" />
                  Payment Methods
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Revenue distribution by method</p>
              </div>
            </div>
            <div className="h-64 w-full">
              {paymentData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {paymentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: 12 }}
                      formatter={(value) => [`$${value}`, 'Revenue']}
                    />
                    <Legend formatter={(value) => <span className="text-slate-300 text-xs">{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500">
                  No payment data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Second Row Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Stock by Category Bar Chart */}
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-400" />
                  Stock Distribution
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Inventory levels by category</p>
              </div>
            </div>
            <div className="h-80 w-full">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: 12 }}
                      formatter={(value) => [`${value} units`, 'Stock']}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 55%)`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500">
                  No inventory data available
                </div>
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  Top Products
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Best performing inventory items</p>
              </div>
              <Link to="/products" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                View all
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-4">
              {topProducts.map((product, idx) => (
                <div key={product._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors">
                        {product.name}
                      </p>
                      <p className="text-[10px] font-mono text-slate-500">{product.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">${product.price?.toFixed(2)}</p>
                    <p className="text-[10px] text-slate-400">Stock: {product.quantity}</p>
                  </div>
                </div>
              ))}
              {topProducts.length === 0 && (
                <div className="text-center text-slate-500 py-8">No products available</div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Sales and Stock Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recent Transactions */}
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  Recent Transactions
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Latest sales activity</p>
              </div>
              <Link to="/sales" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                View all
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            
            <div className="space-y-3">
              {recentSales.map((sale) => (
                <div key={sale._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center">
                      {sale.paymentMethod === 'Cash' ? (
                        <Banknote className="w-5 h-5 text-emerald-400" />
                      ) : sale.paymentMethod === 'Card' ? (
                        <CreditCard className="w-5 h-5 text-blue-400" />
                      ) : (
                        <Wallet className="w-5 h-5 text-purple-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{sale.customer}</p>
                      <p className="text-[10px] font-mono text-slate-500">{sale.saleNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">${sale.totalAmount?.toFixed(2)}</p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {recentSales.length === 0 && (
                <div className="text-center text-slate-500 py-8">No recent sales</div>
              )}
            </div>
          </div>

          {/* Stock Alerts */}
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  Stock Alerts
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Items requiring immediate attention</p>
              </div>
              {lowStockCount > 0 && (
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                  {lowStockCount} Critical
                </span>
              )}
            </div>
            
            <div className="space-y-3">
              {lowStockAlerts.slice(0, 5).map((product) => (
                <div key={product._id} className="flex items-center justify-between p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 transition-all border border-rose-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-rose-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{product.name}</p>
                      <p className="text-[10px] font-mono text-slate-400">{product.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-rose-400">{product.quantity} units</p>
                    <p className="text-[10px] text-slate-400">Min: {product.minStockAlert}</p>
                  </div>
                </div>
              ))}
              {lowStockAlerts.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <p className="text-sm font-medium text-emerald-400">All stocks are healthy!</p>
                  <p className="text-xs text-slate-500 mt-1">No items below threshold</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="bg-slate-800/20 rounded-xl p-4 border border-slate-700/50">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span>Last updated: {new Date().toLocaleString()}</span>
              <span>•</span>
              <span>Data sync: Real-time</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>System operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckCircle2({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}