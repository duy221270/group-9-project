import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

function AdminUserList({ token, currentUser, usersApiUrl }) {
  const [allUsers, setAllUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllUsers = async () => {
      if (!token) {
        setMessage('Yêu cầu quyền Admin.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setMessage('');
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        // 🎯 Gọi đúng endpoint backend `/api/users/users`
        const res = await axios.get(usersApiUrl, config);
        setAllUsers(res.data);
      } catch (err) {
        console.error('Lỗi khi lấy danh sách user (Admin):', err);
        setMessage(err.response?.data?.message || 'Không thể tải danh sách user (Yêu cầu quyền Admin).');
      } finally {
        setLoading(false);
      }
    };
    fetchAllUsers();
  }, [token, usersApiUrl, currentUser]);

  const handleDeleteUser = async (id) => {
    if (currentUser?._id === id) {
      alert('Bạn không thể xóa tài khoản Admin của chính mình.');
      return;
    }
    if (window.confirm('Bạn có chắc chắn muốn xóa user này?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        // 🎯 Cũng khớp luôn với backend `/api/users/users/:id`
        await axios.delete(`${usersApiUrl}/${id}`, config);
        setAllUsers(allUsers.filter((u) => u._id !== id));
        setMessage('Xóa user thành công!');
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        console.error('Lỗi khi xóa user (Admin):', err);
        setMessage(err.response?.data?.message || 'Xóa user thất bại.');
      }
    }
  };

  if (loading) return <p className="muted">Đang tải danh sách user...</p>;

  return (
    <>
      <h2>Quản lý Người dùng (Admin)</h2>
      {message && (
        <p
          style={{
            color:
              message.includes('thất bại') || message.includes('Không thể')
                ? 'var(--danger)'
                : 'var(--accent)',
            textAlign: 'center',
          }}
        >
          {message}
        </p>
      )}

      {allUsers.length > 0 ? (
        <ul className="list">
          {allUsers.map((user) => (
            <li key={user._id} className="list-item">
              <div
                className="avatar"
                style={{ background: user.role === 'admin' ? 'var(--danger)' : '#0f172a' }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="name">
                  {user.name}{' '}
                  {user.role === 'admin' && (
                    <span style={{ color: 'orange', fontSize: '0.8em' }}>(Admin)</span>
                  )}
                </div>
                <div className="email">{user.email}</div>
              </div>
              <div className="list-item-buttons">
                <button
                  className="btn btn-sm delete-btn"
                  onClick={() => handleDeleteUser(user._id)}
                  disabled={currentUser?._id === user._id}
                >
                  Xóa
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        !loading &&
        !message.includes('Không thể') && <p className="muted">Không có người dùng nào.</p>
      )}
    </>
  );
}

export default AdminUserList;
