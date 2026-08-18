import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { api } from '../services/api';

export const CreateOrderModal = ({ isOpen, onClose, onOrderCreated }) => {
  const [customerName, setCustomerName] = useState('');
  const [destinationCity, setDestinationCity] = useState('Hyderabad');
  const [estimatedTransitDays, setEstimatedTransitDays] = useState(2);
  const [deliveryDeadline, setDeliveryDeadline] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.getInventory().then((res) => {
        setProducts(res.products || []);
        if (res.products && res.products.length > 0) {
          setSelectedProductId(res.products[0]._id);
        }
      });
      // Default deadline to tomorrow 6 PM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(18, 0, 0, 0);
      setDeliveryDeadline(tomorrow.toISOString().slice(0, 16));
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName || !selectedProductId || !deliveryDeadline) {
      setError('Please fill in all required fields');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await api.createOrder({
        customerName,
        destinationCity,
        estimatedTransitDays: parseInt(estimatedTransitDays),
        deliveryDeadline,
        items: [{ productId: selectedProductId, quantity: parseInt(quantity) }],
      });
      onOrderCreated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Warehouse Order">
      {error && (
        <div style={{ color: '#ef4444', marginBottom: '12px', fontSize: '0.85rem', fontWeight: '600' }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Customer Name</label>
          <input
            className="form-control"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="e.g. Acme Tech Solutions"
            required
          />
        </div>

        <div className="form-group">
          <label>Destination City (Transit Time Estimation)</label>
          <select
            className="form-control"
            value={destinationCity}
            onChange={(e) => {
              const city = e.target.value;
              setDestinationCity(city);
              setEstimatedTransitDays(city === 'Kakinada' ? 1 : city === 'Vijayawada' ? 1 : 2);
            }}
          >
            <option value="Kakinada">Kakinada (1 Day Transit)</option>
            <option value="Vijayawada">Vijayawada (1 Day Transit)</option>
            <option value="Hyderabad">Hyderabad (2 Days Transit)</option>
            <option value="Visakhapatnam">Visakhapatnam (2 Days Transit)</option>
            <option value="Bengaluru">Bengaluru (3 Days Transit)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Delivery Deadline</label>
          <input
            type="datetime-local"
            className="form-control"
            value={deliveryDeadline}
            onChange={(e) => setDeliveryDeadline(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Select Product</label>
          <select
            className="form-control"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
          >
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.sku} - {p.name} (Stock: {p.quantityInStock - p.quantityReserved})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Order Quantity</label>
          <input
            type="number"
            min="1"
            className="form-control"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Order & Allocate'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
