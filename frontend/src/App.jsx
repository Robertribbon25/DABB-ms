import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

// Import Pages
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Categories from './pages/Categories.jsx';
import Products from './pages/Products.jsx';
import Inventory from './pages/Inventory.jsx';
import Sales from './pages/Sales.jsx';
import Customers from './pages/Customers.jsx';
import Suppliers from './pages/Suppliers.jsx';
import Employees from './pages/Employees.jsx';

// Import Layout
import ProtectedLayout from './layouts/ProtectedLayout.jsx';

// ProtectedRoute Private Component Guard
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Authentication routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Administrative Dashboard routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <ProtectedLayout />
              </ProtectedRoute>
            }
          >
            {/* Embedded layouts router index */}
            <Route index element={<Dashboard />} />
            
            <Route 
              path="categories" 
              element={
                <ProtectedRoute roles={['admin', 'manager']}>
                  <Categories />
                </ProtectedRoute>
              } 
            />

            <Route path="products" element={<Products />} />
            
            <Route 
              path="inventory" 
              element={
                <ProtectedRoute roles={['admin', 'manager', 'storekeeper']}>
                  <Inventory />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="sales" 
              element={
                <ProtectedRoute roles={['admin', 'manager', 'sales']}>
                  <Sales />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="customers" 
              element={
                <ProtectedRoute roles={['admin', 'manager', 'sales']}>
                  <Customers />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="suppliers" 
              element={
                <ProtectedRoute roles={['admin', 'manager', 'storekeeper']}>
                  <Suppliers />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="employees" 
              element={
                <ProtectedRoute roles={['admin', 'manager']}>
                  <Employees />
                </ProtectedRoute>
              } 
            />
          </Route>

          {/* Catch-all Routing Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
