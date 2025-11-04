const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const logSchema = new Schema(
  {
    // User thực hiện hành động
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Hành động đã làm (ví dụ: 'USER_LOGIN', 'UPDATED_PROFILE')
    action: {
      type: String,
      required: true,
    },
    // (Tùy chọn) Ghi lại IP để tăng bảo mật
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true, // Tự động thêm 'createdAt' làm timestamp
  }
);

module.exports = mongoose.model('Log', logSchema);