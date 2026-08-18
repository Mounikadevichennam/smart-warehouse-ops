const calculatePriorityScore = (deliveryDeadline, estimatedTransitDays = 1) => {
  const now = new Date();
  const deadline = new Date(deliveryDeadline);
  
  // Adjusted target deadline minus transit days
  const targetDispatchDeadline = new Date(deadline.getTime() - (estimatedTransitDays - 1) * 24 * 60 * 60 * 1000);
  const hoursRemaining = (targetDispatchDeadline - now) / (1000 * 60 * 60);

  let deadlineScore = 25;
  if (hoursRemaining <= 12) {
    deadlineScore = 100;
  } else if (hoursRemaining <= 24) {
    deadlineScore = 75;
  } else if (hoursRemaining <= 48) {
    deadlineScore = 50;
  }

  // Transit time factor: farther destination needs higher dispatch priority
  const transitScore = Math.min(100, estimatedTransitDays * 30);

  // Weighted score calculation
  const totalScore = Math.round(deadlineScore * 0.6 + transitScore * 0.4);

  let priority = 'NORMAL';
  if (totalScore >= 85) {
    priority = 'CRITICAL';
  } else if (totalScore >= 65) {
    priority = 'HIGH';
  } else if (totalScore >= 45) {
    priority = 'NORMAL';
  } else {
    priority = 'LOW';
  }

  return { priorityScore: totalScore, priority };
};

module.exports = { calculatePriorityScore };
