const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, default: 'customer@warehouse.com' },
    destinationCity: { type: String, required: true },
    estimatedTransitDays: { type: Number, default: 1 },
    deliveryDeadline: { type: Date, required: true },
    priority: { type: String, enum: ['LOW', 'NORMAL', 'HIGH', 'CRITICAL'], default: 'NORMAL' },
    priorityScore: { type: Number, default: 50 },
    warehouseName: { type: String, default: 'Central Fulfillment Hub - Zone A' },
    status: {
      type: String,
      enum: [
        'CREATED',
        'DELIVERY_PLANNED',
        'PRIORITY_DETERMINED',
        'INVENTORY_CHECKED',
        'ALLOCATED',
        'PICKING_IN_PROGRESS',
        'PICKED',
        'PACKING_IN_PROGRESS',
        'PACKED',
        'QC_IN_PROGRESS',
        'QC_PASSED',
        'DISPATCH_IN_PROGRESS',
        'DISPATCHED',
        'EXCEPTION_PAUSED',
        'CANCELLED',
      ],
      default: 'CREATED',
    },
    shortageDetails: {
      isShortage: { type: Boolean, default: false },
      missingSku: { type: String, default: '' },
      quantityNeeded: { type: Number, default: 0 },
    },
    stageTimestamps: {
      pickedAt: { type: Date },
      packedAt: { type: Date },
      qcPassedAt: { type: Date },
      dispatchedAt: { type: Date },
    },
    traceability: {
      picker: { workerId: String, name: String, timestamp: Date },
      packer: { workerId: String, name: String, timestamp: Date },
      qc: { workerId: String, name: String, timestamp: Date, status: String },
      dispatcher: { workerId: String, name: String, timestamp: Date },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
