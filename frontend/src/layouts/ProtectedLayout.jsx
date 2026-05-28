import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  LayoutDashboard, 
  Boxes, 
  Users, 
  Truck, 
  History, 
  UserCheck, 
  LogOut, 
  Menu, 
  X, 
  Database,
  Briefcase,
  Layers,
  Sun,
  Moon
} from 'lucide-react';

export default function ProtectedLayout() {
  const { user, logout, dbStatus } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['admin', 'manager', 'sales', 'storekeeper'] },
    { name: 'Categories', path: '/categories', icon: Layers, roles: ['admin', 'manager'] },
    { name: 'Products Catalog', path: '/products', icon: Boxes, roles: ['admin', 'manager', 'storekeeper', 'sales'] },
    { name: 'Inventory Ledger', path: '/inventory', icon: History, roles: ['admin', 'manager', 'storekeeper'] },
    { name: 'Sales Transactions', path: '/sales', icon: History, roles: ['admin', 'manager', 'sales'] },
    { name: 'Customer Directory', path: '/customers', icon: Users, roles: ['admin', 'manager', 'sales'] },
    { name: 'Supplier Accounts', path: '/suppliers', icon: Truck, roles: ['admin', 'manager', 'storekeeper'] },
    { name: 'Employee Directory', path: '/employees', icon: UserCheck, roles: ['admin', 'manager'] },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans select-none">
      {/* SIDEBAR - DESKTOP */}
      <aside className="w-64 bg-slate-950/40 text-slate-100 hidden md:flex flex-col border-r border-slate-800/80">
        <div className="p-8 border-b border-slate-800 bg-slate-950/20">
          <div className="text-2xl font-black tracking-tighter text-emerald-400 font-display">DAB<span className="text-white">.ENT</span></div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mt-1">Enterprise Systems Ltd.</p>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            if (!item.roles.includes(user?.role)) return null;
            const Icon = item.icon;
            const active = currentPath === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
                  active 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-xs' 
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                }`}
              >
                {active ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0"></div>
                ) : (
                  <Icon className="w-4 h-4 shrink-0 text-slate-500" />
                )}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Database Mode Status */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/20 text-xs text-slate-400 space-y-1">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${dbStatus.connected ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
            <div>
              <span className="font-bold uppercase tracking-widest text-[9px] text-slate-500">API Connection: SECURE</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
            Engine: <span className="text-slate-400 font-mono text-[9px] lowercase">{dbStatus.mode}</span>
          </div>
        </div>

        {/* User profile actions */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-slate-850 flex items-center justify-center font-bold text-emerald-400 text-xs border border-slate-700 font-mono">
                {user?.name?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-xs font-black text-slate-200 font-display">{user?.name}</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{user?.role}</div>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              title="Sign Out"
              className="p-1 px-1.5 rounded-md hover:bg-slate-850 text-slate-500 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-slate-950/20 border-b border-slate-800/80 px-6 md:px-10 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-lg text-slate-400 md:hidden hover:bg-slate-850 hover:text-white focus:outline-none cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xs md:text-sm font-black uppercase tracking-[0.3em] text-slate-400 font-display">
              {menuItems.find(item => item.path === currentPath)?.name || 'Operational Overview'}
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Market Status</div>
              <div className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Live / Operational</div>
            </div>
            
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              className="w-10 h-10 border border-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:bg-white/5 transition-colors cursor-pointer"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5 text-amber-400 animate-spin-slow" />}
            </button>

            <div className="w-10 h-10 border border-slate-800 rounded-full hidden sm:flex items-center justify-center text-slate-400 text-xs font-bold hover:bg-white/5 cursor-pointer">?</div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-x-hidden p-6 md:p-10">
          <Outlet />
        </main>
      </div>

      {/* MOBILE DRAWER SIDEBAR */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          {/* Drawer content */}
          <div className="relative w-72 max-w-sm bg-slate-900 text-slate-100 flex flex-col z-10 transition-transform border-r border-slate-800">
            <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950/40">
              <div className="flex items-center gap-3">
                <div className="text-xl font-black tracking-tighter text-emerald-400 font-display">DAB<span className="text-white">.ENT</span></div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 -mr-2 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
              {menuItems.map((item) => {
                if (!item.roles.includes(user?.role)) return null;
                const Icon = item.icon;
                const active = currentPath === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                      active 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                    }`}
                  >
                    {active ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0"></div>
                    ) : (
                      <Icon className="w-4 h-4 shrink-0 text-slate-500" />
                    )}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-6 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <span className="font-bold tracking-wider uppercase text-[9px] text-slate-500">Live</span>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-slate-800/40 hover:bg-rose-950/30 px-3 py-2 rounded-md transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
