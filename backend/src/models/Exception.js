const mongoose = require('mongoose');

const exceptionSchema = new mongoose.Schema(
  {
    exceptionNumber: { type: String, required: true, unique: true, uppercase: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    reportedByWorkerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },
    type: {
      type: String,
      required: true,
      enum: [
        'MISSING_ITEM',
        'DAMAGED_ITEM',
        'QUANTITY_MISMATCH',
        'QC_FAILURE',
        'STOCK_SHORTAGE',
        'DELIVERY_DEADLINE_RISK',
        'TASK_DELAY',
      ],
    },
    description: { type: String, required: true },
    status: { type: String, enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED'], default: 'OPEN' },
    resolutionNotes: { type: String, default: '' },
    resolvedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Exception', exceptionSchema);
