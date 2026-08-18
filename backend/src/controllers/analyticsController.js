const mongoose = require('mongoose');
const Order = require('../models/Order');
const Task = require('../models/Task');
const Worker = require('../models/Worker');
const Exception = require('../models/Exception');
const ActivityLog = require('../models/ActivityLog');
const { calculateWarehouseBottleneck } = require('../services/bottleneckEngine');
const { store } = require('../services/memoryStore');

const getOverviewMetrics = async (req, res) => {
  try {
    let counts = {}, recentActivity = [], bottleneck = {};

    if (mongoose.connection.readyState === 1) {
      const totalOrders = await Order.countDocuments();
      const completedOrders = await Order.countDocuments({ status: 'DISPATCHED' });
      const pendingOrders = await Order.countDocuments({ status: { $nin: ['DISPATCHED', 'CANCELLED'] } });

      const pickedCount = await Order.countDocuments({
        status: {
          $in: [
            'PICKED',
            'PACKING_IN_PROGRESS',
            'PACKED',
            'QC_IN_PROGRESS',
            'QC_PASSED',
            'DISPATCH_IN_PROGRESS',
            'DISPATCHED',
          ],
        },
      });
      const packedCount = await Order.countDocuments({
        status: { $in: ['PACKED', 'QC_IN_PROGRESS', 'QC_PASSED', 'DISPATCH_IN_PROGRESS', 'DISPATCHED'] },
      });
      const qcCount = await Order.countDocuments({
        status: { $in: ['QC_PASSED', 'DISPATCH_IN_PROGRESS', 'DISPATCHED'] },
      });
      const dispatchedCount = await Order.countDocuments({ status: 'DISPATCHED' });

      const openExceptionsCount = await Exception.countDocuments({ status: 'OPEN' });
      const activeWorkersCount = await Worker.countDocuments({ status: 'BUSY' });
      const idleWorkersCount = await Worker.countDocuments({ status: 'IDLE' });

      counts = {
        totalOrders,
        completedOrders,
        pendingOrders,
        pickedCount,
        packedCount,
        qcCount,
        dispatchedCount,
        openExceptionsCount,
        activeWorkersCount,
        idleWorkersCount,
      };

      bottleneck = await calculateWarehouseBottleneck();
      recentActivity = await ActivityLog.find().sort({ timestamp: -1 }).limit(10);
    } else {
      const totalOrders = store.orders.length;
      const completedOrders = store.orders.filter((o) => o.status === 'DISPATCHED').length;
      const pendingOrders = store.orders.filter((o) => !['DISPATCHED', 'CANCELLED'].includes(o.status)).length;

      const pickedCount = store.orders.filter((o) =>
        ['PICKED', 'PACKING_IN_PROGRESS', 'PACKED', 'QC_IN_PROGRESS', 'QC_PASSED', 'DISPATCH_IN_PROGRESS', 'DISPATCHED'].includes(o.status)
      ).length;

      const packedCount = store.orders.filter((o) =>
        ['PACKED', 'QC_IN_PROGRESS', 'QC_PASSED', 'DISPATCH_IN_PROGRESS', 'DISPATCHED'].includes(o.status)
      ).length;

      const qcCount = store.orders.filter((o) =>
        ['QC_PASSED', 'DISPATCH_IN_PROGRESS', 'DISPATCHED'].includes(o.status)
      ).length;

      const dispatchedCount = completedOrders;
      const openExceptionsCount = store.exceptions.filter((e) => e.status === 'OPEN').length;
      const activeWorkersCount = store.workers.filter((w) => w.status === 'BUSY').length;
      const idleWorkersCount = store.workers.filter((w) => w.status === 'IDLE').length;

      counts = {
        totalOrders,
        completedOrders,
        pendingOrders,
        pickedCount,
        packedCount,
        qcCount,
        dispatchedCount,
        openExceptionsCount,
        activeWorkersCount,
        idleWorkersCount,
      };

      bottleneck = {
        currentBottleneckStage: 'PACKING',
        isBottleneckSevere: true,
        recommendation: 'PACKING appears to be the current operational bottleneck due to high queue depth and processing time.',
      };

      recentActivity = store.activityLogs.slice(0, 10);
    }

    res.json({ counts, bottleneck, recentActivity });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBottleneckDetails = async (req, res) => {
  try {
    const analysis = await calculateWarehouseBottleneck();
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getOverviewMetrics, getBottleneckDetails };
