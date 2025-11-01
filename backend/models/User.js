// File: backend/models/User.js

const mongoose = require('mongoose');

// Định nghĩa cấu trúc (Schema) cho User
const userSchema = new mongoose.Schema(
  {
    // --- Các trường chính ---
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'moderator', 'admin'], 
      default: 'user',
    },
    // --- Trường avatar (Hoạt động 4) ---
    avatar: {
      type: String,
      default: 'https://res.cloudinary.com/demo/image/upload/w_150,h_150,c_fill,g_face/sample.jpg' // URL mặc định ví dụ
    },
    // --- Các trường reset mật khẩu (Hoạt động 4) ---
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    // --- Tùy chọn timestamps ---
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

// Tạo và export Model từ Schema đã định nghĩa
module.exports = mongoose.model('User', userSchema);