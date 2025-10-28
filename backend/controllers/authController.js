// File: backend/controllers/authController.js
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
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

exports.login = async (req, res) => {
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

    // 1. Tạo Access Token (ngắn hạn)
    const accessToken = generateAccessToken(user);

    // 2. Tạo Refresh Token (dài hạn)
    const refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 ngày
    const refreshTokenString = jwt.sign(
      { userId: user._id }, // Chỉ cần ID trong refresh token
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN } // Ví dụ: 7d
    );

    // 3. (Task 3) Lưu Refresh Token vào DB
    await RefreshToken.create({
      user: user._id,
      token: refreshTokenString,
      expiresAt: refreshTokenExpires,
    });

    // 4. Trả về cả 2 token cho SV2
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
exports.refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh Token không được cung cấp.' });
  }

  try {
    // 1. Kiểm tra xem Refresh Token có trong DB không
    const storedToken = await RefreshToken.findOne({ token: refreshToken });

    if (!storedToken) {
      return res.status(403).json({ message: 'Refresh Token không hợp lệ hoặc đã hết hạn.' });
    }

    // 2. Kiểm tra token có hết hạn (trong DB) không
    if (new Date() > storedToken.expiresAt) {
      await RefreshToken.findByIdAndDelete(storedToken._id); // Xóa token hết hạn
      return res.status(403).json({ message: 'Refresh Token đã hết hạn. Vui lòng đăng nhập lại.' });
    }

    // 3. Xác thực chữ ký JWT của Refresh Token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // 4. Lấy thông tin user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }

    // 5. Cấp Access Token MỚI
    const newAccessToken = generateAccessToken(user);

    res.status(200).json({ accessToken: newAccessToken });

  } catch (error) {
    // Nếu JWT verify lỗi (VD: sai secret) hoặc token hết hạn (theo 'expiresIn')
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      // Xóa token lỗi/hết hạn khỏi DB (nếu tìm thấy)
      await RefreshToken.deleteOne({ token: refreshToken });
      return res.status(403).json({ message: 'Refresh Token không hợp lệ. Vui lòng đăng nhập lại.' });
    }
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
exports.logout = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh Token không được cung cấp.' });
  }

  try {
    // Xóa Refresh Token khỏi DB
    const result = await RefreshToken.deleteOne({ token: refreshToken });

    if (result.deletedCount === 0) {
      // Token không tồn tại, nhưng vẫn cho logout thành công
      return res.status(200).json({ message: 'Đăng xuất thành công (token không tìm thấy).' });
    }

    res.status(200).json({ message: 'Đăng xuất thành công.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};