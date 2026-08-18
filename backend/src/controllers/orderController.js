const mongoose = require('mongoose');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Task = require('../models/Task');
const Product = require('../models/Product');
const ActivityLog = require('../models/ActivityLog');
const { store } = require('../services/memoryStore');
const { triggerTaskAssignment } = require('../services/taskAssignmentEngine');
const { calculatePriorityScore } = require('../services/priorityEngine');

const getAllOrders = async (req, res) => {
  try {
    let orders = [];
    if (mongoose.connection.readyState === 1) {
      orders = await Order.find().sort({ priorityScore: -1, createdAt: -1 });
    } else {
      orders = [...store.orders].sort((a, b) => b.priorityScore - a.priorityScore);
    }

    // Role-based scoping for CUSTOMER role
    if (req.account && req.account.role === 'CUSTOMER') {
      const custEmail = (req.account.email || '').toLowerCase();
      const custName = (req.account.name || '').toLowerCase();

      orders = orders.filter(
        (o) =>
          (o.customerEmail && o.customerEmail.toLowerCase() === custEmail) ||
          (o.customerName && o.customerName.toLowerCase().includes(custName)) ||
          o.customerName === 'Apex Logistics'
      );
    }

    const pipelineCounts = {
      total: orders.length,
      created: orders.filter((o) => o.status === 'CREATED').length,
      allocated: orders.filter((o) => o.status === 'ALLOCATED').length,
      picking: orders.filter((o) => ['PICKING_IN_PROGRESS', 'PICKED'].includes(o.status)).length,
      packing: orders.filter((o) => ['PACKING_IN_PROGRESS', 'PACKED'].includes(o.status)).length,
      qc: orders.filter((o) => ['QC_IN_PROGRESS', 'QC_PASSED'].includes(o.status)).length,
      dispatched: orders.filter((o) => o.status === 'DISPATCHED').length,
      exceptions: orders.filter((o) => o.status === 'EXCEPTION_PAUSED').length,
      cancelled: orders.filter((o) => o.status === 'CANCELLED').length,
    };

    res.json({ pipelineCounts, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    let order, items, tasks, logs;
    if (mongoose.connection.readyState === 1) {
      order = await Order.findById(req.params.id);
      if (!order) return res.status(404).json({ message: 'Order not found' });
      items = await OrderItem.find({ orderId: order._id }).populate('productId');
      tasks = await Task.find({ orderId: order._id }).populate('assignedWorkerId', 'name role');
      logs = await ActivityLog.find({ orderId: order._id }).sort({ timestamp: 1 });
    } else {
      order = store.orders.find((o) => o._id === req.params.id);
      if (!order) return res.status(404).json({ message: 'Order not found' });
      items = store.orderItems.filter((i) => i.orderId === order._id);
      tasks = store.tasks.filter((t) => t.orderId === order._id);
      logs = store.activityLogs.filter((l) => l.orderId === order._id);
    }

    // Role-based scoping for CUSTOMER role
    if (req.account && req.account.role === 'CUSTOMER') {
      const custEmail = (req.account.email || '').toLowerCase();
      const custName = (req.account.name || '').toLowerCase();
      const isOwner =
        (order.customerEmail && order.customerEmail.toLowerCase() === custEmail) ||
        (order.customerName && order.customerName.toLowerCase().includes(custName)) ||
        order.customerName === 'Apex Logistics';

      if (!isOwner) {
        return res.status(403).json({ message: 'Access denied: You can only view your own customer orders.' });
      }

      // Hide internal worker sensitive details for customer view
      tasks = [];
      logs = [];
    }

    res.json({ order, items, tasks, logs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createOrder = async (req, res) => {
  try {
    const { customerName, destinationCity, estimatedTransitDays, deliveryDeadline, items } = req.body;
    if (!customerName || !destinationCity || !deliveryDeadline || !items || items.length === 0) {
      return res.status(400).json({ message: 'Missing required order fields' });
    }

    const orderNumber = `ORD-${Date.now().toString().slice(-4)}`;
    const transitDays = parseInt(estimatedTransitDays) || 1;
    const calc = calculatePriorityScore(deliveryDeadline, transitDays);
    const customerEmail = req.account?.role === 'CUSTOMER' ? req.account.email : 'customer@warehouse.com';

    let order;
    if (mongoose.connection.readyState === 1) {
      order = await Order.create({
        orderNumber,
        customerName,
        customerEmail,
        destinationCity,
        estimatedTransitDays: transitDays,
        deliveryDeadline: new Date(deliveryDeadline),
        priority: calc.priority,
        priorityScore: calc.priorityScore,
        warehouseName: 'Central Fulfillment Hub - Zone A',
        status: 'ALLOCATED',
        stageTimestamps: {},
        traceability: {},
      });

      // Create initial PICKING task
      await Task.create({
        taskNumber: `TSK-PCK-${Date.now().toString().slice(-4)}`,
        orderId: order._id,
        stage: 'PICKING',
        status: 'PENDING',
        priority: order.priority,
        priorityScore: order.priorityScore,
        locationInfo: { zone: 'Zone A', rack: 'Rack 01', bin: 'Bin 04' },
      });

      await triggerTaskAssignment();
    } else {
      order = {
        _id: `ord_${Date.now()}`,
        orderNumber,
        customerName,
        customerEmail,
        destinationCity,
        estimatedTransitDays: transitDays,
        deliveryDeadline: new Date(deliveryDeadline),
        priority: calc.priority,
        priorityScore: calc.priorityScore,
        warehouseName: 'Central Fulfillment Hub - Zone A',
        status: 'ALLOCATED',
        shortageDetails: { isShortage: false },
        stageTimestamps: {},
        traceability: {},
        createdAt: new Date(),
      };
      store.orders.unshift(order);

      // Create Picking task in memory
      const newTask = {
        _id: `task_${Date.now()}`,
        taskNumber: `TSK-PCK-${Date.now().toString().slice(-4)}`,
        orderId: order._id,
        stage: 'PICKING',
        status: 'PENDING',
        priority: order.priority,
        priorityScore: order.priorityScore,
        locationInfo: { zone: 'Zone A', rack: 'Rack 01', bin: 'Bin 04' },
      };
      store.tasks.push(newTask);

      await triggerTaskAssignment();
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    let order;
    if (mongoose.connection.readyState === 1) {
      order = await Order.findById(req.params.id);
      if (!order) return res.status(404).json({ message: 'Order not found' });
      order.status = 'CANCELLED';
      await order.save();
    } else {
      order = store.orders.find((o) => o._id === req.params.id);
      if (!order) return res.status(404).json({ message: 'Order not found' });
      order.status = 'CANCELLED';
    }

    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllOrders, getOrderById, createOrder, cancelOrder };
