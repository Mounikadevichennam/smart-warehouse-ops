const Exception = require('../models/Exception');
const Task = require('../models/Task');
const Order = require('../models/Order');
const Worker = require('../models/Worker');
const ActivityLog = require('../models/ActivityLog');
const { assignNextTaskForWorker } = require('./taskAssignmentEngine');

const handleWorkerReportException = async ({ taskId, workerId, type, description }) => {
  const task = await Task.findById(taskId);
  const worker = await Worker.findById(workerId);
  if (!task || !worker) throw new Error('Task or Worker not found');

  task.status = 'PAUSED';
  await task.save();

  const order = await Order.findById(task.orderId);
  if (order) {
    order.status = 'EXCEPTION_PAUSED';
    await order.save();
  }

  const expNumber = `EXP-${Date.now().toString().slice(-4)}`;
  const exception = await Exception.create({
    exceptionNumber: expNumber,
    orderId: task.orderId,
    taskId: task._id,
    reportedByWorkerId: worker._id,
    type,
    description,
    status: 'OPEN',
  });

  // Free up worker & immediately assign next task
  worker.status = 'IDLE';
  worker.activeTaskId = null;
  await worker.save();

  await ActivityLog.create({
    orderId: task.orderId,
    action: `Exception Reported (${type})`,
    performedBy: { id: worker._id, name: worker.name, role: worker.role },
    details: `Task ${task.taskNumber} paused due to: ${description}`,
  });

  // Auto assign worker to next suitable task
  await assignNextTaskForWorker(worker._id);

  return exception;
};

const resolveException = async ({ exceptionId, userId, resolutionNotes }) => {
  const exception = await Exception.findById(exceptionId);
  if (!exception) throw new Error('Exception not found');

  exception.status = 'RESOLVED';
  exception.resolutionNotes = resolutionNotes;
  exception.resolvedByUserId = userId;
  exception.resolvedAt = new Date();
  await exception.save();

  if (exception.taskId) {
    const task = await Task.findById(exception.taskId);
    if (task) {
      task.status = 'PENDING'; // Unpause task
      await task.save();
    }
  }

  if (exception.orderId) {
    const order = await Order.findById(exception.orderId);
    if (order && order.status === 'EXCEPTION_PAUSED') {
      order.status = 'ALLOCATED'; // Return to pipeline
      await order.save();
    }
  }

  await ActivityLog.create({
    orderId: exception.orderId,
    action: 'Exception Resolved',
    performedBy: { id: userId, name: 'Supervisor/Manager', role: 'SUPERVISOR' },
    details: `Exception ${exception.exceptionNumber} resolved: ${resolutionNotes}`,
  });

  return exception;
};

module.exports = { handleWorkerReportException, resolveException };
