const Log = require('../models/Log');

/**
 * Middleware để ghi lại hành động của user
 * @param {string} action - Mô tả hành động (ví dụ: 'UPDATED_PROFILE')
 */
const logActivity = (action) => {
  return async (req, res, next) => {
    try {
      // Middleware này PHẢI chạy sau middleware 'protect'
      // để chúng ta có req.user
      if (req.user) {
        await Log.create({
          user: req.user._id,
          action: action,
          ipAddress: req.ip, // Lấy IP từ request
        });
      }
    } catch (error) {
      // Quan trọng: Không dừng request ngay cả khi log lỗi
      console.error('Lỗi khi ghi log:', error);
    }
    // Luôn đi tiếp
    next();
  };
};

module.exports = logActivity;