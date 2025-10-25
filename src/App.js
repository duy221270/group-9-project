import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';

// ========== COMPONENT / PAGE IMPORTS ==========
// !!! QUAN TRỌNG: Đảm bảo MỖI file dưới đây đều có "export default TênComponent;" ở cuối !!!
import AddUser from './components/AddUser';         // Check AddUser.js
import Register from './pages/Register';           // Check Register.jsx
import Login from './pages/Login';                 // Check Login.jsx
import Profile from './pages/Profile';               // Check Profile.jsx
import AdminUserList from './pages/AdminUserList'; // Check AdminUserList.jsx
import ForgotPassword from './pages/ForgotPassword'; // Check ForgotPassword.jsx
import ResetPassword from './pages/ResetPassword';   // Check ResetPassword.jsx
import './App.css';

// ========== API URLs ==========
// Nên đặt trong file config riêng hoặc biến môi trường nếu dự án lớn hơn
const USERS_API_URL = '/api/users/users'; // URL lấy/thêm user (cho admin)
const AUTH_API_URL = '/api/auth';       // URL cho login, register, forgot/reset password
const PROFILE_API_URL = '/api/users/profile'; // URL lấy/cập nhật thông tin user hiện tại

function App() {
  // ========== STATE ==========
  const [token, setToken] = useState(localStorage.getItem('token')); // Lấy token từ localStorage khi tải app
  const [currentUser, setCurrentUser] = useState(null); // Thông tin user đang đăng nhập
  const [formData, setFormData] = useState({ name: '', email: '' }); // Dữ liệu form thêm user (cho admin)
  const [refreshUserList, setRefreshUserList] = useState(false); // Biến để trigger load lại danh sách user admin

  // ========== EFFECTS ==========
  // Chạy khi component mount hoặc khi `token` thay đổi
  useEffect(() => {
    const currentToken = localStorage.getItem('token');
    setToken(currentToken); // Cập nhật state token (có thể không cần nếu chỉ đọc từ localStorage?)

    if (currentToken) {
      fetchCurrentUser(currentToken); // Nếu có token, lấy thông tin user
    } else {
      setCurrentUser(null); // Nếu không có token, xóa thông tin user
    }
  }, [token]); // Phụ thuộc vào `token` state

  // ========== FUNCTIONS ==========
  // Lấy thông tin user đang đăng nhập bằng token
  const fetchCurrentUser = async (currentToken) => {
    if (!currentToken) {
      setCurrentUser(null);
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${currentToken}` } };
      const res = await axios.get(PROFILE_API_URL, config);
      setCurrentUser(res.data); // Lưu thông tin user vào state
    } catch (err) {
      console.error('Lỗi khi lấy user hiện tại:', err);
      handleLogout(); // Nếu token lỗi/hết hạn, tự động đăng xuất
    }
  };

  // Xử lý submit form thêm user (Admin)
  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    const config = { headers: { Authorization: `Bearer ${token}` } }; // Cần token để xác thực
    try {
      await axios.post(USERS_API_URL, formData, config);
      alert('Thêm user thành công!');
      setFormData({ name: '', email: '' });       // Reset form
      setRefreshUserList((prev) => !prev);   // Trigger load lại danh sách user
    } catch (err) {
      console.error('Lỗi thêm user:', err);
      alert(err.response?.data?.message || 'Thêm user thất bại.'); // Hiển thị lỗi từ backend
    }
  };

  // Hủy thêm user (Admin) - chỉ reset form
  const cancelAddUserEdit = () => setFormData({ name: '', email: '' });

  // Callback khi Login component đăng nhập thành công
  const handleLoginSuccess = (newToken) => {
    localStorage.setItem('token', newToken); // Lưu token mới vào localStorage
    setToken(newToken);                    // Cập nhật state token -> trigger useEffect -> fetchCurrentUser
  };

  // Xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('token'); // Xóa token khỏi localStorage
    setToken(null);                   // Cập nhật state token -> trigger useEffect -> setCurrentUser(null)
  };

  // ========== ROUTE PROTECTION COMPONENTS ==========
  // Component HOC (Higher-Order Component) để bảo vệ route yêu cầu đăng nhập
  const PrivateRoute = ({ children }) => {
    // Nếu có token -> render component con (children)
    // Nếu không -> chuyển hướng về trang login
    return token ? children : <Navigate to="/login" replace />;
  };

  // Component HOC để bảo vệ route yêu cầu quyền admin
  const AdminRoute = ({ children }) => {
    // Đợi thông tin currentUser được load xong mới kiểm tra role
    if (!currentUser && token) {
      return <div>Đang tải thông tin người dùng...</div>; // Hoặc một spinner loading
    }
    // Nếu có token VÀ role là admin -> render component con
    // Nếu không -> chuyển hướng về trang chủ (hoặc trang profile)
    return token && currentUser?.role === 'admin' ? children : <Navigate to="/" replace />;
  };

  // ========== JSX RENDER ==========
  return (
    <Router>
      <div className="container">
        {/* --- HEADER & NAVIGATION --- */}
        <div className="header">
          <h1>Quản Lý User</h1>
          <nav style={{ marginBottom: '20px' }}>
            {token ? (
              // Menu khi đã đăng nhập
              <>
                <Link to="/" style={{ marginRight: '15px', color: 'var(--text)' }}>
                  Profile
                </Link>
                {/* Chỉ hiện link Admin Users nếu user là admin */}
                {currentUser?.role === 'admin' && (
                  <Link to="/admin/users" style={{ marginRight: '15px', color: 'orange' }}>
                    Admin Users
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="btn btn-sm"
                  style={{ background: 'var(--danger)' }}
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              // Menu khi chưa đăng nhập
              <>
                <Link to="/login" style={{ marginRight: '15px', color: 'var(--text)' }}>
                  Đăng nhập
                </Link>
                <Link to="/register" style={{ marginRight: '15px', color: 'var(--text)' }}>
                  Đăng ký
                </Link>
                <Link to="/forgot-password" style={{ color: 'var(--accent)' }}>
                  Quên mật khẩu
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* --- PAGE CONTENT BASED ON ROUTE --- */}
        <Routes>
          {/* Public Route: Login */}
          <Route
            path="/login"
            element={
              !token ? ( // Chỉ hiện khi chưa login
                <div className="card" style={{ maxWidth: '400px', margin: 'auto' }}>
                  <Login onLoginSuccess={handleLoginSuccess} authApiUrl={AUTH_API_URL} />
                </div>
              ) : (
                <Navigate to="/" replace /> // Chuyển về trang chủ nếu đã login
              )
            }
          />
          {/* Public Route: Register */}
          <Route
            path="/register"
            element={
              !token ? ( // Chỉ hiện khi chưa login
                <div className="card" style={{ maxWidth: '400px', margin: 'auto' }}>
                  <Register authApiUrl={AUTH_API_URL} />
                </div>
              ) : (
                <Navigate to="/" replace /> // Chuyển về trang chủ nếu đã login
              )
            }
          />
          {/* Public Route: Forgot Password */}
          <Route
            path="/forgot-password"
            element={<ForgotPassword apiUrl={AUTH_API_URL} />} // Luôn cho phép truy cập
          />
          {/* Public Route: Reset Password */}
          <Route
            path="/reset-password/:resetToken" // Nhận token từ URL
            element={<ResetPassword apiUrl={AUTH_API_URL} />} // Luôn cho phép truy cập
          />

          {/* Private Route: Profile (Trang chủ khi đã login) */}
          <Route
            path="/"
            element={
              <PrivateRoute> {/* Yêu cầu đăng nhập */}
                <div className="card">
                  <Profile
                    profileApiUrl={PROFILE_API_URL}
                    token={token} // Truyền token xuống để Profile tự gọi API update
                    onLogout={handleLogout} // Có thể cần nếu Profile có nút logout riêng?
                  />
                </div>
              </PrivateRoute>
            }
          />
          {/* Redirect /profile về / */}
          <Route path="/profile" element={<Navigate to="/" replace />} />

          {/* Admin Route: User Management */}
          <Route
            path="/admin/users"
            element={
              <AdminRoute> {/* Yêu cầu đăng nhập và quyền admin */}
                <div className="grid"> {/* Layout 2 cột nếu muốn */}
                  <div className="card"> {/* Form thêm user */}
                    <AddUser
                      formData={formData}
                      setFormData={setFormData}
                      editingUser={null} // Chỉ dùng để thêm mới ở đây
                      onSubmit={handleAddUserSubmit}
                      onCancel={cancelAddUserEdit}
                    />
                  </div>
                  <div className="card"> {/* Danh sách user */}
                    <AdminUserList
                      token={token} // Cần token để gọi API lấy danh sách/xóa user
                      currentUser={currentUser} // Để biết user admin hiện tại là ai (không xóa chính mình?)
                      key={refreshUserList} // Dùng key để re-render component khi có thay đổi
                      usersApiUrl={USERS_API_URL}
                    />
                  </div>
                </div>
              </AdminRoute>
            }
          />

          {/* Fallback Route: Chuyển hướng nếu URL không khớp */}
          <Route path="*" element={<Navigate to={token ? '/' : '/login'} replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; // Đảm bảo khớp với cách import trong file src/index.js