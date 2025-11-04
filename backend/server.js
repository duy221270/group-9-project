// File: backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors'); // THÊM: import cors
const logRoutes = require('./routes/logRoutes');

// Import các file routes
const userRoutes = require('./routes/user.js');
const authRoutes = require('./routes/authRoutes.js'); // THÊM: import authRoutes

dotenv.config();
const app = express();

// Sử dụng middleware
app.use(cors()); // THÊM: để cho phép frontend gọi
app.use(express.json());
app.use('/api/logs', logRoutes);

const PORT = process.env.PORT || 5000; // Nên dùng port 5000 để tránh trùng React

// Sử dụng các routes với tiền tố rõ ràng
app.use('/api/auth', authRoutes); // API cho đăng ký, đăng nhập
app.use('/api/users', userRoutes); // API cho quản lý (dùng sau)
// Cấu hình avatar
require('./config/cloudinary');

// Kết nối với MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error('❌ Connection error:', error.message);
  });