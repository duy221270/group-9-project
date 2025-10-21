// File: backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { signup, login, logout } = require('../controllers/authController.js');

// Định nghĩa các API endpoint cho xác thực
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

module.exports = router;