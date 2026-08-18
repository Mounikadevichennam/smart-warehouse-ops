import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  ShoppingCart,
  Building2,
  Boxes,
  ShieldCheck,
  Truck,
  Activity,
  Layers,
  MapPin,
  Lock,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

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
    <div className="login-split-wrapper">
      {/* LEFT SIDE: WAREHOUSE FULFILLMENT VISUAL & JOURNEY */}
      <div className="login-left-panel">
        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* Brand Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                backgroundColor: '#2563EB',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 8px 20px rgba(37, 99, 235, 0.4)',
              }}
            >
              <Package size={26} />
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                SMART WAREHOUSE OPS
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#60A5FA', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                LOGISTICS FULFILLMENT PLATFORM
              </div>
            </div>
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '8px', lineHeight: '1.3' }}>
            End-to-End Order Traceability & Warehouse Fulfillment
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '28px', maxWidth: '520px', lineHeight: '1.5' }}>
            Unified real-time visibility from customer order checkout through automated warehouse assignment, picking, packing, quality control, and dispatch.
          </p>

          {/* SVG Warehouse Conveyor Visual Graphic */}
          <div
            style={{
              backgroundColor: 'rgba(15, 31, 53, 0.75)',
              border: '1px solid rgba(217, 226, 236, 0.15)',
              borderRadius: '16px',
              padding: '20px 24px',
              marginBottom: '28px',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
              LIVE CONVEYOR & PIPELINE MONITOR
            </div>

            {/* Inline SVG Warehouse Belt Illustration */}
            <div style={{ width: '100%', height: '100px', position: 'relative' }}>
              <svg width="100%" height="100px" viewBox="0 0 500 100" preserveAspectRatio="xMidYMid meet">
                {/* Background Warehouse Rack Lines */}
                <path d="M 20 20 L 480 20" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" strokeDasharray="4 4" />
                <path d="M 20 50 L 480 50" stroke="rgba(37, 99, 235, 0.2)" strokeWidth="2" />
                <path d="M 20 80 L 480 80" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" strokeDasharray="4 4" />

                {/* Conveyor Belt Rollers */}
                {[40, 90, 140, 190, 240, 290, 340, 390, 440].map((cx, i) => (
                  <circle key={i} cx={cx} cy="50" r="5" fill="#162A44" stroke="#2563EB" strokeWidth="1.5" />
                ))}

                {/* Moving Package Box on Conveyor */}
                <g className="conveyor-package">
                  <rect x="0" y="32" width="28" height="24" rx="4" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1.5" />
                  <path d="M 14 32 L 14 56" stroke="#FFFFFF" strokeWidth="1" />
                  <path d="M 0 44 L 28 44" stroke="#FFFFFF" strokeWidth="1" />
                </g>

                {/* Station Checkpoints */}
                <circle cx="50" cy="50" r="10" fill="#10B981" />
                <circle cx="150" cy="50" r="10" fill="#2563EB" />
                <circle cx="250" cy="50" r="10" fill="#2563EB" />
                <circle cx="350" cy="50" r="10" fill="#2563EB" />
                <circle cx="450" cy="50" r="10" fill="#10B981" />
              </svg>
            </div>
          </div>

          {/* Fulfillment Journey Milestone Timeline */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '28px' }}>
            {[
              { icon: ShoppingCart, label: 'Customer Order', status: 'PLACED' },
              { icon: Building2, label: 'Warehouse Assign', status: 'ALLOCATED' },
              { icon: Boxes, label: 'Item Picking', status: 'PICKED' },
              { icon: Package, label: 'Packaging', status: 'PACKED' },
              { icon: ShieldCheck, label: 'Quality Check', status: 'QC_PASSED' },
              { icon: Truck, label: 'Dispatch', status: 'DISPATCHED' },
            ].map((step, idx) => {
              const IconComp = step.icon;
              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: idx === 0 || idx === 1 ? 'rgba(37, 99, 235, 0.25)' : 'rgba(22, 42, 68, 0.6)',
                    border: idx === 0 || idx === 1 ? '1px solid #2563EB' : '1px solid rgba(217, 226, 236, 0.12)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <IconComp size={18} style={{ color: idx === 0 || idx === 1 ? '#60A5FA' : '#94A3B8' }} />
                    <span style={{ fontSize: '0.65rem', fontWeight: '800', color: idx === 0 || idx === 1 ? '#60A5FA' : '#64748B' }}>
                      0{idx + 1}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.775rem', fontWeight: '800', color: '#FFFFFF' }}>{step.label}</div>
                  <div style={{ fontSize: '0.675rem', color: idx === 0 || idx === 1 ? '#93C5FD' : '#64748B', fontWeight: '600' }}>
                    {step.status}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Feature Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#94A3B8' }}>
              <Activity size={16} style={{ color: '#2563EB' }} /> Order Traceability
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#94A3B8' }}>
              <Layers size={16} style={{ color: '#10B981' }} /> Warehouse Fulfillment
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#94A3B8' }}>
              <MapPin size={16} style={{ color: '#60A5FA' }} /> Live Stepper Tracking
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#94A3B8' }}>
              <Lock size={16} style={{ color: '#F59E0B' }} /> Role-Based Access
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: CLEAN WHITE LOGIN CARD */}
      <div className="login-right-panel">
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #D9E2EC',
            boxShadow: '0 20px 40px -15px rgba(15, 31, 53, 0.08)',
            padding: '36px 32px',
            width: '100%',
            maxWidth: '440px',
          }}
        >
          {/* Header Branding */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#2563EB',
                borderRadius: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                marginBottom: '10px',
                boxShadow: '0 6px 16px rgba(37, 99, 235, 0.3)',
              }}
            >
              <Package size={26} />
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#0F1F35', letterSpacing: '-0.02em' }}>
              Sign In to Your Account
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '4px' }}>
              Select portal role & enter authorized credentials
            </p>
          </div>

          {/* Portal Selection Tabs */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#F1F5F9',
              borderRadius: '10px',
              padding: '4px',
              marginBottom: '20px',
              border: '1px solid #D9E2EC',
            }}
          >
            {[
              { id: 'CUSTOMER', label: 'Customer' },
              { id: 'MANAGEMENT', label: 'Management' },
              { id: 'WORKER', label: 'Worker' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                style={{
                  flex: 1,
                  padding: '9px 6px',
                  borderRadius: '7px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeTab === tab.id ? '#2563EB' : 'transparent',
                  color: activeTab === tab.id ? '#FFFFFF' : '#64748B',
                  boxShadow: activeTab === tab.id ? '0 2px 8px rgba(37, 99, 235, 0.25)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Error Banner */}
          {error && (
            <div
              style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#DC2626',
                padding: '10px 14px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '0.825rem',
                fontWeight: '600',
              }}
            >
              {error}
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0F1F35', marginBottom: '6px' }}>
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
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #D9E2EC',
                  color: '#0F172A',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0F1F35', marginBottom: '6px' }}>
                Password
              </label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #D9E2EC',
                  color: '#0F172A',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            {activeTab === 'WORKER' && (
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0F1F35', marginBottom: '6px' }}>
                  Select Worker Operational Role
                </label>
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
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #D9E2EC',
                    color: '#0F172A',
                    padding: '11px 14px',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
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
              style={{
                width: '100%',
                marginTop: '8px',
                padding: '12px',
                fontSize: '0.9rem',
                fontWeight: '800',
                backgroundColor: '#2563EB',
                borderRadius: '8px',
              }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : `LOG IN TO ${activeTab} PORTAL`}
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Hackathon Quick Demo Credentials */}
          <div
            style={{
              marginTop: '20px',
              padding: '12px 14px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #D9E2EC',
              borderRadius: '10px',
              fontSize: '0.75rem',
              color: '#64748B',
            }}
          >
            <div style={{ fontWeight: '800', color: '#0F1F35', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={13} style={{ color: '#10B981' }} /> Demo Quick Credentials:
            </div>
            <div>• Customer: <strong style={{ color: '#2563EB' }}>customer@demo.com</strong> / Demo@123</div>
            <div>• Manager: <strong style={{ color: '#2563EB' }}>manager@warehouse.com</strong> / admin123</div>
            <div>• Worker: <strong style={{ color: '#2563EB' }}>picker1@warehouse.com</strong> / worker123</div>
          </div>
        </div>
      </div>
    </div>
  );
};
