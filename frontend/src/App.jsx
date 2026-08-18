import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { ManagerDashboard } from './pages/ManagerDashboard';
import { SupervisorDashboard } from './pages/SupervisorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { WorkerPortal } from './pages/WorkerPortal';
import { CustomerPortal } from './pages/CustomerPortal';
import './styles/index.css';

const MainApp = () => {
  const { account } = useAuth();

  if (!account) {
    return <LoginPage />;
  }

  const renderDashboardByRole = () => {
    switch (account.role) {
      case 'MANAGER':
        return <ManagerDashboard />;
      case 'SUPERVISOR':
        return <SupervisorDashboard />;
      case 'ADMIN':
        return <AdminDashboard />;
      case 'CUSTOMER':
        return <CustomerPortal />;
      case 'Picker':
      case 'Packer':
      case 'QC':
      case 'Dispatch':
        return <WorkerPortal />;
      default:
        return <div style={{ padding: '32px', color: '#ef4444' }}>Unauthorized or unknown role</div>;
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      {renderDashboardByRole()}
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
