const express = require('express');
const router = express.Router();

// Import controller để xử lý logic
const {
  getAllUsers,
  createUser,
} = require('../controllers/userController.js');

// Định nghĩa các đường dẫn
// GET /api/users
router.get('/users', getAllUsers);

// POST /api/users
router.post('/users', createUser);

// Xuất router để server.js có thể dùng
module.exports = router;