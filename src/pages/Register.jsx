// src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig"; // ✅ dùng api đã config sẵn

function Register() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { name, email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      setLoading(false);
      return;
    }

    try {
      // ✅ Gọi API qua axiosConfig (baseURL = http://localhost:5000/api)
      await api.post("/auth/signup", formData);
      setMessage("✅ Đăng ký thành công! Chuyển hướng đến đăng nhập...");
      setFormData({ name: "", email: "", password: "" });

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Đăng ký lỗi:", err);
      setError(err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
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
            disabled={loading}
          />
        </label>
        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </button>
      </form>

      {message && (
        <p style={{ color: "var(--accent)", textAlign: "center", marginTop: 10 }}>
          {message}
        </p>
      )}
      {error && (
        <p style={{ color: "var(--danger)", textAlign: "center", marginTop: 10 }}>
          {error}
        </p>
      )}
    </>
  );
}

export default Register;
