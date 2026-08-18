const express = require('express');
const router = express.Router();
const { getMyActiveTask, completeTask, reassignTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/my-active', protect, getMyActiveTask);
router.post('/:id/complete', protect, completeTask);
router.post('/reassign', protect, authorizeRoles('SUPERVISOR', 'MANAGER'), reassignTask);

module.exports = router;
