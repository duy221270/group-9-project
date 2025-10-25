import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css'; // Assuming styles are in App.css

function AdminUserList({ token, currentUser, usersApiUrl, key }) { // Added key prop if using it for refresh
  const [allUsers, setAllUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); // Separate error state for clarity

  useEffect(() => {
    const fetchAllUsers = async () => {
      if (!token) {
        setError('Yêu cầu quyền Admin.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setMessage('');
      setError(''); // Clear previous errors
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        // Assuming usersApiUrl = '/api/users/users' as defined in App.js
        const res = await axios.get(usersApiUrl, config);
        setAllUsers(res.data);
      } catch (err) {
        console.error('Lỗi khi lấy danh sách user (Admin):', err);
        setError(err.response?.data?.message || 'Không thể tải danh sách user (Yêu cầu quyền Admin).');
      } finally {
        setLoading(false);
      }
    };
    fetchAllUsers();
    // Dependency array should include things that trigger a re-fetch
  }, [token, usersApiUrl, key]); // Removed currentUser unless specifically needed for fetching

  const handleDeleteUser = async (id) => {
    // Prevent admin from deleting themselves
    if (currentUser?._id === id) {
      alert('Bạn không thể xóa tài khoản Admin của chính mình.');
      return;
    }

    // Use a custom modal in a real app instead of window.confirm
    if (window.confirm('Bạn có chắc chắn muốn xóa user này?')) {
      setMessage('');
      setError('');
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        // Assuming usersApiUrl = '/api/users/users' -> DELETE '/api/users/users/:id'
        await axios.delete(`${usersApiUrl}/${id}`, config);

        // Update state locally after successful deletion
        setAllUsers(prevUsers => prevUsers.filter((u) => u._id !== id));

        setMessage('Xóa user thành công!');
        setTimeout(() => setMessage(''), 3000); // Clear message after 3 seconds
      } catch (err) {
        console.error('Lỗi khi xóa user (Admin):', err);
        setError(err.response?.data?.message || 'Xóa user thất bại.');
      }
    }
  };

  if (loading) return <p className="muted">Đang tải danh sách user...</p>;

  return (
    <>
      <h2>Quản lý Người dùng (Admin)</h2>

      {/* Display Success Message */}
      {message && (
        <p style={{ color: 'var(--accent)', textAlign: 'center' }}>{message}</p>
      )}

      {/* Display Error Message */}
      {error && (
        <p style={{ color: 'var(--danger)', textAlign: 'center' }}>{error}</p>
      )}

      {allUsers.length > 0 ? (
        <ul className="list">
          {allUsers.map((user) => (
            <li key={user._id} className="list-item">
              <div
                className="avatar"
                style={{ background: user.role === 'admin' ? 'var(--danger)' : '#0f172a' }}
              >
                {/* Display first char of name or email if name is missing */}
                {(user.name || user.email || '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="name">
                  {user.name || 'N/A'}{' '}
                  {user.role === 'admin' && (
                    <span style={{ color: 'orange', fontSize: '0.8em' }}>(Admin)</span>
                  )}
                </div>
                <div className="email">{user.email}</div>
              </div>
              <div className="list-item-buttons">
                <button
                  className="btn btn-sm delete-btn" // Use appropriate class for styling
                  onClick={() => handleDeleteUser(user._id)}
                  // Disable delete button for the currently logged-in admin
                  disabled={currentUser?._id === user._id}
                  title={currentUser?._id === user._id ? "Không thể xóa chính mình" : "Xóa user"}
                >
                  Xóa
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        // Show "No users" only if not loading and no error occurred during fetch
        !loading && !error && <p className="muted">Không có người dùng nào.</p>
      )}
    </>
  );
}

export default AdminUserList;
