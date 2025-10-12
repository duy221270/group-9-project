// File: backend/routes/user.js

const express = require('express');
const router = express.Router();

// Import các hàm xử lý từ controller
const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController.js');

// Định nghĩa các đường dẫn (routes)
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Chỉ export duy nhất router
module.exports = router;