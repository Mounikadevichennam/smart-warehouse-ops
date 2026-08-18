import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ShieldCheck, Package, MapPin, Users, CheckCircle2, RefreshCw } from 'lucide-react';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('RESTOCK'); // RESTOCK, PRODUCTS, WORKERS, LOCATIONS
  const [restockRequests, setRestockRequests] = useState([]);
  const [products, setProducts] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const restockRes = await api.getRestockRequests();
      setRestockRequests(restockRes || []);

      const invRes = await api.getInventory();
      setProducts(invRes.products || []);

      const workersRes = await api.getWorkers();
      setWorkers(workersRes || []);

      const locsRes = await api.getLocations();
      setLocations(locsRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConfirmRestock = async (restockId) => {
    try {
      await api.confirmRestock(restockId);
      alert('Stock confirmed! Inventory updated and paused orders re-evaluated.');
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading && restockRequests.length === 0) {
    return <div style={{ padding: '32px', color: '#94a3b8' }}>Loading Master Data...</div>;
  }

  const pendingRestocks = restockRequests.filter((r) => r.status === 'REQUESTED');

  return (
    <div className="main-content">
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.02em' }}>
            System Master Data & Stock Receiving Center
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            Master Data Administration, Product Catalog & Stock Receiving Confirmation
          </p>
        </div>
        <button className="btn btn-secondary" onClick={fetchData}>
          <RefreshCw size={16} /> Refresh Data
        </button>
      </div>

      {/* Admin Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #334155', marginBottom: '24px' }}>
        <button
          className={`btn ${activeTab === 'RESTOCK' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('RESTOCK')}
        >
          <Package size={16} /> Stock Receiving Desk ({pendingRestocks.length} Pending)
        </button>
        <button
          className={`btn ${activeTab === 'PRODUCTS' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('PRODUCTS')}
        >
          <Package size={16} /> Product Master Catalog ({products.length})
        </button>
        <button
          className={`btn ${activeTab === 'WORKERS' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('WORKERS')}
        >
          <Users size={16} /> User & Worker Records ({workers.length})
        </button>
        <button
          className={`btn ${activeTab === 'LOCATIONS' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('LOCATIONS')}
        >
          <MapPin size={16} /> Warehouse Locations ({locations.length})
        </button>
      </div>

      {/* Tab 1: Stock Receiving Desk */}
      {activeTab === 'RESTOCK' && (
        <div className="card">
          <div className="card-title">
            <span>Stock Receiving & Confirmation Center</span>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Request #</th>
                  <th>SKU</th>
                  <th>Product Name</th>
                  <th>Requested Quantity</th>
                  <th>Requested By</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {restockRequests.map((r) => (
                  <tr key={r._id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#06b6d4' }}>
                      {r.requestNumber}
                    </td>
                    <td style={{ fontWeight: '700' }}>{r.productId?.sku}</td>
                    <td>{r.productId?.name}</td>
                    <td style={{ fontWeight: '800', color: '#f59e0b' }}>+{r.requestedQuantity} units</td>
                    <td>{r.requestedByUserId?.name || 'Manager'}</td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: r.status === 'CONFIRMED_RECEIVED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: r.status === 'CONFIRMED_RECEIVED' ? '#34d399' : '#fbbf24',
                        }}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td>
                      {r.status === 'REQUESTED' ? (
                        <button
                          className="btn btn-success"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          onClick={() => handleConfirmRestock(r._id)}
                        >
                          <CheckCircle2 size={16} /> Confirm Stock Received
                        </button>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                          Confirmed at {new Date(r.receivedAt).toLocaleTimeString()}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Products Catalog */}
      {activeTab === 'PRODUCTS' && (
        <div className="card">
          <div className="card-title">
            <span>Products Master Data Catalog</span>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>In Stock</th>
                  <th>Reserved</th>
                  <th>Reorder Limit</th>
                  <th>Warehouse Location</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#06b6d4' }}>{p.sku}</td>
                    <td style={{ fontWeight: '700' }}>{p.name}</td>
                    <td>{p.category}</td>
                    <td style={{ fontWeight: '800', color: '#10b981' }}>{p.quantityInStock}</td>
                    <td style={{ color: '#f59e0b' }}>{p.quantityReserved}</td>
                    <td>{p.reorderThreshold} units</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>
                      {`${p.location?.zone} → ${p.location?.rack} → ${p.location?.bin}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Workers & Users */}
      {activeTab === 'WORKERS' && (
        <div className="card">
          <div className="card-title">
            <span>Warehouse Workers & Personnel Directory</span>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>System Role</th>
                  <th>Current Status</th>
                  <th>Completed Tasks Today</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((w) => (
                  <tr key={w._id}>
                    <td style={{ fontWeight: '700' }}>{w.name}</td>
                    <td>{w.email}</td>
                    <td><span className={`role-badge ${w.role}`}>{w.role}</span></td>
                    <td style={{ color: w.status === 'BUSY' ? '#f59e0b' : '#10b981', fontWeight: '700' }}>
                      ● {w.status}
                    </td>
                    <td>{w.completedTasksCount} tasks completed</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Warehouse Locations */}
      {activeTab === 'LOCATIONS' && (
        <div className="card">
          <div className="card-title">
            <span>Warehouse Zones, Racks & Bins Master</span>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Zone</th>
                  <th>Rack</th>
                  <th>Bin</th>
                  <th>Capacity</th>
                  <th>Current Occupancy</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((l) => (
                  <tr key={l._id}>
                    <td style={{ fontWeight: '700', color: '#3b82f6' }}>{l.zone}</td>
                    <td>{l.rack}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700' }}>{l.bin}</td>
                    <td>{l.capacity} units</td>
                    <td>{l.currentOccupancy} units</td>
                    <td><span className="badge badge-status">{l.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
