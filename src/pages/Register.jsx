import React, { useState } from 'react';
import axios from 'axios';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');

  const { name, email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      // 1. Dùng đường dẫn tương đối (proxy sẽ lo phần còn lại)
      const res = await axios.post('/api/auth/signup', formData);

      setMessage('Đăng ký thành công!');
      console.log(res.data);
      setFormData({ name: '', email: '', password: '' });

    } catch (err) {
      setMessage(err.response?.data?.message || 'Đăng ký thất bại.');
      console.error(err.response?.data);
    }
  };

  return (
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
          />
        </label>
        <label>
          Mật khẩu
          <input
            type="password"
            name="password"
            value={password}
            onChange={onChange}
            minLength="6"
            required
          />
        </label>
        <button type="submit" className="btn">Đăng ký</button>
      </form>
      
      {message && <p style={{ marginTop: '15px', textAlign: 'center' }}>{message}</p>}
    </>
  );
}

export default Register;