const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    taskNumber: { type: String, required: true, unique: true, uppercase: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    stage: {
      type: String,
      required: true,
      enum: ['PICKING', 'PACKING', 'QC', 'DISPATCH', 'RETURN_TO_STOCK'],
    },
    assignedWorkerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', default: null },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'PAUSED', 'REASSIGNED'],
      default: 'PENDING',
    },
    priority: { type: String, enum: ['LOW', 'NORMAL', 'HIGH', 'CRITICAL'], default: 'NORMAL' },
    priorityScore: { type: Number, default: 50 },
    locationInfo: {
      zone: { type: String },
      rack: { type: String },
      bin: { type: String },
    },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        sku: { type: String },
        name: { type: String },
        quantity: { type: Number },
      },
    ],
    startedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
