const express = require('express');
const router = express.Router();
const { getAllExceptions, reportException, resolveExceptionController } = require('../controllers/exceptionController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/', protect, authorizeRoles('MANAGER', 'SUPERVISOR', 'ADMIN'), getAllExceptions);
router.post('/report', protect, reportException);
router.post('/:id/resolve', protect, authorizeRoles('SUPERVISOR', 'MANAGER'), resolveExceptionController);

module.exports = router;
