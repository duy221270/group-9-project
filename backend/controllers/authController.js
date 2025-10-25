// File: backend/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');


// 1. Chức năng Đăng ký (Sign Up)
exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đủ thông tin.' });
  }

  try {
    // Kiểm tra email trùng lặp
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã tồn tại.' });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 12);

    // Tạo người dùng mới
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'Đăng ký thành công!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Chức năng Đăng nhập (Login)
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
    }

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
    }

    // Tạo và trả về JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token, userId: user._id, name: user.name });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({ message: 'Nếu email tồn tại, bạn sẽ nhận được link reset.' });
    }

// Trong hàm forgotPassword
console.log(typeof crypto.randomBytes); // Thêm dòng này
const resetToken = crypto.randomBytes(32).toString('hex');

    // 2. Mã hóa token để lưu vào DB
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // 3. Đặt thời gian hết hạn (10 phút)
    const passwordResetExpires = Date.now() + 10 * 60 * 1000;

    // 4. *** THAY ĐỔI: Cập nhật trực tiếp vào database ***
    await User.findByIdAndUpdate(user._id, {
      passwordResetToken: passwordResetToken,
      passwordResetExpires: passwordResetExpires
    }, { new: true, runValidators: false }); // Cập nhật và bỏ qua validation

    // 5. Gửi email (Giả lập)
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`; // Dùng token gốc
    const message = `Bạn nhận được email này... \n\n ${resetUrl} \n\n ...`;

    console.log("------- EMAIL GỬI ĐI -------");
    console.log("URL Reset:", resetUrl);
    console.log("Nội dung:", message);
    console.log("--------------------------");

    res.status(200).json({ message: 'Token reset đã được gửi (xem console).' });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    // Quan trọng: Không xóa token ở đây vì user có thể chưa được lưu token thành công
    res.status(500).json({ message: 'Lỗi khi gửi yêu cầu reset mật khẩu.' });
  }
};
exports.resetPassword = async (req, res) => {
  const { password, confirmPassword } = req.body;
  const resetTokenFromUrl = req.params.token; // Lấy token gốc từ URL

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Mật khẩu không khớp.' });
  }

  try {
    // 1. Mã hóa token từ URL để so sánh với token trong DB
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetTokenFromUrl)
      .digest('hex');

    // 2. Tìm user có token khớp VÀ token chưa hết hạn
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }, // Kiểm tra token còn hạn không
    });

    if (!user) {
      return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }

    // 3. Nếu token hợp lệ, đặt lại mật khẩu
    user.password = await bcrypt.hash(password, 12); // Mã hóa mật khẩu mới
    user.passwordResetToken = undefined; // Xóa token sau khi dùng
    user.passwordResetExpires = undefined; // Xóa hạn sử dụng
    await user.save();

    // (Tùy chọn: Tự động đăng nhập user sau khi reset thành công bằng cách tạo token mới)
    // const loginToken = jwt.sign(...);
    // res.status(200).json({ token: loginToken, message: 'Đặt lại mật khẩu thành công.' });

    res.status(200).json({ message: 'Đặt lại mật khẩu thành công.' });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi đặt lại mật khẩu.' });
  }
};

// 3. Chức năng Đăng xuất (Logout)
exports.logout = (req, res) => {
  // Logic chính xử lý ở client, backend chỉ cần phản hồi
  res.status(200).json({ message: 'Đăng xuất thành công.' });
};