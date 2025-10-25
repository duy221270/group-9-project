import React, { useState } from 'react';
import axios from 'axios';

// Receives props from App.js
function Login({ onLoginSuccess, authApiUrl }) { // Added authApiUrl prop for consistency
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState(''); // Combined message/error state
  const [loading, setLoading] = useState(false); // Loading state for button

  const { email, password } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear previous message
    setLoading(true); // Set loading state
    try {
      // Use the apiUrl passed from App.js
      const res = await axios.post(`${authApiUrl}/login`, formData);
      onLoginSuccess(res.data.token); // Call parent callback with the new token
      // No need to set success message here, App.js handles navigation
    } catch (err) {
      setMessage(err.response?.data?.message || 'Đăng nhập thất bại!');
      console.error(err.response?.data);
      setLoading(false); // Reset loading on error
    }
    // No finally setLoading(false) needed here because successful login navigates away
  };

  return (
    // Assuming the parent provides the card styling
    <>
      <h2>Đăng nhập</h2>
      <form onSubmit={onSubmit} className="form">
        <label>
          Email
          <input
            type="email"
            name="email"
            value={email}
            onChange={onChange}
            required
            className="input"
            disabled={loading}
          />
        </label>
        <label>
          Mật khẩu
          <input
            type="password"
            name="password"
            value={password}
            onChange={onChange}
            required
            className="input"
            disabled={loading}
          />
        </label>
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Đăng nhập'}
        </button>
      </form>
      {/* Display Error/Info Message */}
      {message && <p className={message.includes('thất bại') ? 'error' : 'info'} style={{ marginTop: '15px', textAlign: 'center' }}>{message}</p>}
    </>
  );
}

export default Login;
