const express = require('express');
const router = express.Router();
const { getOverviewMetrics, getBottleneckDetails } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/overview', protect, authorizeRoles('MANAGER', 'SUPERVISOR', 'ADMIN'), getOverviewMetrics);
router.get('/bottlenecks', protect, authorizeRoles('MANAGER', 'SUPERVISOR'), getBottleneckDetails);

module.exports = router;
