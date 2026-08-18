import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [account, setAccount] = useState(() => {
    const saved = localStorage.getItem('account');
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(false);

  const loginManagement = async (email, password) => {
    setLoading(true);
    try {
      const data = await api.loginManagement({ email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('account', JSON.stringify(data.user));
      setAccount(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const loginWorker = async (email, password, selectedRole) => {
    setLoading(true);
    try {
      const data = await api.loginWorker({ email, password, selectedRole });
      localStorage.setItem('token', data.token);
      localStorage.setItem('account', JSON.stringify(data.worker));
      setAccount(data.worker);
      return data.worker;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('account');
    setAccount(null);
  };

  return (
    <AuthContext.Provider value={{ account, loading, loginManagement, loginWorker, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
