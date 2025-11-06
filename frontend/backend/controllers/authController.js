// File: backend/controllers/authController.js
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const sendEmail = require('../utils/sendEmail'); // <-- Import đã có
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN } // Ví dụ: 15m
  );
};

// 1. Chức năng Đăng ký (Sign Up)
exports.signup = async (req, res) => {
  // ... (Code này giữ nguyên)
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đủ thông tin.' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã tồn tại.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'Đăng ký thành công!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Chức năng Đăng nhập (Login)
exports.login = async (req, res) => {
  // ... (Code này giữ nguyên)
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
    }

    const accessToken = generateAccessToken(user);

    const refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 ngày
    const refreshTokenString = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN } // Ví dụ: 7d
    );

    await RefreshToken.create({
      user: user._id,
      token: refreshTokenString,
      expiresAt: refreshTokenExpires,
    });

    res.status(200).json({
      message: 'Đăng nhập thành công',
      accessToken,
      refreshToken: refreshTokenString,
      userId: user._id,
      name: user.name,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Chức năng Refresh Token
exports.refreshAccessToken = async (req, res) => {
  // ... (Code này giữ nguyên)
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh Token không được cung cấp.' });
  }

  try {
    const storedToken = await RefreshToken.findOne({ token: refreshToken });

    if (!storedToken) {
      return res.status(403).json({ message: 'Refresh Token không hợp lệ hoặc đã hết hạn.' });
    }

    if (new Date() > storedToken.expiresAt) {
      await RefreshToken.findByIdAndDelete(storedToken._id);
      return res.status(403).json({ message: 'Refresh Token đã hết hạn. Vui lòng đăng nhập lại.' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }

    const newAccessToken = generateAccessToken(user);

    res.status(200).json({ accessToken: newAccessToken });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      await RefreshToken.deleteOne({ token: refreshToken });
      return res.status(403).json({ message: 'Refresh Token không hợp lệ. Vui lòng đăng nhập lại.' });
    }
    res.status(500).json({ message: error.message });
  }
};

// 4. Chức năng Quên mật khẩu
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      // Vẫn trả về 200 để bảo mật, không cho biết email có tồn tại hay không
      return res.status(200).json({ message: 'Nếu email tồn tại, bạn sẽ nhận được link reset.' });
    }

    // console.log(typeof crypto.randomBytes); // Dòng này có thể xóa
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Mã hóa token để lưu vào DB
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Đặt thời gian hết hạn (10 phút)
    const passwordResetExpires = Date.now() + 10 * 60 * 1000;

    // Cập nhật user với token và thời gian hết hạn
    await User.findByIdAndUpdate(user._id, {
      passwordResetToken: passwordResetToken,
      passwordResetExpires: passwordResetExpires
    }, { new: true, runValidators: false });

    // 5. Gửi email (Đã sửa đổi)
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`; // Dùng token gốc
    const message = `Bạn nhận được email này vì bạn (hoặc ai đó) đã yêu cầu reset mật khẩu. \n\nVui lòng nhấp vào đường dẫn này để đặt lại mật khẩu (link có hiệu lực 10 phút): \n\n ${resetUrl} \n\nNếu bạn không yêu cầu, vui lòng bỏ qua email này.`;

    // <-- SỬA ĐỔI BẮT ĐẦU TẠI ĐÂY ---
    try {
      await sendEmail({
        email: user.email,
        subject: 'Yêu cầu Reset Mật khẩu (10 phút)',
        message: message,
      });

      res.status(200).json({ message: 'Token reset đã được gửi tới email của bạn.' });

    } catch (emailError) {
      console.error("Email Sending Error:", emailError);
      // Nếu gửi email lỗi, chúng ta không xóa token
      // để user có thể thử lại mà không cần gọi API forgot-password lần nữa
      res.status(500).json({ message: 'Lỗi khi gửi email reset mật khẩu.' });
    }
    // <-- SỬA ĐỔI KẾT THÚC TẠI ĐÂY ---

  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: 'Lỗi khi gửi yêu cầu reset mật khẩu.' });
  }
};

// 5. Chức năng Đặt lại mật khẩu
exports.resetPassword = async (req, res) => {
  // ... (Code này giữ nguyên)
  const { password, confirmPassword } = req.body;
  const resetTokenFromUrl = req.params.token;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Mật khẩu không khớp.' });
  }

  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetTokenFromUrl)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }

    user.password = await bcrypt.hash(password, 12);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Đặt lại mật khẩu thành công.' });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi đặt lại mật khẩu.' });
  }
};

// 6. Chức năng Đăng xuất (Logout)
exports.logout = async (req, res) => {
  // ... (Code này giữ nguyên)
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh Token không được cung cấp.' });
  }

  try {
    const result = await RefreshToken.deleteOne({ token: refreshToken });

    if (result.deletedCount === 0) {
      return res.status(200).json({ message: 'Đăng xuất thành công (token không tìm thấy).' });
    }

    res.status(200).json({ message: 'Đăng xuất thành công.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};