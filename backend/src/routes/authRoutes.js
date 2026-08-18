const express = require('express');
const router = express.Router();
const { loginManagement, loginWorker } = require('../controllers/authController');

router.post('/login-management', loginManagement);
router.post('/login-worker', loginWorker);

module.exports = router;
