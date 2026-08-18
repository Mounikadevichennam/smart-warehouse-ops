import React, { useState } from 'react';
import { Modal } from './Modal';
import { api } from '../services/api';

export const ReportExceptionModal = ({ isOpen, onClose, task, onExceptionReported }) => {
  const [type, setType] = useState('MISSING_ITEM');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!task) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description) {
      setError('Please provide a description of the issue');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await api.reportException({
        taskId: task._id,
        type,
        description,
      });
      onExceptionReported();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Report Exception for Task ${task.taskNumber}`}>
      {error && <div style={{ color: '#ef4444', marginBottom: '12px', fontSize: '0.85rem' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Exception Type</label>
          <select className="form-control" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="MISSING_ITEM">Missing Item in Bin/Location</option>
            <option value="DAMAGED_ITEM">Damaged Product / Broken Packaging</option>
            <option value="QUANTITY_MISMATCH">Quantity Mismatch in Location</option>
            <option value="QC_FAILURE">Quality Control (QC) Failure</option>
            <option value="TASK_DELAY">Severe Packing/Dispatch Delay</option>
          </select>
        </div>

        <div className="form-group">
          <label>Problem Description</label>
          <textarea
            className="form-control"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain what problem occurred so supervisors can resolve it..."
            required
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-danger" disabled={loading}>
            {loading ? 'Submitting...' : 'Pause Task & Receive Next Work'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
