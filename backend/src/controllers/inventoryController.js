const mongoose = require('mongoose');
const Product = require('../models/Product');
const WarehouseLocation = require('../models/WarehouseLocation');
const { store } = require('../services/memoryStore');

const getInventory = async (req, res) => {
  try {
    let products = [];
    if (mongoose.connection.readyState === 1) {
      products = await Product.find().sort({ sku: 1 });
    } else {
      products = store.products;
    }

    const lowStockProducts = products.filter(
      (p) => p.quantityInStock - p.quantityReserved <= p.reorderThreshold && p.quantityInStock > 0
    );
    const outOfStockProducts = products.filter((p) => p.quantityInStock - p.quantityReserved <= 0);

    res.json({
      summary: {
        totalProducts: products.length,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
      },
      products,
      lowStockProducts,
      outOfStockProducts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLocations = async (req, res) => {
  try {
    let locations = [];
    if (mongoose.connection.readyState === 1) {
      locations = await WarehouseLocation.find().sort({ zone: 1, rack: 1, bin: 1 });
    } else {
      locations = store.locations;
    }
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getInventory, getLocations };
