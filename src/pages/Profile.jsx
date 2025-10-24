import React, { useState, useEffect } from 'react';
import axios from 'axios';

// API URL (đã sửa lại cho đúng với backend)
const PROFILE_API_URL = '/api/users/profile'; // <-- ĐÃ SỬA

function Profile({ token, onLogout }) { // Nhận token và onLogout từ App.js
  const [userData, setUserData] = useState(null);
  const [nameInput, setNameInput] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setMessage('Bạn cần đăng nhập.');
        setLoading(false);
        return;
      }
      try {
        // --- SỬA Ở ĐÂY ---
        const config = {
          headers: {
            'Authorization': `Bearer ${token}` // Sửa header
          }
        };
        const response = await axios.get(PROFILE_API_URL, config); // Dùng URL đã sửa
        setUserData(response.data);
        setNameInput(response.data.name);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin profile:", error);
        setMessage('Không thể tải thông tin profile.');
        setLoading(false);
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          onLogout(); // Gọi hàm logout từ App.js nếu token không hợp lệ
        }
      }
    };
    fetchProfile();
  }, [token, onLogout]); // Thêm dependencies

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!token) return;

    if (!nameInput.trim()) {
      setMessage('Tên mới không được để trống.');
      return;
    }

    try {
      // --- SỬA Ở ĐÂY ---
      const config = {
        headers: {
          'Authorization': `Bearer ${token}` // Sửa header
        }
      };
      const response = await axios.put(PROFILE_API_URL, { name: nameInput }, config); // Dùng URL đã sửa
      setUserData(response.data);
      setMessage('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error("Lỗi khi cập nhật profile:", error);
      setMessage(error.response?.data?.message || 'Cập nhật thất bại.');
    }
  };

  if (loading) return <p className="muted">Đang tải...</p>; // Bỏ card vì đã có ở App.js
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