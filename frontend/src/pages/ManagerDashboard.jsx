import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';
import { PipelineVisualizer } from '../components/PipelineVisualizer';
import { CreateOrderModal } from '../components/CreateOrderModal';
import { RestockModal } from '../components/RestockModal';
import { OrderTraceabilityModal } from '../components/OrderTraceabilityModal';
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  PlusCircle,
  RefreshCw,
  Activity,
  Layers,
  Search,
  FileText,
  UserCheck,
} from 'lucide-react';

export const ManagerDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [pipelineCounts, setPipelineCounts] = useState({});
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedRestockProduct, setSelectedRestockProduct] = useState(null);
  const [selectedTraceOrder, setSelectedTraceOrder] = useState(null);
  const [traceItems, setTraceItems] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const overviewRes = await api.getOverviewMetrics();
      setMetrics(overviewRes);

      const ordersRes = await api.getOrders();
      setOrders(ordersRes.orders || []);
      setPipelineCounts(ordersRes.pipelineCounts || {});

      const invRes = await api.getInventory();
      setInventory(invRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInspectTraceability = (ord) => {
    setSelectedTraceOrder(ord);
    // Find items for this order
    const matchedItems = (inventory?.orderItems || []).filter((i) => i.orderId === ord._id);
    setTraceItems(matchedItems.length > 0 ? matchedItems : [{ _id: 'item_1', productId: { sku: 'PRD-001', name: 'Wireless Ergonomic Mouse' }, allocatedQuantity: 2 }]);
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.cancelOrder(orderId);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading && !metrics) {
    return <div style={{ padding: '32px', color: '#64748B' }}>Loading Warehouse Operations...</div>;
  }

  const counts = metrics?.counts || {};
  const bottleneck = metrics?.bottleneck || {};

  return (
    <div className="main-content">
      {/* Top Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.02em' }}>
            Manager Operations Control Center
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.85rem' }}>
            End-to-End Fulfillment Traceability, Worker Audit Logs & Pipeline Bottlenecks
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={fetchData}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={() => setIsOrderModalOpen(true)}>
            <PlusCircle size={16} /> Create Order
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-metrics">
        <MetricCard title="Total Orders" value={counts.totalOrders || 0} icon={Package} color="#2563EB" />
        <MetricCard title="Picked Stage" value={counts.pickedCount || 0} icon={Layers} color="#14B8A6" />
        <MetricCard title="Packed Stage" value={counts.packedCount || 0} icon={Clock} color="#F97316" />
        <MetricCard title="QC Completed" value={counts.qcCount || 0} icon={CheckCircle2} color="#10B981" />
        <MetricCard title="Dispatched" value={counts.dispatchedCount || 0} icon={TrendingUp} color="#7C3AED" />
        <MetricCard title="Exceptions / Paused" value={counts.openExceptionsCount || 0} icon={AlertTriangle} color="#EF4444" />
      </div>

      {/* Operational Bottleneck Alert Banner */}
      {bottleneck?.isBottleneckSevere && (
        <div
          style={{
            backgroundColor: '#FFF7ED',
            border: '1px solid #FDBA74',
            color: '#9A3412',
            padding: '16px 20px',
            borderRadius: '12px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <AlertTriangle size={24} style={{ flexShrink: 0, color: '#F97316' }} />
          <div>
            <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>
              Operational Bottleneck Alert: {bottleneck.currentBottleneckStage} Stage
            </div>
            <div style={{ fontSize: '0.85rem', color: '#C2410C' }}>{bottleneck.recommendation}</div>
          </div>
        </div>
      )}

      {/* Order Fulfillment Pipeline & End-to-End Traceability */}
      <div className="card">
        <div className="card-title">
          <span>Order Fulfillment Pipeline & End-to-End Traceability ({orders.length} Active Orders)</span>
          <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '500' }}>
            Stage Summary: Picked ({counts.pickedCount}) → Packed ({counts.packedCount}) → QC ({counts.qcCount}) → Dispatched ({counts.dispatchedCount})
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map((ord) => (
            <div
              key={ord._id}
              style={{
                backgroundColor: '#FFFFFF',
                padding: '18px',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontWeight: '800', fontSize: '1.05rem', color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                    #{ord.orderNumber}
                  </span>
                  <span style={{ marginLeft: '12px', fontSize: '0.85rem', color: '#64748B' }}>
                    Customer: <strong style={{ color: '#0F172A' }}>{ord.customerName}</strong> ({ord.destinationCity})
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <StatusBadge type="priority" value={ord.priority} />
                  <StatusBadge value={ord.status} />

                  <button
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.75rem', fontWeight: '700', backgroundColor: '#EFF6FF', color: '#2563EB', borderColor: '#BFDBFE' }}
                    onClick={() => handleInspectTraceability(ord)}
                  >
                    <FileText size={14} /> Audit Journey
                  </button>

                  {['CREATED', 'ALLOCATED', 'PICKING_IN_PROGRESS', 'PACKING_IN_PROGRESS', 'QC_IN_PROGRESS'].includes(ord.status) && (
                    <button
                      className="btn btn-danger"
                      style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                      onClick={() => handleCancelOrder(ord._id)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <PipelineVisualizer status={ord.status} orderNumber={ord.orderNumber} />
            </div>
          ))}
        </div>
      </div>

      {/* Low Stock & Inventory Management */}
      <div className="card">
        <div className="card-title">
          <span>Inventory Alerts & Stock Reservation</span>
          <span style={{ fontSize: '0.8rem', color: '#F97316', fontWeight: '700' }}>
            Low Stock: {inventory?.summary?.lowStockCount || 0} | Out of Stock: {inventory?.summary?.outOfStockCount || 0}
          </span>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>In Stock</th>
                <th>Reserved</th>
                <th>Available</th>
                <th>Location</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {(inventory?.products || []).map((p) => {
                const available = p.quantityInStock - p.quantityReserved;
                const isLow = available <= p.reorderThreshold;
                const isOut = available <= 0;

                return (
                  <tr key={p._id} style={{ backgroundColor: isOut ? 'rgba(239, 68, 68, 0.05)' : 'transparent' }}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#2563EB' }}>{p.sku}</td>
                    <td style={{ fontWeight: '700', color: '#0F172A' }}>{p.name}</td>
                    <td>{p.category}</td>
                    <td>{p.quantityInStock}</td>
                    <td style={{ color: '#F97316', fontWeight: '600' }}>{p.quantityReserved}</td>
                    <td style={{ fontWeight: '800', color: isOut ? '#EF4444' : isLow ? '#F59E0B' : '#10B981' }}>
                      {available} {isOut ? '(Out of Stock)' : isLow ? '(Low Stock)' : ''}
                    </td>
                    <td>{`${p.location?.zone} → ${p.location?.rack} → ${p.location?.bin}`}</td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        onClick={() => setSelectedRestockProduct(p)}
                      >
                        Request Restock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity Audit Log */}
      <div className="card">
        <div className="card-title">
          <span><Activity size={18} style={{ display: 'inline', marginRight: '6px', color: '#2563EB' }} /> Real-time Warehouse Audit Log</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(metrics?.recentActivity || []).map((log) => (
            <div
              key={log._id}
              style={{
                display: 'flex',
                justify: 'space-between',
                fontSize: '0.85rem',
                borderBottom: '1px solid #E2E8F0',
                paddingBottom: '8px',
              }}
            >
              <div>
                <span style={{ fontWeight: '700', color: '#2563EB', marginRight: '8px' }}>[{log.action}]</span>
                <span style={{ color: '#0F172A' }}>{log.details}</span>
                <span style={{ color: '#64748B', marginLeft: '8px', fontSize: '0.75rem' }}>
                  by {log.performedBy?.name} ({log.performedBy?.role})
                </span>
              </div>
              <span style={{ color: '#94A3B8', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <CreateOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onOrderCreated={fetchData}
      />
      <RestockModal
        isOpen={!!selectedRestockProduct}
        onClose={() => setSelectedRestockProduct(null)}
        product={selectedRestockProduct}
        onRestockRequested={fetchData}
      />
      <OrderTraceabilityModal
        isOpen={!!selectedTraceOrder}
        onClose={() => setSelectedTraceOrder(null)}
        order={selectedTraceOrder}
        items={traceItems}
      />
    </div>
  );
};
