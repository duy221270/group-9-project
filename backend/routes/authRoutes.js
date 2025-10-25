// File: backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
// 1. Import thêm 2 hàm controller mới
const { signup, login, logout, forgotPassword, resetPassword } = require('../controllers/authController.js');

// --- Các route cũ ---
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

// --- ROUTES MỚI CHO HOẠT ĐỘNG 4 ---
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword); // Dùng PUT và nhận token qua URL params

module.exports = router;