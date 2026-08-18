const express = require('express');
const router = express.Router();
const { getAllOrders, getOrderById, createOrder, cancelOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/', protect, authorizeRoles('MANAGER', 'SUPERVISOR', 'ADMIN', 'CUSTOMER'), getAllOrders);
router.get('/:id', protect, getOrderById);
router.post('/', protect, authorizeRoles('MANAGER', 'ADMIN', 'CUSTOMER'), createOrder);
router.post('/:id/cancel', protect, authorizeRoles('MANAGER', 'SUPERVISOR'), cancelOrder);

module.exports = router;
