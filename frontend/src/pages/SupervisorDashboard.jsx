import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { ReassignTaskModal } from '../components/ReassignTaskModal';
import { Users, AlertTriangle, RefreshCw, ArrowRightLeft, CheckCircle } from 'lucide-react';

export const SupervisorDashboard = () => {
  const [workers, setWorkers] = useState([]);
  const [exceptions, setExceptions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedTaskToReassign, setSelectedTaskToReassign] = useState(null);
  const [resolvingExceptionId, setResolvingExceptionId] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const workersRes = await api.getWorkers();
      setWorkers(workersRes || []);

      const exceptionsRes = await api.getExceptions();
      setExceptions(exceptionsRes || []);

      const ordersRes = await api.getOrders();
      setOrders(ordersRes.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResolveException = async (exceptionId) => {
    if (!resolutionNotes) {
      alert('Please provide resolution notes before submitting');
      return;
    }
    try {
      await api.resolveException(exceptionId, { resolutionNotes });
      setResolvingExceptionId(null);
      setResolutionNotes('');
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading && workers.length === 0) {
    return <div style={{ padding: '32px', color: '#94a3b8' }}>Loading Supervisor Operations...</div>;
  }

  const openExceptions = exceptions.filter((e) => e.status === 'OPEN');
  const activeWorkers = workers.filter((w) => w.status === 'BUSY');
  const idleWorkers = workers.filter((w) => w.status === 'IDLE');

  return (
    <div className="main-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.02em' }}>
            Supervisor Operational Desk
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            Manage Worker Workloads, Task Reassignments & Operational Exception Resolution
          </p>
        </div>
        <button className="btn btn-secondary" onClick={fetchData}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Summary Banner */}
      <div className="grid-metrics" style={{ marginBottom: '24px' }}>
        <div className="metric-card" style={{ borderTop: '3px solid #10b981' }}>
          <div className="metric-header">
            <span>Available / Idle Workers</span>
            <Users size={20} style={{ color: '#10b981' }} />
          </div>
          <div className="metric-value">{idleWorkers.length}</div>
        </div>

        <div className="metric-card" style={{ borderTop: '3px solid #f59e0b' }}>
          <div className="metric-header">
            <span>Active / Busy Workers</span>
            <Users size={20} style={{ color: '#f59e0b' }} />
          </div>
          <div className="metric-value">{activeWorkers.length}</div>
        </div>

        <div className="metric-card" style={{ borderTop: '3px solid #ef4444' }}>
          <div className="metric-header">
            <span>Pending Operational Exceptions</span>
            <AlertTriangle size={20} style={{ color: '#ef4444' }} />
          </div>
          <div className="metric-value">{openExceptions.length}</div>
        </div>
      </div>

      {/* Live Operational Exception Resolution Desk */}
      <div className="card">
        <div className="card-title">
          <span><AlertTriangle size={18} style={{ display: 'inline', color: '#ef4444', marginRight: '8px' }} /> Exception Management & Resolution Center ({openExceptions.length} Open)</span>
        </div>

        {openExceptions.length === 0 ? (
          <div style={{ padding: '16px', color: '#10b981', background: '#0f172a', borderRadius: '8px', fontSize: '0.9rem' }}>
            ✓ No active operational exceptions. All tasks running smoothly!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {openExceptions.map((exp) => (
              <div
                key={exp._id}
                style={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #ef4444',
                  borderRadius: '10px',
                  padding: '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontWeight: '800', color: '#ef4444', fontSize: '0.95rem' }}>
                      {exp.exceptionNumber} - [{exp.type}]
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem', marginLeft: '12px' }}>
                      Order: {exp.orderId?.orderNumber} | Reported by: {exp.reportedByWorkerId?.name} ({exp.reportedByWorkerId?.role})
                    </span>
                  </div>
                  <span className="badge badge-CRITICAL">OPEN EXCEPTION</span>
                </div>

                <p style={{ color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '12px', background: '#1e293b', padding: '10px', borderRadius: '6px' }}>
                  "{exp.description}"
                </p>

                {resolvingExceptionId === exp._id ? (
                  <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', marginTop: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>
                      Supervisor Resolution Action Notes
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., Stock adjusted from secondary bin / Product replaced"
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      style={{ marginBottom: '10px' }}
                    />
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-secondary" onClick={() => setResolvingExceptionId(null)}>
                        Cancel
                      </button>
                      <button className="btn btn-success" onClick={() => handleResolveException(exp._id)}>
                        Confirm Resolution & Unpause Order
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn btn-primary" onClick={() => setResolvingExceptionId(exp._id)}>
                      <CheckCircle size={16} /> Resolve Exception
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Worker Workload & Task Reassignment */}
      <div className="card">
        <div className="card-title">
          <span>Worker Workloads & Active Task Status</span>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Worker Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Current Active Task</th>
                <th>Completed Today</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((w) => (
                <tr key={w._id}>
                  <td style={{ fontWeight: '700' }}>{w.name}</td>
                  <td><span className={`role-badge ${w.role}`}>{w.role}</span></td>
                  <td>
                    <span
                      style={{
                        color: w.status === 'BUSY' ? '#f59e0b' : '#10b981',
                        fontWeight: '700',
                        fontSize: '0.8rem',
                      }}
                    >
                      ● {w.status}
                    </span>
                  </td>
                  <td>
                    {w.activeTaskId ? (
                      <span style={{ fontFamily: 'var(--font-mono)', color: '#06b6d4' }}>
                        {w.activeTaskId.taskNumber} ({w.activeTaskId.stage})
                      </span>
                    ) : (
                      <span style={{ color: '#64748b' }}>None (Idle)</span>
                    )}
                  </td>
                  <td>{w.completedTasksCount} tasks</td>
                  <td>
                    {w.activeTaskId && (
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        onClick={() => setSelectedTaskToReassign(w.activeTaskId)}
                      >
                        <ArrowRightLeft size={14} /> Reassign Task
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ReassignTaskModal
        isOpen={!!selectedTaskToReassign}
        onClose={() => setSelectedTaskToReassign(null)}
        task={selectedTaskToReassign}
        onReassigned={fetchData}
      />
    </div>
  );
};
