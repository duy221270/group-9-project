const express = require('express');
const router = express.Router();

// 1. Import thêm updateUser và deleteUser từ controller
const {
  getAllUsers,
  createUser,
  updateUser,    // Mới
  deleteUser,    // Mới
} = require('../controllers/userController.js');

// Định nghĩa các đường dẫn (routes)
// GET /api/users - Lấy tất cả user
router.get('/users', getAllUsers);

// POST /api/users - Tạo user mới
router.post('/users', createUser);

// 2. Thêm route cho việc cập nhật user bằng ID
// PUT /api/users/:id
router.put('/users/:id', updateUser);

// 3. Thêm route cho việc xóa user bằng ID
// DELETE /api/users/:id
router.delete('/users/:id', deleteUser);

// Xuất router để server.js có thể dùng
module.exports = router;