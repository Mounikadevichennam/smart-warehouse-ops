const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    requestedQuantity: { type: Number, required: true },
    allocatedQuantity: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['PENDING', 'ALLOCATED', 'SHORTAGE', 'PICKED', 'PACKED', 'QC_PASSED', 'DISPATCHED'],
      default: 'PENDING',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('OrderItem', orderItemSchema);
