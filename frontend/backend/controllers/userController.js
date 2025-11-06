// userController.js - Phiên bản đã sửa

// 1. Chỉ import duy nhất User model từ đúng vị trí
const User = require('../models/User'); // hoặc ../models/user
const bcrypt = require('bcryptjs');
const cloudinary = require('../config/cloudinary');

// GET: Lấy tất cả user
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const uploadAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id); // Lấy user từ middleware protect

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Kiểm tra xem có file được upload không (middleware multer thêm req.file)
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn file ảnh.' });
    }
    console.log('Cloudinary object:', cloudinary);
    console.log('Cloudinary uploader object:', cloudinary.uploader);
    // Upload file lên Cloudinary từ buffer trong bộ nhớ
    // Dùng stream để upload hiệu quả hơn với file lớn
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'avatars', // Tùy chọn: thư mục lưu trên Cloudinary
        public_id: `${user._id}_${Date.now()}`, // Tên file duy nhất
        overwrite: true, // Ghi đè nếu file đã tồn tại
        format: 'jpg', // Tự động chuyển đổi sang jpg
        transformation: [{ width: 150, height: 150, crop: 'fill', gravity: 'face' }] // Resize ảnh
      },
      async (error, result) => {
        if (error) {
          console.error('Cloudinary Upload Error:', error);
          return res.status(500).json({ message: 'Lỗi khi upload ảnh.' });
        }

        // Upload thành công, cập nhật link ảnh vào user
        user.avatar = result.secure_url; // Lấy URL an toàn (https)
        await user.save();

        res.status(200).json({
          message: 'Upload avatar thành công!',
          avatarUrl: result.secure_url,
        });
      }
    );

    // Gửi buffer của file ảnh vào stream để upload
    uploadStream.end(req.file.buffer);

  } catch (error) {
    console.error('Avatar Upload Controller Error:', error);
    res.status(500).json({ message: 'Lỗi server khi upload avatar.' });
  }
};

// POST: Tạo user mới
const createUser = async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required' });
  }
  try {
    const newUser = new User({ name, email });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT: Cập nhật user
const updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id, // ID của user cần cập nhật
      req.body,      // Dữ liệu mới
      { new: true }  // Trả về user sau khi đã cập nhật
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE: Xóa user
const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getUserProfile = async (req, res) => {
  // Middleware 'protect' đã chạy và gắn req.user
  const user = req.user;

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      // avatar: user.avatar (nếu có)
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Cập nhật thông tin profile người dùng (đã đăng nhập)
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    // Lấy dữ liệu mới từ body
    const { name, password } = req.body;

    user.name = name || user.name;
    // user.avatar = req.body.avatar || user.avatar; (cho Hoạt động 4)

    // Nếu người dùng gửi mật khẩu mới -> mã hóa nó
    if (password) {
      user.password = await bcrypt.hash(password, 12);
    }

    const updatedUser = await user.save();

    // Trả về thông tin đã cập nhật
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserProfile,   // <-- Mới
  updateUserProfile, // <-- Mới
  uploadAvatar, // <-- Hàm mới
};