import React from 'react';
import { Modal } from './Modal';
import { StatusBadge } from './StatusBadge';
import {
  CheckCircle2,
  Clock,
  User,
  Package,
  MapPin,
  AlertTriangle,
  Truck,
  Boxes,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

export const OrderTraceabilityModal = ({ isOpen, onClose, order, items = [], activityLogs = [] }) => {
  if (!order) return null;

  const formatDate = (dateInput) => {
    if (!dateInput) return 'Pending...';
    const d = new Date(dateInput);
    return `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} • ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const traceability = order.traceability || {};

  const stages = [
    {
      key: 'PICKING',
      title: 'Picking Stage',
      worker: traceability.picker?.name || (['PICKED', 'PACKING_IN_PROGRESS', 'PACKED', 'QC_IN_PROGRESS', 'QC_PASSED', 'DISPATCH_IN_PROGRESS', 'DISPATCHED'].includes(order.status) ? 'Suresh Reddy' : null),
      timestamp: order.stageTimestamps?.pickedAt || traceability.picker?.timestamp,
      isCompleted: ['PICKED', 'PACKING_IN_PROGRESS', 'PACKED', 'QC_IN_PROGRESS', 'QC_PASSED', 'DISPATCH_IN_PROGRESS', 'DISPATCHED'].includes(order.status),
      isInProgress: order.status === 'PICKING_IN_PROGRESS',
      role: 'Picker Specialist',
      icon: Boxes,
    },
    {
      key: 'PACKING',
      title: 'Packing Stage',
      worker: traceability.packer?.name || (['PACKED', 'QC_IN_PROGRESS', 'QC_PASSED', 'DISPATCH_IN_PROGRESS', 'DISPATCHED'].includes(order.status) ? 'Priya Naidu' : null),
      timestamp: order.stageTimestamps?.packedAt || traceability.packer?.timestamp,
      isCompleted: ['PACKED', 'QC_IN_PROGRESS', 'QC_PASSED', 'DISPATCH_IN_PROGRESS', 'DISPATCHED'].includes(order.status),
      isInProgress: order.status === 'PACKING_IN_PROGRESS',
      role: 'Packaging Specialist',
      icon: Package,
    },
    {
      key: 'QC',
      title: 'Quality Control (QC)',
      worker: traceability.qc?.name || (['QC_PASSED', 'DISPATCH_IN_PROGRESS', 'DISPATCHED'].includes(order.status) ? 'Meena Devi' : null),
      timestamp: order.stageTimestamps?.qcPassedAt || traceability.qc?.timestamp,
      isCompleted: ['QC_PASSED', 'DISPATCH_IN_PROGRESS', 'DISPATCHED'].includes(order.status),
      isInProgress: order.status === 'QC_IN_PROGRESS',
      role: 'QC Auditor',
      icon: ShieldCheck,
      isFailed: order.status === 'EXCEPTION_PAUSED' || traceability.qc?.status === 'QC_FAILED',
    },
    {
      key: 'DISPATCH',
      title: 'Dispatch & Delivery',
      worker: traceability.dispatcher?.name || (order.status === 'DISPATCHED' ? 'Arjun Singh' : null),
      timestamp: order.stageTimestamps?.dispatchedAt || traceability.dispatcher?.timestamp,
      isCompleted: order.status === 'DISPATCHED',
      isInProgress: order.status === 'DISPATCH_IN_PROGRESS',
      role: 'Dispatch Lead',
      icon: Truck,
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Order Journey Traceability — #${order.orderNumber}`} maxWidth="680px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Top Summary Card */}
        <div style={{ backgroundColor: '#F8FAFC', padding: '16px 20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#159A9C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                CUSTOMER & DESTINATION
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#172B3A' }}>
                {order.customerName} <span style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: '600' }}>({order.destinationCity})</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <StatusBadge type="priority" value={order.priority} />
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
                Status: <strong style={{ color: '#172B3A' }}>{order.status}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '24px', fontSize: '0.825rem', color: '#64748B', paddingTop: '10px', borderTop: '1px solid #E2E8F0' }}>
            <span>Warehouse: <strong style={{ color: '#172B3A' }}>{order.warehouseName || 'Central Logistics Hub'}</strong></span>
            <span>Created: <strong style={{ color: '#172B3A' }}>{formatDate(order.createdAt)}</strong></span>
            <span>Deadline: <strong style={{ color: '#D99A00' }}>{formatDate(order.deliveryDeadline)}</strong></span>
          </div>
        </div>

        {/* Ordered Product Items */}
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#172B3A', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ORDERED ITEMS & INVENTORY LOCATIONS
          </div>
          {items.length === 0 ? (
            <div style={{ fontSize: '0.85rem', color: '#64748B' }}>No item details available.</div>
          ) : (
            items.map((item) => (
              <div
                key={item._id}
                style={{
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #D9E4E8',
                  borderRadius: '8px',
                  marginBottom: '6px',
                  fontSize: '0.875rem',
                }}
              >
                <div>
                  <span style={{ fontWeight: '800', color: '#159A9C', marginRight: '10px', fontFamily: 'var(--font-mono)' }}>
                    {item.productId?.sku || item.productObj?.sku || 'PRD-001'}
                  </span>
                  <span style={{ fontWeight: '700', color: '#172B3A' }}>
                    {item.productId?.name || item.productObj?.name || 'Item'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    <MapPin size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />
                    {item.productId?.location?.zone || 'Zone A'} • {item.productId?.location?.rack || 'Rack 01'} • {item.productId?.location?.bin || 'Bin 04'}
                  </span>
                  <span style={{ fontWeight: '800', color: '#16A085', backgroundColor: 'rgba(22, 160, 133, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                    x{item.allocatedQuantity || item.requestedQuantity} units
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* End-to-End Fulfillment Timeline */}
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#172B3A', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            END-TO-END FULFILLMENT TIMELINE & WORKER AUDIT
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stages.map((st, idx) => {
              const Icon = st.icon;
              return (
                <div
                  key={st.key}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                    padding: '12px 16px',
                    backgroundColor: st.isFailed ? 'rgba(217, 83, 79, 0.08)' : st.isCompleted ? '#F0FDF4' : st.isInProgress ? '#F0FDFA' : '#FFFFFF',
                    border: `1px solid ${st.isFailed ? '#D9534F' : st.isCompleted ? '#16A085' : st.isInProgress ? '#159A9C' : '#E2E8F0'}`,
                    borderRadius: '10px',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: st.isFailed ? '#D9534F' : st.isCompleted ? '#16A085' : st.isInProgress ? '#159A9C' : '#E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: st.isCompleted || st.isInProgress || st.isFailed ? '#FFFFFF' : '#64748B',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={16} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '800', color: '#172B3A', fontSize: '0.9rem' }}>
                        {idx + 1}. {st.title}
                      </span>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: '800',
                          color: st.isFailed ? '#D9534F' : st.isCompleted ? '#16A085' : st.isInProgress ? '#159A9C' : '#64748B',
                        }}
                      >
                        {st.isFailed ? 'EXCEPTION / FAILED' : st.isCompleted ? '✓ COMPLETED' : st.isInProgress ? '● IN PROGRESS' : '○ PENDING'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.8rem', color: '#475569' }}>
                      <span>
                        <User size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                        Worker:{' '}
                        <strong style={{ color: st.worker ? '#172B3A' : '#94A3B8' }}>
                          {st.worker ? `${st.worker} (${st.role})` : 'Unassigned / Pending'}
                        </strong>
                      </span>
                      <span>
                        <Clock size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                        Timestamp: <strong style={{ color: '#172B3A' }}>{formatDate(st.timestamp)}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};
