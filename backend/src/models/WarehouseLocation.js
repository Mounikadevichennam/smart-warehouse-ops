const mongoose = require('mongoose');

const warehouseLocationSchema = new mongoose.Schema(
  {
    zone: { type: String, required: true },
    rack: { type: String, required: true },
    bin: { type: String, required: true },
    capacity: { type: Number, default: 100 },
    currentOccupancy: { type: Number, default: 0 },
    status: { type: String, enum: ['ACTIVE', 'FULL', 'MAINTENANCE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

warehouseLocationSchema.index({ zone: 1, rack: 1, bin: 1 }, { unique: true });

module.exports = mongoose.model('WarehouseLocation', warehouseLocationSchema);
