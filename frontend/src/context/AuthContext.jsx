import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState({ connected: true, mode: 'Local File Storage' });

  useEffect(() => {
    // Load persisted login session on load
    const storedUser = localStorage.getItem('dab_enterprise_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        localStorage.removeItem('dab_enterprise_user');
      }
    }
    setLoading(false);

    // Fetch database active mode
    apiClient.get('/health')
      .then((res) => {
        if (res.data && res.data.database) {
          setDbStatus(res.data.database);
        }
      })
      .catch((err) => {
        console.warn('Backend server unreachable or booting up:', err.message);
      });
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const data = response.data;
      setUser(data);
      localStorage.setItem('dab_enterprise_user', JSON.stringify(data));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please verify credentials.'
      };
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const response = await apiClient.post('/auth/register', { name, email, password, role });
      const data = response.data;
      // Auto-login registered user
      setUser(data);
      localStorage.setItem('dab_enterprise_user', JSON.stringify(data));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed.'
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dab_enterprise_user');
  };

  const hasRole = (roles) => {
    return user && roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, hasRole, dbStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be defined inside an AuthProvider wrapper');
  }
  return context;
};
