// File: backend/models/User.js

const mongoose = require('mongoose');

// Định nghĩa cấu trúc (Schema) cho User
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

// Tạo và export Model từ Schema đã định nghĩa
module.exports = mongoose.model('User', userSchema);