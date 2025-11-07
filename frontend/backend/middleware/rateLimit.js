const rateLimit = require('express-rate-limit');

// Áp dụng cho API Đăng nhập
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Cho phép tối đa 5 lần thử login trong 15 phút
  message: {
    message: 'Quá nhiều lần thử đăng nhập, vui lòng thử lại sau 15 phút.'
  },
  standardHeaders: true, // Trả về thông tin rate limit trong header
  legacyHeaders: false, // Tắt các header cũ
});

module.exports = {
  loginLimiter,
};