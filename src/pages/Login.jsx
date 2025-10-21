import React, { useState } from 'react';
import axios from 'axios';

// 1. Nhận prop onLoginSuccess từ App.js
function Login({ onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');

  const { email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      // 2. Dùng đường dẫn tương đối (proxy sẽ lo phần còn lại)
      const res = await axios.post('/api/auth/login', formData);
      
      const token = res.data.token;
      
      // 3. Báo cho App.js biết đăng nhập thành công và gửi token lên
      onLoginSuccess(token);
      
      setMessage('Đăng nhập thành công!');

    } catch (err) {
      setMessage(err.response?.data?.message || 'Đăng nhập thất bại!');
      console.error(err.response?.data);
    }
  };

  return (
    <>
      <h2>Đăng nhập</h2>
      <form onSubmit={onSubmit} className="form">
        <label>
          Email
          <input
            type="email"
            placeholder="Email"
            name="email"
            value={email}
            onChange={onChange}
            required
          />
        </label>
        <label>
          Mật khẩu
          <input
            type="password"
            placeholder="Mật khẩu"
            name="password"
            value={password}
            onChange={onChange}
            required
          />
        </label>
        <button type="submit" className="btn">Đăng nhập</button>
      </form>
      {message && <p className="error" style={{ marginTop: '15px', textAlign: 'center' }}>{message}</p>}
    </>
  );
}

export default Login;