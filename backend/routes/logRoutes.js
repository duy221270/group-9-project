const express = require('express');
const router = express.Router();
const { getAllLogs } = require('../controllers/logController');
const { protect, checkRole } = require('../middleware/authMiddleware');

// API này chỉ Admin mới được truy cập
router.get('/', [protect, checkRole(['admin'])], getAllLogs);

module.exports = router;