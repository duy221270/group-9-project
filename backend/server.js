// File: backend/server.js

const express = require('express');
const mongoose = require('mongoose'); // 1. Import Mongoose
const dotenv = require('dotenv');
const userRoutes = require('./routes/user.js');

dotenv.config();
const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

// 2. Sử dụng các routes
app.use('/api', userRoutes);

// 3. Kết nối với MongoDB
// Best practice: Chỉ khởi động server sau khi kết nối DB thành công
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    // Bắt đầu lắng nghe request
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch((error) => {
    // Bắt lỗi nếu không kết nối được
    console.error('❌ Connection error:', error.message);
  });