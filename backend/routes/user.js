// File: backend/routes/user.js

const express = require('express');
const router = express.Router();

// 1. Import cả 'protect' và 'admin'
const { protect, admin } = require('../middleware/authMiddleware');

// 2. Import các hàm controllers (giữ nguyên)
const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserProfile,
  updateUserProfile,
} = require('../controllers/userController.js');

// --- Routes cá nhân (Hoạt động 2 - Giữ nguyên) ---
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// --- Routes ADMIN (Hoạt động 3 - CẬP NHẬT) ---
// Thêm [protect, admin] vào trước hàm controller.
// Yêu cầu: Phải đăng nhập (protect) VÀ phải là admin (admin).

// GET /api/users (Danh sách user - yêu cầu của HĐ 3)
router.get('/users', [protect, admin], getAllUsers);

// DELETE /api/users/:id (Xóa user - yêu cầu của HĐ 3)
router.delete('/users/:id', [protect, admin], deleteUser);

// (Bonus: Bảo vệ luôn các route admin khác mà bạn đã có)
router.post('/users', [protect, admin], createUser);
router.put('/users/:id', [protect, admin], updateUser);

module.exports = router;