const Task = require('../models/Task');
const Worker = require('../models/Worker');
const Order = require('../models/Order');

const calculateWarehouseBottleneck = async () => {
  const stages = ['PICKING', 'PACKING', 'QC', 'DISPATCH'];
  const bottleneckAnalysis = [];

  for (const stage of stages) {
    const activeTasks = await Task.countDocuments({ stage, status: { $in: ['PENDING', 'IN_PROGRESS'] } });
    const completedTasks = await Task.find({ stage, status: 'COMPLETED' });

    let totalDurationMinutes = 0;
    let validTaskCount = 0;

    completedTasks.forEach((t) => {
      if (t.startedAt && t.completedAt) {
        const duration = (new Date(t.completedAt) - new Date(t.startedAt)) / (1000 * 60);
        if (duration > 0) {
          totalDurationMinutes += duration;
          validTaskCount++;
        }
      }
    });

    const avgDurationMinutes = validTaskCount > 0 ? Math.round(totalDurationMinutes / validTaskCount) : 10;
    const activeWorkers = await Worker.countDocuments({
      role: stage === 'PICKING' ? 'Picker' : stage === 'PACKING' ? 'Packer' : stage,
    });

    const bottleneckScore = (activeTasks / Math.max(1, activeWorkers)) * avgDurationMinutes;

    bottleneckAnalysis.push({
      stage,
      activeTasks,
      activeWorkers,
      avgDurationMinutes,
      bottleneckScore: Math.round(bottleneckScore * 10) / 10,
    });
  }

  // Sort by bottleneckScore descending
  bottleneckAnalysis.sort((a, b) => b.bottleneckScore - a.bottleneckScore);
  const highestBottleneck = bottleneckAnalysis[0];

  const isBottleneckSevere = highestBottleneck && highestBottleneck.bottleneckScore > 15;

  return {
    stages: bottleneckAnalysis,
    currentBottleneckStage: highestBottleneck ? highestBottleneck.stage : 'None',
    isBottleneckSevere,
    recommendation: isBottleneckSevere
      ? `${highestBottleneck.stage} appears to be the current operational bottleneck due to high queue depth and processing time.`
      : 'Warehouse operations are currently running smoothly without major bottlenecks.',
  };
};

module.exports = { calculateWarehouseBottleneck };
