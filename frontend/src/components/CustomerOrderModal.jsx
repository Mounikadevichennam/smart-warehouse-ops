import React, { useState } from 'react';
import { Modal } from './Modal';
import { api } from '../services/api';
import { ShoppingBag, Plus, CheckCircle2 } from 'lucide-react';

export const CustomerOrderModal = ({ isOpen, onClose, onOrderPlaced }) => {
  const [productName, setProductName] = useState('Silk Designer Dress');
  const [quantity, setQuantity] = useState(1);
  const [destinationCity, setDestinationCity] = useState('Hyderabad Central');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const orderPayload = {
        customerName: 'Demo Customer (Silk Dress)',
        destinationCity,
        deliveryDeadline: new Date(Date.now() + 86400000).toISOString(), // 24h deadline
        priority: 'CRITICAL',
        items: [{ sku: 'PRD-001', quantity: parseInt(quantity) || 1, name: productName }],
      };

      const res = await api.createOrder(orderPayload);
      alert(`Order ${res.orderNumber || res.order?.orderNumber} successfully placed! Warehouse has assigned Central Fulfillment Hub - Zone A.`);
      onOrderPlaced();
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Place New Customer Order">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Select Product</label>
          <select className="form-control" value={productName} onChange={(e) => setProductName(e.target.value)}>
            <option value="Silk Designer Dress">Silk Designer Dress (Fashion Apparel)</option>
            <option value="Wireless Ergonomic Mouse">Wireless Ergonomic Mouse (Electronics)</option>
            <option value="Mechanical Gaming Keyboard">Mechanical Gaming Keyboard (Peripherals)</option>
            <option value="Noise Cancelling Headphones">Noise Cancelling Headphones (Audio)</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              min="1"
              max="50"
              className="form-control"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Destination / City</label>
            <input
              type="text"
              className="form-control"
              value={destinationCity}
              onChange={(e) => setDestinationCity(e.target.value)}
              required
            />
          </div>
        </div>

        <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '20px', fontSize: '0.8rem', color: '#64748B' }}>
          <div style={{ fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>Automatic Fulfillment Assignment:</div>
          <div>• Warehouse: <strong style={{ color: '#2563EB' }}>Central Fulfillment Hub - Zone A</strong></div>
          <div>• Priority Engine: <strong style={{ color: '#14B8A6' }}>HIGH / CRITICAL</strong> (Auto-routed for picking)</div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <ShoppingBag size={16} /> {loading ? 'Placing Order...' : 'CONFIRM & PLACE ORDER'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
