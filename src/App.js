import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';

// Import components/pages
import UserList from './components/UserList';
import AddUser from './components/AddUser';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';

import './App.css'; // File CSS dark mode

// --- ĐỊA CHỈ API (Đã sửa lại USERS_API_URL) ---
const USERS_API_URL = '/api/users/users'; // <-- ĐÃ SỬA
const AUTH_API_URL = '/api/auth';
const PROFILE_API_URL = '/api/users/profile'; // Giữ nguyên URL profile

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  // State CRUD User
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    if (token) {
      fetchUsers(); // Tải user list nếu đã đăng nhập
    } else {
      setUsers([]); // Xóa user list nếu đăng xuất
    }
  }, [token]);

  // Các hàm CRUD User (sử dụng USERS_API_URL đã sửa)
  const fetchUsers = async () => {
    try {
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      const response = await axios.get(USERS_API_URL, config); // Dùng USERS_API_URL mới
      setUsers(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách user:", error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
         handleLogout();
      }
    }
  };
  const handleDelete = async (userId) => {
     if (window.confirm('Bạn có chắc chắn muốn xóa user này?')) {
      try {
        // Sửa cả URL delete
        await axios.delete(`${USERS_API_URL}/${userId}`, { headers: { 'Authorization': `Bearer ${token}` } }); 
        setUsers(users.filter(user => user._id !== userId)); // Dùng _id nếu backend trả về _id
      } catch (error) { console.error("Lỗi khi xóa user:", error); }
    }
  };
  const handleEditClick = (user) => { setEditingUser(user); setFormData({ name: user.name, email: user.email }); };
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const config = { headers: { 'Authorization': `Bearer ${token}` } };
    if (editingUser) {
      try {
        // Sửa cả URL update
        const response = await axios.put(`${USERS_API_URL}/${editingUser._id}`, formData, config); 
        setUsers(users.map(user => (user._id === editingUser._id ? response.data : user))); // Dùng _id nếu backend trả về _id
      } catch (error) { console.error("Lỗi khi cập nhật user:", error); }
    } else {
      try {
        // Sửa cả URL create
        const response = await axios.post(USERS_API_URL, formData, config); 
        setUsers([...users, response.data]);
      } catch (error) { console.error("Lỗi khi thêm user:", error); }
    }
    setFormData({ name: '', email: '' }); setEditingUser(null);
  };
  const cancelEdit = () => { setEditingUser(null); setFormData({ name: '', email: '' }); };

  // Các hàm Auth
  const handleLoginSuccess = (newToken) => { localStorage.setItem('token', newToken); setToken(newToken); };
  const handleLogout = () => { localStorage.removeItem('token'); setToken(null); };

  // Helper Component cho Route yêu cầu đăng nhập
  const PrivateRoute = ({ children }) => token ? children : <Navigate to="/login" replace />;

  return (
    <Router>
      <div className="container">
        <div className="header">
          <h1>Quản Lý User</h1>
          <nav style={{ marginBottom: '20px' }}> {/* Thanh điều hướng */}
            {token ? (
              <>
                <Link to="/" style={{ marginRight: '15px', color: 'var(--accent)' }}>Quản lý User</Link>
                <Link to="/profile" style={{ marginRight: '15px', color: 'var(--text)' }}>Profile</Link>
                <button onClick={handleLogout} className="btn btn-sm" style={{ background: 'var(--danger)' }}>Đăng xuất</button>
              </>
            ) : (
              <>
                <Link to="/login" style={{ marginRight: '15px', color: 'var(--text)' }}>Đăng nhập</Link>
                <Link to="/register" style={{ marginRight: '15px', color: 'var(--text)' }}>Đăng ký</Link>
              </>
            )}
          </nav>
        </div>

        <Routes> {/* Định nghĩa các Route */}
          {/* Trang Login: Chỉ hiện khi chưa đăng nhập */}
          <Route path="/login" element={ !token ? <div className="card" style={{ maxWidth: '400px', margin: 'auto' }}><Login onLoginSuccess={handleLoginSuccess} authApiUrl={AUTH_API_URL} /></div> : <Navigate to="/" replace /> } />

          {/* Trang Register: Chỉ hiện khi chưa đăng nhập */}
          <Route path="/register" element={ !token ? <div className="card" style={{ maxWidth: '400px', margin: 'auto' }}><Register authApiUrl={AUTH_API_URL} /></div> : <Navigate to="/" replace /> } />

          {/* Trang Profile: Yêu cầu đăng nhập */}
          <Route path="/profile" element={ <PrivateRoute><div className="card"><Profile profileApiUrl={PROFILE_API_URL} token={token} onLogout={handleLogout} /></div></PrivateRoute> } />

          {/* Trang Quản lý User (Trang chủ): Yêu cầu đăng nhập */}
          <Route path="/" element={
            <PrivateRoute>
              <div className="grid">
                <div className="card">
                  <AddUser formData={formData} setFormData={setFormData} editingUser={editingUser} onSubmit={handleFormSubmit} onCancel={cancelEdit} />
                </div>
                <div className="card">
                  <UserList users={users} onEdit={handleEditClick} onDelete={handleDelete} />
                </div>
              </div>
            </PrivateRoute>
          } />

          {/* Redirect mặc định */}
          <Route path="*" element={<Navigate to={token ? "/" : "/login"} replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;