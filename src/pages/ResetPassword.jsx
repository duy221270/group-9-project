import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom'; // Import useParams and useNavigate

// Receives apiUrl prop from App.js (e.g., '/api/auth')
function ResetPassword({ apiUrl }) {
  const { resetToken } = useParams(); // Get token from URL parameter
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Added confirm password field
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Hook for navigation

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Client-side validation
    if (password.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.');
      return;
    }

    setLoading(true);
    try {
      // PUT request to the backend endpoint with token and new password
      const res = await axios.put(`${apiUrl}/reset-password/${resetToken}`, { password });
      setMessage(res.data.message || 'Đổi mật khẩu thành công! Bạn có thể đăng nhập ngay.');
      setPassword(''); // Clear fields
      setConfirmPassword('');

      // Optional: Redirect to login after success
      setTimeout(() => {
        navigate('/login');
      }, 3000); // Redirect after 3 seconds

    } catch (err) {
      console.error('Lỗi khi đặt lại mật khẩu:', err);
      setError(err.response?.data?.message || 'Token không hợp lệ, đã hết hạn hoặc có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 400, margin: 'auto' }}>
      <h2>Đặt lại mật khẩu</h2>
      <form onSubmit={handleReset} className="form">
        <label>
          Mật khẩu mới:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="6"
            className="input"
            disabled={loading}
          />
        </label>
        <label>
          Xác nhận mật khẩu mới:
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength="6"
            className="input"
            disabled={loading}
          />
        </label>
        <button
          type="submit"
          className="btn btn-primary" // Use consistent class names
          style={{ marginTop: '10px' }}
          disabled={loading}
        >
          {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
        </button>
      </form>
      {/* Display Success Message */}
      {message && <p style={{ marginTop: '15px', color: 'var(--accent)', textAlign: 'center' }}>{message}</p>}
      {/* Display Error Message */}
      {error && <p style={{ marginTop: '15px', color: 'var(--danger)', textAlign: 'center' }}>{error}</p>}
    </div>
  );
}

export default ResetPassword;
