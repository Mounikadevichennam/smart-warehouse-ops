const mongoose = require('mongoose');
const Task = require('../models/Task');
const Worker = require('../models/Worker');
const Order = require('../models/Order');
const ActivityLog = require('../models/ActivityLog');
const { store } = require('./memoryStore');

// Map warehouse stage to worker role
const STAGE_TO_ROLE = {
  PICKING: 'Picker',
  PACKING: 'Packer',
  QC: 'QC',
  DISPATCH: 'Dispatch',
  RETURN_TO_STOCK: 'Picker',
};

const triggerTaskAssignment = async () => {
  if (mongoose.connection.readyState === 1) {
    const pendingTasks = await Task.find({ status: 'PENDING' }).sort({ priorityScore: -1, createdAt: -1 });

    for (const task of pendingTasks) {
      const requiredRole = STAGE_TO_ROLE[task.stage];
      if (!requiredRole) continue;

      const worker = await Worker.findOne({ role: requiredRole, status: 'IDLE' }).sort({ completedTasksCount: 1 });

      if (worker) {
        task.assignedWorkerId = worker._id;
        task.status = 'IN_PROGRESS';
        task.startedAt = new Date();
        await task.save();

        worker.status = 'BUSY';
        worker.activeTaskId = task._id;
        await worker.save();

        const order = await Order.findById(task.orderId);
        if (order) {
          if (task.stage === 'PICKING') order.status = 'PICKING_IN_PROGRESS';
          else if (task.stage === 'PACKING') order.status = 'PACKING_IN_PROGRESS';
          else if (task.stage === 'QC') order.status = 'QC_IN_PROGRESS';
          else if (task.stage === 'DISPATCH') order.status = 'DISPATCH_IN_PROGRESS';
          await order.save();
        }

        await ActivityLog.create({
          orderId: task.orderId,
          action: `Task Assigned (${task.stage})`,
          performedBy: { name: 'Auto Task Engine', role: 'SYSTEM' },
          details: `Assigned task ${task.taskNumber} to worker ${worker.name} (${worker.role}).`,
        });
      }
    }
  } else {
    // Memory Store Auto Task Assignment
    const pendingTasks = store.tasks
      .filter((t) => t.status === 'PENDING')
      .sort((a, b) => (b.priorityScore || 50) - (a.priorityScore || 50));

    for (const task of pendingTasks) {
      const requiredRole = STAGE_TO_ROLE[task.stage];
      if (!requiredRole) continue;

      const worker = store.workers
        .filter((w) => w.role === requiredRole && w.status === 'IDLE')
        .sort((a, b) => (a.completedTasksCount || 0) - (b.completedTasksCount || 0))[0];

      if (worker) {
        task.assignedWorkerId = worker._id;
        task.assignedWorkerObj = worker;
        task.status = 'IN_PROGRESS';
        task.startedAt = new Date();

        worker.status = 'BUSY';
        worker.activeTaskId = task._id;

        const order = store.orders.find((o) => o._id === task.orderId);
        if (order) {
          if (task.stage === 'PICKING') order.status = 'PICKING_IN_PROGRESS';
          else if (task.stage === 'PACKING') order.status = 'PACKING_IN_PROGRESS';
          else if (task.stage === 'QC') order.status = 'QC_IN_PROGRESS';
          else if (task.stage === 'DISPATCH') order.status = 'DISPATCH_IN_PROGRESS';
        }

        store.activityLogs.unshift({
          _id: `act_${Date.now()}`,
          orderId: task.orderId,
          action: `Task Assigned (${task.stage})`,
          performedBy: { name: 'Auto Task Engine', role: 'SYSTEM' },
          details: `Assigned task ${task.taskNumber} to worker ${worker.name} (${worker.role}).`,
          timestamp: new Date(),
        });
      }
    }
  }
};

const assignNextTaskForWorker = async (workerId) => {
  if (mongoose.connection.readyState === 1) {
    let worker = await Worker.findById(workerId);
    if (!worker) return null;

    if (worker.activeTaskId) {
      const activeTask = await Task.findById(worker.activeTaskId);
      if (activeTask && activeTask.status === 'IN_PROGRESS') return activeTask;
    }

    const eligibleStages = Object.keys(STAGE_TO_ROLE).filter(
      (stage) => STAGE_TO_ROLE[stage] === worker.role
    );

    const pendingTask = await Task.findOne({
      stage: { $in: eligibleStages },
      status: 'PENDING',
    }).sort({ priorityScore: -1, createdAt: -1 });

    if (pendingTask) {
      pendingTask.assignedWorkerId = worker._id;
      pendingTask.status = 'IN_PROGRESS';
      pendingTask.startedAt = new Date();
      await pendingTask.save();

      worker.status = 'BUSY';
      worker.activeTaskId = pendingTask._id;
      await worker.save();

      const order = await Order.findById(pendingTask.orderId);
      if (order) {
        if (pendingTask.stage === 'PICKING') order.status = 'PICKING_IN_PROGRESS';
        else if (pendingTask.stage === 'PACKING') order.status = 'PACKING_IN_PROGRESS';
        else if (pendingTask.stage === 'QC') order.status = 'QC_IN_PROGRESS';
        else if (pendingTask.stage === 'DISPATCH') order.status = 'DISPATCH_IN_PROGRESS';
        await order.save();
      }

      return pendingTask;
    }

    worker.status = 'IDLE';
    worker.activeTaskId = null;
    await worker.save();
  } else {
    // Memory Store worker task pull
    let worker = store.workers.find((w) => w._id === workerId);
    if (!worker) return null;

    if (worker.activeTaskId) {
      const activeTask = store.tasks.find((t) => t._id === worker.activeTaskId && t.status === 'IN_PROGRESS');
      if (activeTask) return activeTask;
    }

    const eligibleStages = Object.keys(STAGE_TO_ROLE).filter(
      (stage) => STAGE_TO_ROLE[stage] === worker.role
    );

    const pendingTask = store.tasks
      .filter((t) => eligibleStages.includes(t.stage) && t.status === 'PENDING')
      .sort((a, b) => (b.priorityScore || 50) - (a.priorityScore || 50))[0];

    if (pendingTask) {
      pendingTask.assignedWorkerId = worker._id;
      pendingTask.assignedWorkerObj = worker;
      pendingTask.status = 'IN_PROGRESS';
      pendingTask.startedAt = new Date();

      worker.status = 'BUSY';
      worker.activeTaskId = pendingTask._id;

      const order = store.orders.find((o) => o._id === pendingTask.orderId);
      if (order) {
        if (pendingTask.stage === 'PICKING') order.status = 'PICKING_IN_PROGRESS';
        else if (pendingTask.stage === 'PACKING') order.status = 'PACKING_IN_PROGRESS';
        else if (pendingTask.stage === 'QC') order.status = 'QC_IN_PROGRESS';
        else if (pendingTask.stage === 'DISPATCH') order.status = 'DISPATCH_IN_PROGRESS';
      }

      return pendingTask;
    }

    worker.status = 'IDLE';
    worker.activeTaskId = null;
  }

  return null;
};

module.exports = { triggerTaskAssignment, assignNextTaskForWorker };
