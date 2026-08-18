const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    action: { type: String, required: true },
    performedBy: {
      id: { type: mongoose.Schema.Types.ObjectId },
      name: { type: String, default: 'System' },
      role: { type: String, default: 'SYSTEM' },
    },
    details: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
