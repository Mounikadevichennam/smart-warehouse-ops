import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { PipelineVisualizer } from '../components/PipelineVisualizer';
import { CustomerOrderModal } from '../components/CustomerOrderModal';
import { Modal } from '../components/Modal';
import {
  Package,
  Clock,
  RefreshCw,
  CheckCircle2,
  MapPin,
  Building2,
  ShoppingBag,
  PlusCircle,
  Eye,
  Boxes,
  Truck,
  ShieldCheck,
} from 'lucide-react';

export const CustomerPortal = () => {
  const { account } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isPlaceOrderOpen, setIsPlaceOrderOpen] = useState(false);
  const [selectedTrackOrder, setSelectedTrackOrder] = useState(null);

  const fetchCustomerOrders = async () => {
    setLoading(true);
    try {
      const res = await api.getOrders();
      setOrders(res.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerOrders();
  }, []);

  const formatDate = (dateInput) => {
    if (!dateInput) return 'Pending...';
    const d = new Date(dateInput);
    return `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} • ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const activeOrdersCount = orders.filter((o) => o.status !== 'DISPATCHED' && o.status !== 'CANCELLED').length;
  const completedOrdersCount = orders.filter((o) => o.status === 'DISPATCHED').length;

  return (
    <div className="main-content" style={{ maxWidth: '1000px' }}>
      {/* Customer Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
            CUSTOMER ORDER PORTAL & LIVE TRACKING
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.02em' }}>
            Welcome, {account?.name}
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem', marginTop: '2px' }}>
            Track order fulfillment progress, view stage milestones, and place new orders.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={fetchCustomerOrders}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={() => setIsPlaceOrderOpen(true)}>
            <PlusCircle size={16} /> Place New Order
          </button>
        </div>
      </div>

      {/* Customer Summary Metric Cards */}
      <div className="grid-metrics" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '24px' }}>
        <div className="metric-card">
          <div className="metric-header">
            <span>Total Orders</span>
            <Package size={18} style={{ color: '#2563EB' }} />
          </div>
          <div className="metric-value">{orders.length}</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Active Orders</span>
            <Clock size={18} style={{ color: '#F97316' }} />
          </div>
          <div className="metric-value" style={{ color: '#F97316' }}>{activeOrdersCount}</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Completed / Delivered</span>
            <CheckCircle2 size={18} style={{ color: '#14B8A6' }} />
          </div>
          <div className="metric-value" style={{ color: '#14B8A6' }}>{completedOrdersCount}</div>
        </div>
      </div>

      {/* Customer Orders List */}
      <div className="card">
        <div className="card-title">
          <span>My Orders ({orders.length})</span>
          <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '600' }}>
            Real-time synchronization with warehouse fulfillment engine
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '36px', textAlign: 'center', color: '#64748B' }}>Loading your order tracking...</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <ShoppingBag size={48} style={{ color: '#94A3B8', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A' }}>No Active Orders Found</h3>
            <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '16px' }}>
              You currently have no orders in the warehouse fulfillment pipeline.
            </p>
            <button className="btn btn-primary" onClick={() => setIsPlaceOrderOpen(true)}>
              <PlusCircle size={16} /> Place First Order
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orders.map((ord) => (
              <div
                key={ord._id}
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                }}
              >
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <span style={{ fontWeight: '800', fontSize: '1.1rem', color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                      #{ord.orderNumber}
                    </span>
                    <span style={{ marginLeft: '12px', fontSize: '0.85rem', color: '#64748B' }}>
                      Destination: <strong style={{ color: '#0F172A' }}>{ord.destinationCity}</strong>
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <StatusBadge value={ord.status} />
                    <button
                      className="btn btn-primary"
                      style={{ padding: '6px 14px', fontSize: '0.8rem', fontWeight: '700' }}
                      onClick={() => setSelectedTrackOrder(ord)}
                    >
                      <Eye size={14} /> Track Order
                    </button>
                  </div>
                </div>

                {/* Warehouse & Dates Metadata */}
                <div style={{ display: 'flex', gap: '24px', fontSize: '0.825rem', color: '#64748B', backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px' }}>
                  <span>Warehouse: <strong style={{ color: '#0F172A' }}>{ord.warehouseName || 'Central Fulfillment Hub - Zone A'}</strong></span>
                  <span>Placed: <strong style={{ color: '#0F172A' }}>{formatDate(ord.createdAt)}</strong></span>
                  <span>Deadline: <strong style={{ color: '#F97316' }}>{formatDate(ord.deliveryDeadline)}</strong></span>
                </div>

                {/* Live Progress Stepper */}
                <PipelineVisualizer status={ord.status} orderNumber={ord.orderNumber} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customer Modals */}
      <CustomerOrderModal
        isOpen={isPlaceOrderOpen}
        onClose={() => setIsPlaceOrderOpen(false)}
        onOrderPlaced={fetchCustomerOrders}
      />

      {/* Detailed Customer Track Order Modal */}
      {selectedTrackOrder && (
        <Modal
          isOpen={!!selectedTrackOrder}
          onClose={() => setSelectedTrackOrder(null)}
          title={`Order Tracking Journey — #${selectedTrackOrder.orderNumber}`}
          maxWidth="640px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A' }}>
                  Order #{selectedTrackOrder.orderNumber}
                </span>
                <StatusBadge value={selectedTrackOrder.status} />
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                Destination: <strong style={{ color: '#0F172A' }}>{selectedTrackOrder.destinationCity}</strong> | Handling Warehouse: <strong style={{ color: '#2563EB' }}>{selectedTrackOrder.warehouseName || 'Central Fulfillment Hub - Zone A'}</strong>
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              FULFILLMENT MILESTONES & JOURNEY
            </div>

            {/* Customer Friendly Milestone Stepper */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px 14px', backgroundColor: '#F0FDF4', border: '1px solid #14B8A6', borderRadius: '8px' }}>
                <CheckCircle2 size={20} style={{ color: '#14B8A6' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '800', fontSize: '0.875rem', color: '#0F172A' }}>1. Order Placed & Warehouse Assigned</div>
                  <div style={{ fontSize: '0.775rem', color: '#64748B' }}>{formatDate(selectedTrackOrder.createdAt)} • Central Fulfillment Hub - Zone A</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px 14px', backgroundColor: ['PICKED', 'PACKING_IN_PROGRESS', 'PACKED', 'QC_IN_PROGRESS', 'QC_PASSED', 'DISPATCH_IN_PROGRESS', 'DISPATCHED'].includes(selectedTrackOrder.status) ? '#F0FDF4' : '#F8FAFC', border: `1px solid ${['PICKED', 'PACKING_IN_PROGRESS', 'PACKED', 'QC_IN_PROGRESS', 'QC_PASSED', 'DISPATCH_IN_PROGRESS', 'DISPATCHED'].includes(selectedTrackOrder.status) ? '#14B8A6' : '#E2E8F0'}`, borderRadius: '8px' }}>
                <Boxes size={20} style={{ color: ['PICKED', 'PACKING_IN_PROGRESS', 'PACKED', 'QC_IN_PROGRESS', 'QC_PASSED', 'DISPATCH_IN_PROGRESS', 'DISPATCHED'].includes(selectedTrackOrder.status) ? '#14B8A6' : '#94A3B8' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '800', fontSize: '0.875rem', color: '#0F172A' }}>2. Warehouse Item Picking</div>
                  <div style={{ fontSize: '0.775rem', color: '#64748B' }}>
                    {formatDate(selectedTrackOrder.stageTimestamps?.pickedAt || selectedTrackOrder.traceability?.picker?.timestamp)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px 14px', backgroundColor: ['PACKED', 'QC_IN_PROGRESS', 'QC_PASSED', 'DISPATCH_IN_PROGRESS', 'DISPATCHED'].includes(selectedTrackOrder.status) ? '#F0FDF4' : '#F8FAFC', border: `1px solid ${['PACKED', 'QC_IN_PROGRESS', 'QC_PASSED', 'DISPATCH_IN_PROGRESS', 'DISPATCHED'].includes(selectedTrackOrder.status) ? '#14B8A6' : '#E2E8F0'}`, borderRadius: '8px' }}>
                <Package size={20} style={{ color: ['PACKED', 'QC_IN_PROGRESS', 'QC_PASSED', 'DISPATCH_IN_PROGRESS', 'DISPATCHED'].includes(selectedTrackOrder.status) ? '#14B8A6' : '#94A3B8' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '800', fontSize: '0.875rem', color: '#0F172A' }}>3. Order Packaging & Securing</div>
                  <div style={{ fontSize: '0.775rem', color: '#64748B' }}>
                    {formatDate(selectedTrackOrder.stageTimestamps?.packedAt || selectedTrackOrder.traceability?.packer?.timestamp)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px 14px', backgroundColor: ['QC_PASSED', 'DISPATCH_IN_PROGRESS', 'DISPATCHED'].includes(selectedTrackOrder.status) ? '#F0FDF4' : '#F8FAFC', border: `1px solid ${['QC_PASSED', 'DISPATCH_IN_PROGRESS', 'DISPATCHED'].includes(selectedTrackOrder.status) ? '#14B8A6' : '#E2E8F0'}`, borderRadius: '8px' }}>
                <ShieldCheck size={20} style={{ color: ['QC_PASSED', 'DISPATCH_IN_PROGRESS', 'DISPATCHED'].includes(selectedTrackOrder.status) ? '#14B8A6' : '#94A3B8' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '800', fontSize: '0.875rem', color: '#0F172A' }}>4. Quality Control & Inspection</div>
                  <div style={{ fontSize: '0.775rem', color: '#64748B' }}>
                    {formatDate(selectedTrackOrder.stageTimestamps?.qcPassedAt || selectedTrackOrder.traceability?.qc?.timestamp)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px 14px', backgroundColor: selectedTrackOrder.status === 'DISPATCHED' ? '#F0FDF4' : '#F8FAFC', border: `1px solid ${selectedTrackOrder.status === 'DISPATCHED' ? '#14B8A6' : '#E2E8F0'}`, borderRadius: '8px' }}>
                <Truck size={20} style={{ color: selectedTrackOrder.status === 'DISPATCHED' ? '#14B8A6' : '#94A3B8' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '800', fontSize: '0.875rem', color: '#0F172A' }}>5. Dispatch & Transit Delivery</div>
                  <div style={{ fontSize: '0.775rem', color: '#64748B' }}>
                    {formatDate(selectedTrackOrder.stageTimestamps?.dispatchedAt || selectedTrackOrder.traceability?.dispatcher?.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
