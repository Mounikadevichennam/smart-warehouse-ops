const express = require('express');
const router = express.Router();
const { getInventory, getLocations } = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getInventory);
router.get('/locations', protect, getLocations);

module.exports = router;
