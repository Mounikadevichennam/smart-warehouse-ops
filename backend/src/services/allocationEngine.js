const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const Exception = require('../models/Exception');
const ActivityLog = require('../models/ActivityLog');

const processInventoryAllocation = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) return;

  const items = await OrderItem.find({ orderId }).populate('productId');
  let hasShortage = false;
  let missingSku = '';
  let missingQty = 0;

  for (const item of items) {
    const product = item.productId;
    const availableStock = product.quantityInStock - product.quantityReserved;

    if (availableStock >= item.requestedQuantity) {
      product.quantityReserved += item.requestedQuantity;
      await product.save();
      item.allocatedQuantity = item.requestedQuantity;
      item.status = 'ALLOCATED';
      await item.save();
    } else {
      hasShortage = true;
      missingSku = product.sku;
      missingQty = item.requestedQuantity - availableStock;

      // Allocate whatever is available
      if (availableStock > 0) {
        product.quantityReserved += availableStock;
        await product.save();
        item.allocatedQuantity = availableStock;
      }
      item.status = 'SHORTAGE';
      await item.save();
    }
  }

  if (hasShortage) {
    order.status = 'EXCEPTION_PAUSED';
    order.shortageDetails = {
      isShortage: true,
      missingSku,
      quantityNeeded: missingQty,
    };
    await order.save();

    // Create Stock Shortage Exception
    await Exception.create({
      exceptionNumber: `EXP-STK-${Date.now().toString().slice(-4)}`,
      orderId: order._id,
      type: 'STOCK_SHORTAGE',
      description: `Insufficient stock for product SKU: ${missingSku}. Shortage of ${missingQty} units.`,
      status: 'OPEN',
    });

    await ActivityLog.create({
      orderId: order._id,
      action: 'Stock Shortage Detected',
      performedBy: { name: 'Allocation Engine', role: 'SYSTEM' },
      details: `Shortage of ${missingQty} units for SKU ${missingSku}. Order paused.`,
    });
  } else {
    order.status = 'ALLOCATED';
    order.shortageDetails = { isShortage: false, missingSku: '', quantityNeeded: 0 };
    await order.save();

    await ActivityLog.create({
      orderId: order._id,
      action: 'Inventory Allocated',
      performedBy: { name: 'Allocation Engine', role: 'SYSTEM' },
      details: 'All items successfully allocated and reserved.',
    });
  }

  return order;
};

module.exports = { processInventoryAllocation };
