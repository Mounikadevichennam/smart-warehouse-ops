import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Layers,
  AlertTriangle,
  Package,
  Users,
  MapPin,
  CheckSquare,
  Activity,
  Box,
} from 'lucide-react';

export const Sidebar = ({ activeSection, setActiveSection }) => {
  const { account } = useAuth();
  if (!account) return null;

  const role = account.role;

  const getMenuItems = () => {
    if (role === 'MANAGER') {
      return [
        { id: 'OVERVIEW', label: 'Executive Overview', icon: LayoutDashboard },
        { id: 'PIPELINE', label: 'Fulfillment Pipeline', icon: Layers },
        { id: 'INVENTORY', label: 'Inventory Alerts', icon: Package },
        { id: 'ACTIVITY', label: 'Activity Audit Log', icon: Activity },
      ];
    } else if (role === 'SUPERVISOR') {
      return [
        { id: 'EXCEPTIONS', label: 'Exception Desk', icon: AlertTriangle },
        { id: 'WORKERS', label: 'Worker Workloads', icon: Users },
      ];
    } else if (role === 'ADMIN') {
      return [
        { id: 'RESTOCK', label: 'Stock Receiving Desk', icon: Package },
        { id: 'PRODUCTS', label: 'Product Master', icon: Box },
        { id: 'USERS', label: 'Personnel Records', icon: Users },
        { id: 'LOCATIONS', label: 'Locations Master', icon: MapPin },
      ];
    } else {
      // Workers
      return [
        { id: 'WORKSPACE', label: `${role} Workspace`, icon: CheckSquare },
      ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <Package size={22} />
        </div>
        <div className="sidebar-brand-title">SMART WAREHOUSE</div>
      </div>

      <div className="sidebar-menu">
        <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 8px 8px 8px' }}>
          NAVIGATION
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <div
              key={item.id}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveSection && setActiveSection(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <div style={{ fontWeight: '700', color: '#cbd5e1' }}>Smart Warehouse v1.0</div>
        <div>Control Center SaaS</div>
      </div>
    </aside>
  );
};
