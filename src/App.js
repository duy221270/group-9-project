import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Import các component
import UserList from './components/UserList';
import AddUser from './components/AddUser';
import Register from './pages/Register';
import Login from './pages/Login';

import './App.css'; // File CSS dark mode của bạn

// --- ĐỊA CHỈ API (Đã đổi thành đường dẫn tương đối để dùng Proxy) ---
const USERS_API_URL = '/users';
const AUTH_API_URL = '/api/auth';

function App() {
  // === STATE CHO AUTHENTICATION ===
  const [token, setToken] = useState(localStorage.getItem('token'));

  // === STATE CHO CRUD USER ===
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    // Nếu có token, thì tải danh sách user
    if (token) {
      fetchUsers();
    }
  }, [token]); // Chạy lại khi token thay đổi

  // === CÁC HÀM XỬ LÝ CHO CRUD USER ===
  const fetchUsers = async () => {
    try {
      // Gửi token theo header để xác thực
      const config = {
        headers: { 'x-auth-token': token }
      };
      const response = await axios.get(USERS_API_URL, config);
      setUsers(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách user:", error);
      // Nếu token hết hạn hoặc sai, tự động đăng xuất
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
         handleLogout();
      }
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa user này?')) {
      try {
        await axios.delete(`${USERS_API_URL}/${userId}`, {
          headers: { 'x-auth-token': token }
        });
        setUsers(users.filter(user => user._id !== userId));
      } catch (error) {
        console.error("Lỗi khi xóa user:", error);
      }
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const config = { headers: { 'x-auth-token': token } };

    if (editingUser) { // Logic SỬA
      try {
        const response = await axios.put(`${USERS_API_URL}/${editingUser._id}`, formData, config);
        setUsers(users.map(user => (user._id === editingUser._id ? response.data : user)));
      } catch (error) {
        console.error("Lỗi khi cập nhật user:", error);
      }
    } else { // Logic THÊM MỚI
      try {
        const response = await axios.post(USERS_API_URL, formData, config);
        setUsers([...users, response.data]);
      } catch (error) {
        console.error("Lỗi khi thêm user:", error);
      }
    }
    setFormData({ name: '', email: '' });
    setEditingUser(null);
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '' });
  };

  // === CÁC HÀM XỬ LÝ CHO AUTHENTICATION ===
  const handleLoginSuccess = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken); // Cập nhật state, làm React render lại
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null); // Cập nhật state, làm React render lại
  };

  // === PHẦN HIỂN THỊ (RENDER) ===

  // 1. Nếu CHƯA ĐĂNG NHẬP (không có token)
  if (!token) {
    return (
      <div className="container">
        <div className="header">
          <h1>Chào mừng!</h1>
          <p className="subtitle">Vui lòng đăng nhập hoặc đăng ký</p>
        </div>
        <div className="grid">
          <div className="card">
            {/* Truyền hàm onLoginSuccess và authApiUrl xuống cho Login */}
            <Login onLoginSuccess={handleLoginSuccess} authApiUrl={AUTH_API_URL} />
          </div>
          <div className="card">
            {/* Truyền authApiUrl xuống cho Register */}
            <Register authApiUrl={AUTH_API_URL} />
          </div>
        </div>
      </div>
    );
  }

  // 2. Nếu ĐÃ ĐĂNG NHẬP (có token)
  return (
    <div className="container">
      <div className="header">
        <h1>Quản Lý User</h1>
        <p className="subtitle">Bạn đã đăng nhập thành công!</p>
        <button onClick={handleLogout} className="btn" style={{marginTop: '15px', background: 'var(--danger)'}}>Đăng xuất</button>
      </div>
      <div className="grid">
        <div className="card">
          <AddUser
            formData={formData}
            setFormData={setFormData}
            editingUser={editingUser}
            onSubmit={handleFormSubmit}
            onCancel={cancelEdit}
          />
        </div>
        <div className="card">
          <UserList
            users={users}
            onEdit={handleEditClick}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}

export default App;