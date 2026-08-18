const mongoose = require('mongoose');
const RestockRequest = require('../models/RestockRequest');
const Product = require('../models/Product');
const { store } = require('../services/memoryStore');

const getRestockRequests = async (req, res) => {
  try {
    let requests = [];
    if (mongoose.connection.readyState === 1) {
      requests = await RestockRequest.find()
        .populate('productId')
        .populate('requestedByUserId', 'name role')
        .populate('confirmedByAdminId', 'name role')
        .sort({ createdAt: -1 });
    } else {
      requests = store.restockRequests.map((r) => {
        const prod = store.products.find((p) => p._id === r.productId);
        const user = store.users.find((u) => u._id === r.requestedByUserId);
        return { ...r, productId: prod, requestedByUserId: user };
      });
    }
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createRestockRequest = async (req, res) => {
  try {
    const { productId, requestedQuantity } = req.body;
    if (mongoose.connection.readyState === 1) {
      const restock = await RestockRequest.create({
        requestNumber: `RST-${Date.now().toString().slice(-4)}`,
        productId,
        requestedQuantity: parseInt(requestedQuantity),
        status: 'REQUESTED',
        requestedByUserId: req.account.id,
      });
      return res.status(201).json(restock);
    } else {
      const prod = store.products.find((p) => p._id === productId);
      const restock = {
        _id: `rst_${Date.now()}`,
        requestNumber: `RST-${Date.now().toString().slice(-4)}`,
        productId,
        productObj: prod,
        requestedQuantity: parseInt(requestedQuantity),
        status: 'REQUESTED',
        requestedByUserId: req.account.id,
        createdAt: new Date(),
      };
      store.restockRequests.unshift(restock);
      return res.status(201).json(restock);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const confirmRestock = async (req, res) => {
  try {
    const restockId = req.params.id;
    if (mongoose.connection.readyState === 1) {
      const restock = await RestockRequest.findById(restockId);
      if (restock) {
        restock.status = 'CONFIRMED_RECEIVED';
        restock.receivedAt = new Date();
        await restock.save();

        const product = await Product.findById(restock.productId);
        if (product) {
          product.quantityInStock += restock.requestedQuantity;
          await product.save();
        }
      }
    } else {
      const restock = store.restockRequests.find((r) => r._id === restockId);
      if (restock) {
        restock.status = 'CONFIRMED_RECEIVED';
        restock.receivedAt = new Date();
        const prod = store.products.find((p) => p._id === restock.productId);
        if (prod) {
          prod.quantityInStock += restock.requestedQuantity;
        }
      }
    }

    res.json({ message: 'Restock confirmed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getRestockRequests, createRestockRequest, confirmRestock };
