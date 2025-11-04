const Log = require('../models/Log');

// Lấy tất cả logs (cho Admin)
exports.getAllLogs = async (req, res) => {
  try {
    // Sắp xếp mới nhất lên đầu, và populate thông tin user (tên, email)
    const logs = await Log.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
      
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy logs.' });
  }
};