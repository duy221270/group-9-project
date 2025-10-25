import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

// Receives authApiUrl prop from App.js
function Register({ authApiUrl }) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState(''); // For success messages
  const [error, setError] = useState('');   // For error messages
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate(); // Hook for navigation

  const { name, email, password } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    // Basic client-side validation for password length
    if (password.length < 6) {
        setError('Mật khẩu phải có ít nhất 6 ký tự.');
        setLoading(false);
        return;
    }

    try {
      // Use the apiUrl passed from App.js
      await axios.post(`${authApiUrl}/signup`, formData);
      setMessage('Đăng ký thành công! Chuyển hướng đến đăng nhập...');
      setFormData({ name: '', email: '', password: '' }); // Clear form

      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      console.error(err.response?.data);
      setLoading(false); // Reset loading state on error
    }
    // No finally setLoading(false) needed here because success navigates away
  };

  return (
    // Assuming the parent provides the card styling
    <>
      <h2>Đăng ký tài khoản</h2>
      <form onSubmit={onSubmit} className="form">
        <label>
          Tên
          <input
            type="text"
            name="name"
            value={name}
            onChange={onChange}
            required
            className="input"
            disabled={loading}
          />
        </label>
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
          Mật khẩu (ít nhất 6 ký tự)
          <input
            type="password"
            name="password"
            value={password}
            onChange={onChange}
            minLength="6"
            required
            className="input"
            disabled={loading}
          />
        </label>
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>
      </form>
      {/* Display Success Message */}
      {message && <p style={{ marginTop: '15px', color: 'var(--accent)', textAlign: 'center' }}>{message}</p>}
      {/* Display Error Message */}
      {error && <p className="error" style={{ marginTop: '15px', color: 'var(--danger)', textAlign: 'center' }}>{error}</p>}
    </>
  );
}

export default Register;
