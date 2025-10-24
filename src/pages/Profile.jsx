import React, { useState, useEffect } from 'react';
import axios from 'axios';

// API URL (đường dẫn tương đối)
const PROFILE_API_URL = '/api/users/profile';

function Profile({ token, onLogout }) { // Nhận token và onLogout từ App.js
  const [userData, setUserData] = useState(null);
  const [nameInput, setNameInput] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) { // Kiểm tra token trước
        setMessage('Bạn cần đăng nhập.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setMessage('');
      try {
        const config = { headers: { 'Authorization': `Bearer ${token}` } };
        // Gọi API thật
        const response = await axios.get(PROFILE_API_URL, config);
        setUserData(response.data);
        setNameInput(response.data.name);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin profile:", error);
        setMessage('Không thể tải thông tin profile.');
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          onLogout(); // Gọi hàm logout từ App.js nếu token không hợp lệ
        }
      } finally {
         setLoading(false);
      }
    };
    fetchProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // Chạy lại khi token thay đổi

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!token) return;

    if (!nameInput.trim()) {
      setMessage('Tên mới không được để trống.');
      return;
    }

    try {
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      // Gọi API thật
      const response = await axios.put(PROFILE_API_URL, { name: nameInput }, config);
      setUserData(response.data); // Cập nhật state với dữ liệu mới từ backend
      setMessage('Cập nhật thông tin thành công!');
      setTimeout(() => setMessage(''), 3000); // Tự ẩn thông báo
    } catch (error) {
      console.error("Lỗi khi cập nhật profile:", error);
      setMessage(error.response?.data?.message || 'Cập nhật thất bại.');
    }
  };

  if (loading) return <p className="muted">Đang tải...</p>; // Bỏ card
  if (!userData) return <p className="error">{message || 'Không có dữ liệu.'}</p>; // Bỏ card

  return (
    // Bỏ thẻ div.card nếu App.js đã bọc
    <>
      <h2>Thông tin cá nhân</h2>
      <div style={{ marginBottom: '20px' }}>
        <p><strong>Tên:</strong> {userData.name}</p>
        <p><strong>Email:</strong> {userData.email}</p>
        {userData.role && <p><strong>Vai trò:</strong> {userData.role}</p>}
      </div>

      <hr style={{margin: '20px 0', borderColor: 'var(--secondary)'}}/>

      <form onSubmit={handleUpdateProfile} className="form">
        <h3>Cập nhật tên</h3>
        <label>
          Tên mới
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            required
          />
        </label>
        <button type="submit" className="btn">Lưu thay đổi</button>
      </form>
      {message && <p style={{ marginTop: '15px', textAlign: 'center' }}>{message}</p>}
    </>
  );
}

export default Profile;