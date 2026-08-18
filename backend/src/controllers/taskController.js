const mongoose = require('mongoose');
const Task = require('../models/Task');
const Order = require('../models/Order');
const Worker = require('../models/Worker');
const Product = require('../models/Product');
const OrderItem = require('../models/OrderItem');
const Exception = require('../models/Exception');
const ActivityLog = require('../models/ActivityLog');
const { store } = require('../services/memoryStore');
const { triggerTaskAssignment, assignNextTaskForWorker } = require('../services/taskAssignmentEngine');

const getMyActiveTask = async (req, res) => {
  try {
    const workerId = req.account.id;

    if (mongoose.connection.readyState === 1) {
      let task = await Task.findOne({ assignedWorkerId: workerId, status: 'IN_PROGRESS' })
        .populate('orderId')
        .populate('items.productId');

      if (!task) {
        task = await assignNextTaskForWorker(workerId);
        if (task) {
          task = await Task.findById(task._id).populate('orderId').populate('items.productId');
        }
      }

      if (task && task.orderId) {
        const items = await OrderItem.find({ orderId: task.orderId._id }).populate('productId');
        return res.json({ task, items });
      }
    } else {
      let task = store.tasks.find((t) => t.assignedWorkerId === workerId && t.status === 'IN_PROGRESS');

      if (!task) {
        task = await assignNextTaskForWorker(workerId);
      }

      if (task) {
        const orderObj = store.orders.find((o) => o._id === task.orderId) || {
          orderNumber: 'ORD-1025',
          customerName: 'Apex Logistics',
          deliveryDeadline: new Date(),
        };
        const items = store.orderItems.filter((i) => i.orderId === task.orderId);

        return res.json({
          task: { ...task, orderId: orderObj },
          items: items.length > 0 ? items : [{ _id: 'item_1', productId: { sku: 'PRD-001', name: 'Wireless Ergonomic Mouse' }, requestedQuantity: 2 }],
        });
      }
    }

    res.json({ task: null, items: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const completeTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const workerId = req.account.id;
    const { action } = req.body || {}; // e.g. 'PASS' or 'FAIL' for QC

    if (mongoose.connection.readyState === 1) {
      const task = await Task.findById(taskId);
      if (!task) return res.status(404).json({ message: 'Task not found' });

      const worker = await Worker.findById(workerId);
      const order = await Order.findById(task.orderId);
      if (!order) return res.status(404).json({ message: 'Associated order not found' });

      if (!order.traceability) order.traceability = {};

      // Handle QC Failure
      if (task.stage === 'QC' && action === 'FAIL') {
        task.status = 'PAUSED';
        await task.save();

        order.status = 'EXCEPTION_PAUSED';
        order.traceability.qc = {
          workerId: worker?._id || workerId,
          name: worker?.name || 'QC Inspector',
          timestamp: new Date(),
          status: 'QC_FAILED',
        };
        await order.save();

        if (worker) {
          worker.status = 'IDLE';
          worker.activeTaskId = null;
          await worker.save();
        }

        await Exception.create({
          exceptionNumber: `EXP-QC-${Date.now().toString().slice(-4)}`,
          orderId: order._id,
          taskId: task._id,
          reportedByWorkerId: worker ? worker._id : null,
          type: 'QC_FAILURE',
          description: 'Quality Control inspection failed. Product or packaging damaged.',
          status: 'OPEN',
        });

        await ActivityLog.create({
          orderId: order._id,
          action: 'QC Failed',
          performedBy: { id: worker?._id, name: worker?.name || 'QC Worker', role: 'QC' },
          details: `QC inspection failed for order ${order.orderNumber}. Order paused for Supervisor review.`,
        });

        await assignNextTaskForWorker(workerId);
        return res.json({ message: 'QC marked as FAIL. Exception logged and task paused.', status: 'FAILED' });
      }

      // Successful Completion
      task.status = 'COMPLETED';
      task.completedAt = new Date();
      await task.save();

      if (worker) {
        worker.status = 'IDLE';
        worker.activeTaskId = null;
        worker.completedTasksCount += 1;
        await worker.save();
      }

      // Stage Machine with Traceability Timestamps & Worker Record
      if (task.stage === 'PICKING') {
        order.status = 'PICKED';
        order.stageTimestamps.pickedAt = new Date();
        order.traceability.picker = {
          workerId: worker?._id || workerId,
          name: worker?.name || 'Suresh Reddy',
          timestamp: new Date(),
        };
        await order.save();

        await Task.create({
          taskNumber: `TSK-PAK-${Date.now().toString().slice(-4)}`,
          orderId: order._id,
          stage: 'PACKING',
          status: 'PENDING',
          priority: order.priority,
          priorityScore: order.priorityScore,
          locationInfo: task.locationInfo,
        });

        await ActivityLog.create({
          orderId: order._id,
          action: 'Picking Completed',
          performedBy: { id: worker?._id, name: worker?.name, role: 'Picker' },
          details: `Order ${order.orderNumber} picked by ${worker?.name}. Advanced to PACKING stage.`,
        });
      } else if (task.stage === 'PACKING') {
        order.status = 'PACKED';
        order.stageTimestamps.packedAt = new Date();
        order.traceability.packer = {
          workerId: worker?._id || workerId,
          name: worker?.name || 'Priya Naidu',
          timestamp: new Date(),
        };
        await order.save();

        await Task.create({
          taskNumber: `TSK-QC-${Date.now().toString().slice(-4)}`,
          orderId: order._id,
          stage: 'QC',
          status: 'PENDING',
          priority: order.priority,
          priorityScore: order.priorityScore,
          locationInfo: task.locationInfo,
        });

        await ActivityLog.create({
          orderId: order._id,
          action: 'Packing Completed',
          performedBy: { id: worker?._id, name: worker?.name, role: 'Packer' },
          details: `Order ${order.orderNumber} packed by ${worker?.name}. Advanced to QC stage.`,
        });
      } else if (task.stage === 'QC') {
        order.status = 'QC_PASSED';
        order.stageTimestamps.qcPassedAt = new Date();
        order.traceability.qc = {
          workerId: worker?._id || workerId,
          name: worker?.name || 'Meena Devi',
          timestamp: new Date(),
          status: 'QC_PASSED',
        };
        await order.save();

        await Task.create({
          taskNumber: `TSK-DSP-${Date.now().toString().slice(-4)}`,
          orderId: order._id,
          stage: 'DISPATCH',
          status: 'PENDING',
          priority: order.priority,
          priorityScore: order.priorityScore,
          locationInfo: task.locationInfo,
        });

        await ActivityLog.create({
          orderId: order._id,
          action: 'QC Passed',
          performedBy: { id: worker?._id, name: worker?.name, role: 'QC' },
          details: `Order ${order.orderNumber} passed QC inspection by ${worker?.name}. Advanced to DISPATCH stage.`,
        });
      } else if (task.stage === 'DISPATCH') {
        order.status = 'DISPATCHED';
        order.stageTimestamps.dispatchedAt = new Date();
        order.traceability.dispatcher = {
          workerId: worker?._id || workerId,
          name: worker?.name || 'Arjun Singh',
          timestamp: new Date(),
        };
        await order.save();

        const orderItems = await OrderItem.find({ orderId: order._id });
        for (const item of orderItems) {
          const product = await Product.findById(item.productId);
          if (product) {
            product.quantityReserved = Math.max(0, product.quantityReserved - item.allocatedQuantity);
            product.quantityInStock = Math.max(0, product.quantityInStock - item.allocatedQuantity);
            await product.save();
          }
        }

        await ActivityLog.create({
          orderId: order._id,
          action: 'Order Dispatched',
          performedBy: { id: worker?._id, name: worker?.name, role: 'Dispatch' },
          details: `Order ${order.orderNumber} dispatched by ${worker?.name}. Fulfillment complete.`,
        });
      }

      await triggerTaskAssignment();
      const nextTask = await assignNextTaskForWorker(workerId);
      return res.json({ message: 'Task completed successfully', nextTask });
    } else {
      // Memory Store Implementation
      const task = store.tasks.find((t) => t._id === taskId);
      if (!task) return res.status(404).json({ message: 'Task not found' });

      const worker = store.workers.find((w) => w._id === workerId);
      const order = store.orders.find((o) => o._id === task.orderId);
      if (!order) return res.status(404).json({ message: 'Associated order not found' });

      if (!order.traceability) order.traceability = {};

      if (task.stage === 'QC' && action === 'FAIL') {
        task.status = 'PAUSED';
        order.status = 'EXCEPTION_PAUSED';
        order.traceability.qc = {
          workerId,
          name: worker ? worker.name : 'Meena Devi',
          timestamp: new Date(),
          status: 'QC_FAILED',
        };

        if (worker) {
          worker.status = 'IDLE';
          worker.activeTaskId = null;
        }

        store.exceptions.unshift({
          _id: `exp_${Date.now()}`,
          exceptionNumber: `EXP-QC-${Date.now().toString().slice(-4)}`,
          orderId: order._id,
          taskId: task._id,
          reportedByWorkerId: workerId,
          type: 'QC_FAILURE',
          description: 'Quality Control inspection failed. Product or packaging damaged.',
          status: 'OPEN',
          createdAt: new Date(),
        });

        await assignNextTaskForWorker(workerId);
        return res.json({ message: 'QC marked as FAIL. Exception logged and task paused.', status: 'FAILED' });
      }

      task.status = 'COMPLETED';
      if (worker) {
        worker.status = 'IDLE';
        worker.activeTaskId = null;
        worker.completedTasksCount += 1;
      }

      if (task.stage === 'PICKING') {
        order.status = 'PICKED';
        order.traceability.picker = { workerId, name: worker ? worker.name : 'Suresh Reddy', timestamp: new Date() };
        store.tasks.push({
          _id: `task_${Date.now()}`,
          taskNumber: `TSK-PAK-${Date.now().toString().slice(-4)}`,
          orderId: order._id,
          stage: 'PACKING',
          status: 'PENDING',
          priority: order.priority,
          priorityScore: order.priorityScore,
          locationInfo: task.locationInfo,
        });
      } else if (task.stage === 'PACKING') {
        order.status = 'PACKED';
        order.traceability.packer = { workerId, name: worker ? worker.name : 'Priya Naidu', timestamp: new Date() };
        store.tasks.push({
          _id: `task_${Date.now()}`,
          taskNumber: `TSK-QC-${Date.now().toString().slice(-4)}`,
          orderId: order._id,
          stage: 'QC',
          status: 'PENDING',
          priority: order.priority,
          priorityScore: order.priorityScore,
          locationInfo: task.locationInfo,
        });
      } else if (task.stage === 'QC') {
        order.status = 'QC_PASSED';
        order.traceability.qc = { workerId, name: worker ? worker.name : 'Meena Devi', timestamp: new Date(), status: 'QC_PASSED' };
        store.tasks.push({
          _id: `task_${Date.now()}`,
          taskNumber: `TSK-DSP-${Date.now().toString().slice(-4)}`,
          orderId: order._id,
          stage: 'DISPATCH',
          status: 'PENDING',
          priority: order.priority,
          priorityScore: order.priorityScore,
          locationInfo: task.locationInfo,
        });
      } else if (task.stage === 'DISPATCH') {
        order.status = 'DISPATCHED';
        order.traceability.dispatcher = { workerId, name: worker ? worker.name : 'Arjun Singh', timestamp: new Date() };
      }

      await triggerTaskAssignment();
      const nextTask = await assignNextTaskForWorker(workerId);
      return res.json({ message: 'Task completed successfully', nextTask });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const reassignTask = async (req, res) => {
  try {
    const { taskId, newWorkerId } = req.body;
    if (mongoose.connection.readyState === 1) {
      const task = await Task.findById(taskId);
      if (task) {
        task.assignedWorkerId = newWorkerId;
        task.status = 'IN_PROGRESS';
        await task.save();
      }
    } else {
      const task = store.tasks.find((t) => t._id === taskId);
      if (task) {
        task.assignedWorkerId = newWorkerId;
        task.status = 'IN_PROGRESS';

        const worker = store.workers.find((w) => w._id === newWorkerId);
        if (worker) {
          worker.status = 'BUSY';
          worker.activeTaskId = task._id;
        }
      }
    }
    res.json({ message: 'Task reassigned successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyActiveTask, completeTask, reassignTask };
