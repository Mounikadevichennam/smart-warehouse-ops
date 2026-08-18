import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Package, LogOut } from 'lucide-react';

export const Navbar = () => {
  const { account, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="brand-icon">
          <Package size={20} />
        </div>
        <span>SMART WAREHOUSE OPS</span>
      </div>

      {account && (
        <div className="user-profile">
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#FFFFFF' }}>{account.name}</div>
            <div style={{ fontSize: '0.75rem', color: '#B8C4D8' }}>{account.email}</div>
          </div>
          <span className={`role-badge ${account.role}`}>{account.role}</span>
          <button className="btn btn-secondary" onClick={logout} style={{ padding: '6px 12px' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </nav>
  );
};
