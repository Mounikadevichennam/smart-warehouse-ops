const express = require('express');
const router = express.Router();
const { getRestockRequests, createRestockRequest, confirmRestock } = require('../controllers/restockController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/', protect, authorizeRoles('MANAGER', 'SUPERVISOR', 'ADMIN'), getRestockRequests);
router.post('/request', protect, authorizeRoles('MANAGER'), createRestockRequest);
router.post('/:id/confirm', protect, authorizeRoles('ADMIN'), confirmRestock);

module.exports = router;
