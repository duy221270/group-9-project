import React, { useState } from 'react';
import axios from 'axios';

// Receives apiUrl prop from App.js (e.g., '/api/auth')
function ForgotPassword({ apiUrl }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      // POST to the forgot-password endpoint defined in the backend
      const res = await axios.post(`${apiUrl}/forgot-password`, { email });
      setMessage(res.data.message || 'Yêu cầu reset mật khẩu đã được gửi vào email của bạn!');
      setEmail(''); // Clear email field on success
    } catch (err) {
      console.error('Lỗi khi gửi yêu cầu quên mật khẩu:', err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 400, margin: 'auto' }}>
      <h2>Quên mật khẩu</h2>
      <p style={{ marginBottom: '15px', color: 'var(--muted)' }}>
        Nhập email của bạn để nhận link đặt lại mật khẩu.
      </p>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input" // Use consistent class names if defined in App.css
            disabled={loading}
          />
        </label>
        <button
          type="submit"
          className="btn btn-primary" // Use consistent class names
          style={{ marginTop: '10px' }}
          disabled={loading}
        >
          {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
        </button>
      </form>
      {/* Display Success Message */}
      {message && <p style={{ marginTop: '15px', color: 'var(--accent)', textAlign: 'center' }}>{message}</p>}
      {/* Display Error Message */}
      {error && <p style={{ marginTop: '15px', color: 'var(--danger)', textAlign: 'center' }}>{error}</p>}
    </div>
  );
}

export default ForgotPassword;
