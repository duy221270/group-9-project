const express = require('express');
const router = express.Router();

// 1. Import (Giữ nguyên)
const { protect, checkRole } = require('../middleware/authMiddleware');
const { uploadAvatar: uploadAvatarMiddleware } = require('../middleware/uploadMiddleware');
const logActivity = require('../middleware/logActivity'); // <-- 1. Import

// 2. Import Controllers (Giữ nguyên)
const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserProfile,
  updateUserProfile,
  uploadAvatar
} = require('../controllers/userController.js');

// --- Routes cá nhân (Giữ nguyên) ---
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, logActivity('UPDATED_USER_PROFILE'), updateUserProfile);

router.post(
  '/upload-avatar',
  protect,
  logActivity('UPLOADED_AVATAR'), // <-- Ghi log
  uploadAvatarMiddleware,
  uploadAvatar
);

// --- Routes ADMIN (SỬA LỖI 404) ---

// Sửa '/users' thành '/'
router.get('/', [protect, checkRole(['admin', 'moderator'])], getAllUsers);

// Sửa '/users/:id' thành '/:id'
router.delete('/:id', [protect, checkRole(['admin'])], deleteUser);

// Sửa '/users' thành '/'
router.post('/', [protect, checkRole(['admin'])], createUser);

// Sửa '/users/:id' thành '/:id'
router.put('/:id', [protect, checkRole(['admin', 'moderator'])], updateUser);

module.exports = router;