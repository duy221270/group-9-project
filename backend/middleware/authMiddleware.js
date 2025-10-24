// File: backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  // Kiểm tra xem token có được gửi trong header không
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Lấy token từ header (ví dụ: "Bearer ...token...")
      token = req.headers.authorization.split(' ')[1];

      // Xác thực token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Lấy thông tin user từ token và gắn vào req
      // Chúng ta lấy ID user từ token [cite: 2]
      req.user = await User.findById(decoded.userId).select('-password'); 

      next(); // Cho phép đi tiếp
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};
exports.admin = (req, res, next) => {
  // Hàm này PHẢI chạy SAU hàm 'protect',
  // vì nó cần 'req.user' mà hàm 'protect' đã cung cấp.
  
  if (req.user && req.user.role === 'admin') {
    next(); // Nếu là admin, cho phép đi tiếp
  } else {
    // 403 Forbidden - Bị cấm (khác với 401 Unauthorized - chưa xác thực)
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};