import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { ReportExceptionModal } from '../components/ReportExceptionModal';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Boxes,
} from 'lucide-react';

export const WorkerPortal = () => {
  const { account } = useAuth();
  const [activeTask, setActiveTask] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isExceptionModalOpen, setIsExceptionModalOpen] = useState(false);

  const fetchTask = async () => {
    setLoading(true);
    try {
      const res = await api.getMyActiveTask();
      setActiveTask(res.task);
      setItems(res.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, []);

  const handleCompleteTask = async (actionChoice = 'PASS') => {
    if (!activeTask) return;
    setActionLoading(true);
    try {
      const res = await api.completeTask(activeTask._id, { action: actionChoice });
      if (actionChoice === 'FAIL') {
        alert(`QC Failure logged for Task ${activeTask.taskNumber}. Order paused for Supervisor review.`);
      } else {
        alert(`Task ${activeTask.taskNumber} (${activeTask.stage}) marked complete! Advanced to next stage.`);
      }
      await fetchTask();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExceptionReported = async () => {
    setIsExceptionModalOpen(false);
    alert('Problem reported to Supervisor. Task paused and fetching next assignment...');
    await fetchTask();
  };

  if (loading && !activeTask) {
    return <div style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>Checking Task Queue...</div>;
  }

  const roleStageLabels = {
    Picker: 'MARK PICKING COMPLETE',
    Packer: 'MARK PACKING COMPLETE',
    QC: 'PASS QC',
    Dispatch: 'MARK DISPATCH COMPLETE',
  };

  return (
    <div className="main-content" style={{ padding: '32px 16px', maxWidth: '840px' }}>
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className={`role-badge ${account?.role}`} style={{ fontSize: '0.85rem', padding: '6px 16px' }}>
            {account?.role} Operational Workspace
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#172B3A', letterSpacing: '-0.02em' }}>
          Welcome, {account?.name}
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.875rem', marginTop: '4px' }}>
          Real-time Task Execution Engine — Complete your current task to automatically trigger the next stage.
        </p>
      </div>

      {/* Main Task Execution Presentation */}
      {!activeTask ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '56px 24px',
            border: '2px dashed #D9E4E8',
            backgroundColor: '#FFFFFF',
          }}
        >
          <Boxes size={52} style={{ color: '#64748B', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#172B3A', marginBottom: '8px' }}>
            No Pending Tasks in Your Queue
          </h3>
          <p style={{ color: '#64748B', fontSize: '0.875rem', maxWidth: '440px', margin: '0 auto 24px auto' }}>
            You are currently <strong style={{ color: '#159A9C' }}>IDLE</strong>. When an order reaches the {account?.role} stage, the system will automatically push the highest priority task to your queue.
          </p>
          <button className="btn btn-secondary" onClick={fetchTask} style={{ padding: '10px 20px' }}>
            <RefreshCw size={16} /> Check for Tasks
          </button>
        </div>
      ) : (
        <div className="worker-task-card">
          {/* Card Title Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#334155', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
                CURRENT ASSIGNED TASK
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#172B3A', fontFamily: 'var(--font-mono)' }}>
                {activeTask.taskNumber} — <span style={{ color: '#159A9C' }}>{activeTask.stage}</span>
              </h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <StatusBadge type="priority" value={activeTask.priority} />
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748B', marginTop: '6px' }}>
                Order #{activeTask.orderId?.orderNumber}
              </div>
            </div>
          </div>

          {/* Location Callout Box */}
          <div className="location-box">
            <div className="location-item">
              <label style={{ color: '#475569', fontWeight: '800' }}>ZONE</label>
              <value style={{ color: '#1E3A5F', fontWeight: '800' }}>{activeTask.locationInfo?.zone || 'Zone A'}</value>
            </div>
            <div style={{ width: '1px', height: '36px', background: '#D9E4E8' }} />
            <div className="location-item">
              <label style={{ color: '#475569', fontWeight: '800' }}>RACK</label>
              <value style={{ color: '#1E3A5F', fontWeight: '800' }}>{activeTask.locationInfo?.rack || 'Rack 01'}</value>
            </div>
            <div style={{ width: '1px', height: '36px', background: '#D9E4E8' }} />
            <div className="location-item">
              <label style={{ color: '#475569', fontWeight: '800' }}>BIN LOCATION</label>
              <value style={{ color: '#1E3A5F', fontWeight: '800' }}>{activeTask.locationInfo?.bin || 'Bin 04'}</value>
            </div>
          </div>

          {/* Items & Customer Metadata */}
          <div style={{ marginBottom: '24px', backgroundColor: '#F8FAFC', padding: '18px', borderRadius: '12px', border: '1px solid #D9E4E8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569', marginBottom: '12px', borderBottom: '1px solid #D9E4E8', paddingBottom: '8px' }}>
              <span>Customer: <strong style={{ color: '#172B3A' }}>{activeTask.orderId?.customerName || 'N/A'}</strong></span>
              <span>Deadline: <strong style={{ color: '#D99A00' }}>{new Date(activeTask.orderId?.deliveryDeadline).toLocaleTimeString()}</strong></span>
            </div>

            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#159A9C', letterSpacing: '0.05em', marginBottom: '10px', textTransform: 'uppercase' }}>
              REQUIRED ITEMS:
            </div>
            {items.map((item) => (
              <div
                key={item._id}
                style={{
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  border: '1px solid #D9E4E8',
                }}
              >
                <div>
                  <span style={{ fontWeight: '800', color: '#159A9C', marginRight: '10px', fontFamily: 'var(--font-mono)' }}>
                    {item.productId?.sku}
                  </span>
                  <span style={{ fontWeight: '600', color: '#172B3A' }}>{item.productId?.name}</span>
                </div>
                <span style={{ fontWeight: '800', color: '#16A085', backgroundColor: 'rgba(22, 160, 133, 0.12)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem' }}>
                  x {item.allocatedQuantity || item.requestedQuantity} units
                </span>
              </div>
            ))}
          </div>

          {/* Action Control Panel */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-warning"
              onClick={() => setIsExceptionModalOpen(true)}
              style={{ flex: 1, minWidth: '160px', padding: '14px', fontSize: '0.9rem' }}
            >
              <AlertTriangle size={18} /> REPORT PROBLEM
            </button>

            {account?.role === 'QC' ? (
              <>
                <button
                  className="btn btn-danger"
                  onClick={() => handleCompleteTask('FAIL')}
                  disabled={actionLoading}
                  style={{ flex: 1, minWidth: '140px', padding: '14px', fontSize: '0.95rem', fontWeight: '700' }}
                >
                  <XCircle size={18} /> FAIL QC
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => handleCompleteTask('PASS')}
                  disabled={actionLoading}
                  style={{ flex: 2, minWidth: '180px', padding: '14px', fontSize: '1rem', fontWeight: '800' }}
                >
                  <CheckCircle2 size={20} /> {actionLoading ? 'Updating Stage...' : 'PASS QC'}
                </button>
              </>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => handleCompleteTask('PASS')}
                disabled={actionLoading}
                style={{ flex: 2, minWidth: '220px', padding: '14px', fontSize: '1rem', fontWeight: '800' }}
              >
                <CheckCircle2 size={20} />{' '}
                {actionLoading ? 'Updating Stage...' : roleStageLabels[account?.role] || `MARK ${activeTask.stage} COMPLETE`}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Exception Reporting Modal */}
      <ReportExceptionModal
        isOpen={isExceptionModalOpen}
        onClose={() => setIsExceptionModalOpen(false)}
        task={activeTask}
        onExceptionReported={handleExceptionReported}
      />
    </div>
  );
};
