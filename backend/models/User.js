// File: backend/models/User.js

const mongoose = require('mongoose');

// Định nghĩa cấu trúc (Schema) cho User
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    // Bổ sung: trường password để lưu mật khẩu đã mã hóa
    password: {
      type: String,
      required: true,
    },
    // Bổ sung: trường role để phân quyền
    role: {
      type: String,
      enum: ['user', 'admin'], // Chỉ cho phép 2 giá trị này
      default: 'user',        // Mặc định là user thường
    },
  },
  {
    // Bổ sung: tự động thêm createdAt và updatedAt
    timestamps: true,
  }
);

// Tạo và export Model từ Schema đã định nghĩa
module.exports = mongoose.model('User', userSchema);