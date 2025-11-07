const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const refreshTokenSchema = new Schema({
  // Tham chiếu đến user sở hữu token này
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Chuỗi token
  token: {
    type: String,
    required: true,
    unique: true,
  },
  // Thêm thời gian hết hạn (ví dụ: 7 ngày)
  // Giúp chúng ta tự động dọn dẹp DB
  expiresAt: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);