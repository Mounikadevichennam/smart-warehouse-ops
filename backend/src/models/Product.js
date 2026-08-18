const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true },
    category: { type: String, default: 'General' },
    price: { type: Number, default: 999 },
    rating: { type: Number, default: 4.8 },
    image: { type: String, default: '' },
    description: { type: String, default: '' },
    quantityInStock: { type: Number, required: true, default: 0 },
    quantityReserved: { type: Number, required: true, default: 0 },
    quantityDamaged: { type: Number, required: true, default: 0 },
    reorderThreshold: { type: Number, default: 10 },
    minStockLevel: { type: Number, default: 5 },
    location: {
      zone: { type: String, default: 'Zone A' },
      rack: { type: String, default: 'Rack 01' },
      bin: { type: String, default: 'Bin 01' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
