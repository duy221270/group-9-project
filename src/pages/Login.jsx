import React, { useState } from 'react';
import axios from 'axios';

// Nhận props từ App.js
function Login({ onLoginSuccess }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const { email, password } = formData;
  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await axios.post('/api/auth/login', formData); // Đường dẫn tương đối
      onLoginSuccess(res.data.token); // Báo cho App.js
      // Không cần setMessage ở đây vì App.js sẽ tự chuyển trang
    } catch (err) {
      setMessage(err.response?.data?.message || 'Đăng nhập thất bại!');
      console.error(err.response?.data);
    }
  };

  return (
    // <> </> thay vì div.card
    <>
      <h2>Đăng nhập</h2>
      <form onSubmit={onSubmit} className="form">
        <label> Email <input type="email" name="email" value={email} onChange={onChange} required /> </label>
        <label> Mật khẩu <input type="password" name="password" value={password} onChange={onChange} required /> </label>
        <button type="submit" className="btn">Đăng nhập</button>
      </form>
      {message && <p className="error" style={{ marginTop: '15px', textAlign: 'center' }}>{message}</p>}
    </>
  );
}

export default Login;