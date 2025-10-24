// File: backend/routes/user.js

const express = require('express');
const router = express.Router();
// Import middleware
const { protect } = require('../middleware/authMiddleware');

// Import các hàm xử lý từ controller
const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserProfile,      // <-- Import hàm mới
  updateUserProfile, // <-- Import hàm mới
} = require('../controllers/userController.js');

router
  .route('/profile')
  .get(protect, getUserProfile)      // GET /api/users/profile
  .put(protect, updateUserProfile);   // PUT /api/users/profile

// --- CÁC ROUTES CŨ (CHO ADMIN - Hoạt động 3) ---
// Bạn có thể cần thêm 'protect' và middleware 'admin' ở Hoạt động 3
router.get('/users', getAllUsers);        // 
router.post('/users', createUser);      // 
router.put('/users/:id', updateUser);     // 
router.delete('/users/:id', deleteUser);  // 

// Chỉ export duy nhất router
module.exports = router;