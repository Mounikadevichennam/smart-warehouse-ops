import React, { useState } from 'react';
import { Modal } from './Modal';
import { api } from '../services/api';

export const RestockModal = ({ isOpen, onClose, product, onRestockRequested }) => {
  const [requestedQuantity, setRequestedQuantity] = useState(15);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.createRestockRequest({
        productId: product._id,
        requestedQuantity: parseInt(requestedQuantity),
      });
      onRestockRequested();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Issue Restock Request for ${product.name}`}>
      {error && <div style={{ color: '#ef4444', marginBottom: '12px', fontSize: '0.85rem' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px', background: '#0f172a', padding: '12px', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>SKU: {product.sku}</div>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Current In Stock: {product.quantityInStock}</div>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Reserved: {product.quantityReserved}</div>
        </div>

        <div className="form-group">
          <label>Restock Quantity to Order</label>
          <input
            type="number"
            min="1"
            className="form-control"
            value={requestedQuantity}
            onChange={(e) => setRequestedQuantity(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Restock Request'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
