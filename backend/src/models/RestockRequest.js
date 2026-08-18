const mongoose = require('mongoose');

const restockRequestSchema = new mongoose.Schema(
  {
    requestNumber: { type: String, required: true, unique: true, uppercase: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    requestedQuantity: { type: Number, required: true },
    status: {
      type: String,
      enum: ['REQUESTED', 'CONFIRMED_RECEIVED'],
      default: 'REQUESTED',
    },
    requestedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    confirmedByAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    receivedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RestockRequest', restockRequestSchema);
