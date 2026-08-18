const mongoose = require('mongoose');
const Exception = require('../models/Exception');
const Task = require('../models/Task');
const Order = require('../models/Order');
const Worker = require('../models/Worker');
const { store } = require('../services/memoryStore');

const getAllExceptions = async (req, res) => {
  try {
    let exceptions = [];
    if (mongoose.connection.readyState === 1) {
      exceptions = await Exception.find()
        .populate('orderId')
        .populate('taskId')
        .populate('reportedByWorkerId', 'name role email')
        .populate('resolvedByUserId', 'name role')
        .sort({ createdAt: -1 });
    } else {
      exceptions = store.exceptions.map((exp) => {
        const orderObj = store.orders.find((o) => o._id === exp.orderId);
        const taskObj = store.tasks.find((t) => t._id === exp.taskId);
        const workerObj = store.workers.find((w) => w._id === exp.reportedByWorkerId);
        return {
          ...exp,
          orderId: orderObj,
          taskId: taskObj,
          reportedByWorkerId: workerObj,
        };
      });
    }
    res.json(exceptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const reportException = async (req, res) => {
  try {
    const { taskId, type, description } = req.body;
    const workerId = req.account.id;

    if (mongoose.connection.readyState === 1) {
      const task = await Task.findById(taskId);
      if (task) {
        task.status = 'PAUSED';
        await task.save();

        const order = await Order.findById(task.orderId);
        if (order) {
          order.status = 'EXCEPTION_PAUSED';
          await order.save();
        }

        const exp = await Exception.create({
          exceptionNumber: `EXP-${Date.now().toString().slice(-4)}`,
          orderId: task.orderId,
          taskId: task._id,
          reportedByWorkerId: workerId,
          type,
          description,
          status: 'OPEN',
        });
        return res.status(201).json(exp);
      }
    } else {
      const task = store.tasks.find((t) => t._id === taskId);
      if (task) {
        task.status = 'PAUSED';
        const order = store.orders.find((o) => o._id === task.orderId);
        if (order) order.status = 'EXCEPTION_PAUSED';

        const worker = store.workers.find((w) => w._id === workerId);
        if (worker) {
          worker.status = 'IDLE';
          worker.activeTaskId = null;
        }

        const exp = {
          _id: `exp_${Date.now()}`,
          exceptionNumber: `EXP-${Date.now().toString().slice(-4)}`,
          orderId: task.orderId,
          taskId: task._id,
          reportedByWorkerId: workerId,
          type,
          description,
          status: 'OPEN',
          createdAt: new Date(),
        };
        store.exceptions.unshift(exp);
        return res.status(201).json(exp);
      }
    }

    res.status(400).json({ message: 'Task not found to report exception' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resolveExceptionController = async (req, res) => {
  try {
    const exceptionId = req.params.id;
    const { resolutionNotes } = req.body;

    if (mongoose.connection.readyState === 1) {
      const exception = await Exception.findById(exceptionId);
      if (exception) {
        exception.status = 'RESOLVED';
        exception.resolutionNotes = resolutionNotes;
        exception.resolvedAt = new Date();
        await exception.save();

        const order = await Order.findById(exception.orderId);
        if (order) {
          order.status = 'ALLOCATED';
          await order.save();
        }
      }
    } else {
      const exception = store.exceptions.find((e) => e._id === exceptionId);
      if (exception) {
        exception.status = 'RESOLVED';
        exception.resolutionNotes = resolutionNotes;
        const order = store.orders.find((o) => o._id === exception.orderId);
        if (order) order.status = 'ALLOCATED';
      }
    }

    res.json({ message: 'Exception resolved successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllExceptions, reportException, resolveExceptionController };
