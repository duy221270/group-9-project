// File: backend/middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');

// Cấu hình lưu trữ (ở đây dùng bộ nhớ tạm, không lưu file trên server)
const storage = multer.memoryStorage();

// Kiểm tra loại file (chỉ cho phép ảnh)
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Lỗi: Chỉ cho phép upload ảnh!');
  }
}

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
  limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn 5MB
});

// Middleware để xử lý upload một file có tên field là 'avatar'
exports.uploadAvatar = upload.single('avatar');