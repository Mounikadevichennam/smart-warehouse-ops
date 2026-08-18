const express = require('express');
const router = express.Router();
const { getWorkers, getUsers } = require('../controllers/workerController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/', protect, authorizeRoles('MANAGER', 'SUPERVISOR', 'ADMIN'), getWorkers);
router.get('/users', protect, authorizeRoles('ADMIN'), getUsers);

module.exports = router;
