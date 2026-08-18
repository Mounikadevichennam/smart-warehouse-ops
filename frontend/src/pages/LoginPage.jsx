import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Package } from 'lucide-react';

export const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('CUSTOMER'); // CUSTOMER vs MANAGEMENT vs WORKER
  const [email, setEmail] = useState('customer@demo.com');
  const [password, setPassword] = useState('Demo@123');
  const [selectedRole, setSelectedRole] = useState('Picker');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginManagement, loginWorker } = useAuth();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
    if (tab === 'CUSTOMER') {
      setEmail('customer@demo.com');
      setPassword('Demo@123');
    } else if (tab === 'MANAGEMENT') {
      setEmail('manager@warehouse.com');
      setPassword('admin123');
    } else {
      setEmail('picker1@warehouse.com');
      setPassword('worker123');
      setSelectedRole('Picker');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (activeTab === 'CUSTOMER' || activeTab === 'MANAGEMENT') {
        await loginManagement(email, password);
      } else {
        await loginWorker(email, password, selectedRole);
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              background: 'linear-gradient(135deg, #2563EB, #14B8A6)',
              borderRadius: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              marginBottom: '12px',
              boxShadow: '0 8px 22px rgba(20, 184, 166, 0.4)',
            }}
          >
            <Package size={28} />
          </div>
          <h2 style={{ fontSize: '1.55rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            SMART WAREHOUSE OPS
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginTop: '4px' }}>
            Customer Order Tracking & Warehouse Fulfillment Portal
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="login-tabs">
          <div
            className={`login-tab ${activeTab === 'CUSTOMER' ? 'active' : ''}`}
            onClick={() => handleTabChange('CUSTOMER')}
          >
            Customer Login
          </div>
          <div
            className={`login-tab ${activeTab === 'MANAGEMENT' ? 'active' : ''}`}
            onClick={() => handleTabChange('MANAGEMENT')}
          >
            Management
          </div>
          <div
            className={`login-tab ${activeTab === 'WORKER' ? 'active' : ''}`}
            onClick={() => handleTabChange('WORKER')}
          >
            Worker
          </div>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#ef4444',
              padding: '12px 14px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '0.85rem',
              fontWeight: '600',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              {activeTab === 'CUSTOMER'
                ? 'Customer Email'
                : activeTab === 'MANAGEMENT'
                ? 'Management Email'
                : 'Worker Email'}
            </label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. customer@demo.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {activeTab === 'WORKER' && (
            <div className="form-group">
              <label>Select Worker Role</label>
              <select
                className="form-control"
                value={selectedRole}
                onChange={(e) => {
                  const role = e.target.value;
                  setSelectedRole(role);
                  if (role === 'Picker') setEmail('picker1@warehouse.com');
                  else if (role === 'Packer') setEmail('packer1@warehouse.com');
                  else if (role === 'QC') setEmail('qc1@warehouse.com');
                  else if (role === 'Dispatch') setEmail('dispatch1@warehouse.com');
                }}
              >
                <option value="Picker">Picker</option>
                <option value="Packer">Packer</option>
                <option value="QC">QC</option>
                <option value="Dispatch">Dispatch</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '12px', padding: '14px', fontSize: '0.95rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : `LOGIN TO ${activeTab} PORTAL`}
          </button>
        </form>

        {/* Demo Quick Credentials Helper */}
        <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.12)', fontSize: '0.75rem', color: '#94A3B8' }}>
          <div style={{ fontWeight: '700', color: '#FFFFFF', marginBottom: '4px' }}>Hackathon Demo Credentials:</div>
          <div>Customer: <code style={{ color: '#14B8A6' }}>customer@demo.com</code> / Demo@123</div>
          <div>Manager: <code style={{ color: '#14B8A6' }}>manager@warehouse.com</code> / admin123</div>
          <div>Worker: <code style={{ color: '#14B8A6' }}>picker1@warehouse.com</code> / worker123 (Picker)</div>
        </div>
      </div>
    </div>
  );
};
