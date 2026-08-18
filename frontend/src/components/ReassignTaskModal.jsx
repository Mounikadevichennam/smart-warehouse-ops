import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { api } from '../services/api';

export const ReassignTaskModal = ({ isOpen, onClose, task, onReassigned }) => {
  const [workers, setWorkers] = useState([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && task) {
      api.getWorkers().then((res) => {
        // Filter workers who share the task role requirement
        const roleMap = { PICKING: 'Picker', PACKING: 'Packer', QC: 'QC', DISPATCH: 'Dispatch' };
        const reqRole = roleMap[task.stage] || 'Picker';

        const eligible = (res || []).filter((w) => w.role === reqRole);
        setWorkers(eligible);
        if (eligible.length > 0) setSelectedWorkerId(eligible[0]._id);
      });
    }
  }, [isOpen, task]);

  if (!task) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWorkerId) return;

    setLoading(true);
    setError('');
    try {
      await api.reassignTask({ taskId: task._id, newWorkerId: selectedWorkerId });
      onReassigned();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Reassign Task ${task.taskNumber} (${task.stage})`}>
      {error && <div style={{ color: '#ef4444', marginBottom: '12px', fontSize: '0.85rem' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px', background: '#0f172a', padding: '12px', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Order: {task.orderId?.orderNumber}</div>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Current Stage: {task.stage}</div>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Priority: {task.priority}</div>
        </div>

        <div className="form-group">
          <label>Assign to Available Worker ({task.stage})</label>
          <select
            className="form-control"
            value={selectedWorkerId}
            onChange={(e) => setSelectedWorkerId(e.target.value)}
          >
            {workers.map((w) => (
              <option key={w._id} value={w._id}>
                {w.name} ({w.status} - {w.completedTasksCount} completed tasks today)
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Reassigning...' : 'Confirm Reassignment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
