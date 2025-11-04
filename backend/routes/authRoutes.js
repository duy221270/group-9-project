// File: backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
// 1. Import rate limiter
const { loginLimiter } = require('../middleware/rateLimit');

// 1. Import thêm hàm controller mới
const {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  refreshAccessToken, // <-- HÀM MỚI
} = require('../controllers/authController.js');

// --- Các route cũ ---
router.post('/signup', signup);
router.post('/login', loginLimiter, login);
router.post('/logout', logout); // Route này đã đúng (POST) để nhận body

// --- ROUTE MỚI CHO HOẠT ĐỘNG 1 ---
router.post('/refresh', refreshAccessToken); // <-- ROUTE MỚI

// --- Routes cho Hoạt động 4 (Giữ nguyên) ---
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

module.exports = router;