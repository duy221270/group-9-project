// File: backend/config/cloudinary.js
const cloudinary = require('cloudinary').v2; // Quan trọng: Phải có .v2
const dotenv = require('dotenv');

dotenv.config(); // Gọi dotenv.config() ĐỂ ĐỌC BIẾN MÔI TRƯỜNG

// Kiểm tra xem biến môi trường có được đọc không (Thêm log này)
console.log('Cloudinary Config Check:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'Loaded' : 'MISSING',
  api_key: process.env.CLOUDINARY_API_KEY ? 'Loaded' : 'MISSING',
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'Loaded' : 'MISSING'
});

cloudinary.config({ // Gọi hàm config() để cấu hình
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});
console.log('Cloudinary uploader IN CONFIG FILE:', cloudinary.uploader ? 'Exists' : 'UNDEFINED');
// Quan trọng: Export chính đối tượng cloudinary đã được cấu hình
module.exports = cloudinary;