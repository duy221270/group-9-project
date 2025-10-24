import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';

import AddUser from './components/AddUser';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import AdminUserList from './pages/AdminUserList';
import './App.css';

// 🎯 CHỈNH LẠI CHO KHỚP BACKEND ĐANG DÙNG `/api/users/users`
const USERS_API_URL = '/api/users/users'; // ✅ Gọi đúng route thật của backend
const AUTH_API_URL = '/api/auth';
const PROFILE_API_URL = '/api/users/profile';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [refreshUserList, setRefreshUserList] = useState(false);

  useEffect(() => {
    const currentToken = localStorage.getItem('token');
    setToken(currentToken);
    if (currentToken) {
      fetchCurrentUser(currentToken);
    } else {
      setCurrentUser(null);
    }
  }, [token]);

  const fetchCurrentUser = async (currentToken) => {
    if (!currentToken) return setCurrentUser(null);
    try {
      const config = { headers: { Authorization: `Bearer ${currentToken}` } };
      const res = await axios.get(PROFILE_API_URL, config);
      setCurrentUser(res.data);
    } catch (err) {
      console.error('Lỗi khi lấy user hiện tại:', err);
      handleLogout();
    }
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      await axios.post(USERS_API_URL, formData, config);
      alert('Thêm user thành công!');
      setFormData({ name: '', email: '' });
      setRefreshUserList((prev) => !prev);
    } catch (err) {
      console.error('Lỗi thêm user:', err);
      alert(err.response?.data?.message || 'Thêm user thất bại.');
    }
  };

  const cancelAddUserEdit = () => setFormData({ name: '', email: '' });

  const handleLoginSuccess = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    fetchCurrentUser(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
  };

  const PrivateRoute = ({ children }) => (token ? children : <Navigate to="/login" replace />);
  const AdminRoute = ({ children }) =>
    token && currentUser?.role === 'admin' ? children : <Navigate to="/" replace />;

  return (
    <Router>
      <div className="container">
        <div className="header">
          <h1>Quản Lý User</h1>
          <nav style={{ marginBottom: '20px' }}>
            {token ? (
              <>
                <Link to="/" style={{ marginRight: '15px', color: 'var(--text)' }}>
                  Profile
                </Link>
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
              <>
                <Link to="/login" style={{ marginRight: '15px', color: 'var(--text)' }}>
                  Đăng nhập
                </Link>
                <Link to="/register" style={{ marginRight: '15px', color: 'var(--text)' }}>
                  Đăng ký
                </Link>
              </>
            )}
          </nav>
        </div>

        <Routes>
          {/* 🔐 Login */}
          <Route
            path="/login"
            element={
              !token ? (
                <div className="card" style={{ maxWidth: '400px', margin: 'auto' }}>
                  <Login onLoginSuccess={handleLoginSuccess} authApiUrl={AUTH_API_URL} />
                </div>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* 📝 Register */}
          <Route
            path="/register"
            element={
              !token ? (
                <div className="card" style={{ maxWidth: '400px', margin: 'auto' }}>
                  <Register authApiUrl={AUTH_API_URL} />
                </div>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* 👤 Profile */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <div className="card">
                  <Profile profileApiUrl={PROFILE_API_URL} token={token} onLogout={handleLogout} />
                </div>
              </PrivateRoute>
            }
          />
          <Route path="/profile" element={<Navigate to="/" replace />} />

          {/* ⚙️ Admin - Quản lý User */}
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <div className="grid">
                  <div className="card">
                    <AddUser
                      formData={formData}
                      setFormData={setFormData}
                      editingUser={null}
                      onSubmit={handleAddUserSubmit}
                      onCancel={cancelAddUserEdit}
                    />
                  </div>
                  <div className="card">
                    <AdminUserList
                      token={token}
                      currentUser={currentUser}
                      key={refreshUserList}
                      usersApiUrl={USERS_API_URL}
                    />
                  </div>
                </div>
              </AdminRoute>
            }
          />

          {/* Redirect mặc định */}
          <Route path="*" element={<Navigate to={token ? '/' : '/login'} replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
