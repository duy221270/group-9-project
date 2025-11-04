// src/pages/Login.jsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axiosConfig";
import { setLogin } from "../store/authSlice";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // 🧩 Xử lý thay đổi input
  const onChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  // 🧩 Xử lý submit form
  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      // 1️⃣ Gửi yêu cầu đăng nhập
      const res = await api.post("/auth/login", form);
      const { accessToken, refreshToken, user: userInLogin } = res.data || {};

      // 2️⃣ Nếu backend chưa trả user, thì gọi API profile
      let user = userInLogin;
      if (!user) {
        const me = await api.get("/users/profile", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        user = me.data;
      }

      // 3️⃣ Lưu thông tin vào Redux + localStorage
      dispatch(setLogin({ user, accessToken, refreshToken }));
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      setMsg("✅ Đăng nhập thành công!");
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      console.error("Login error:", err);
      const errMsg =
        err.response?.data?.message ||
        "❌ Đăng nhập thất bại! Kiểm tra email hoặc mật khẩu.";
      setMsg(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="card"
      style={{
        maxWidth: 420,
        margin: "40px auto",
        padding: "30px 25px",
        borderRadius: "12px",
        boxShadow: "0 3px 12px rgba(0,0,0,0.15)",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 16 }}>Đăng nhập hệ thống</h2>

      <form onSubmit={onSubmit} className="form">
        <label style={{ display: "block", marginBottom: 10 }}>
          Email:
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            required
            placeholder="Nhập email của bạn"
            style={inputStyle}
          />
        </label>

        <label style={{ display: "block", marginBottom: 10 }}>
          Mật khẩu:
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            required
            placeholder="Nhập mật khẩu"
            style={inputStyle}
          />
        </label>

        <button
          type="submit"
          className="btn"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </button>
      </form>

      {msg && (
        <p
          style={{
            textAlign: "center",
            marginTop: 14,
            color: msg.startsWith("✅") ? "#4caf50" : "#e53935",
          }}
        >
          {msg}
        </p>
      )}

      <div style={{ marginTop: 20, textAlign: "center" }}>
        <Link to="/forgot-password" style={{ color: "#1565c0", marginRight: 10 }}>
          Quên mật khẩu?
        </Link>
        <Link to="/register" style={{ color: "#1565c0" }}>
          Đăng ký tài khoản mới
        </Link>
      </div>
    </div>
  );
}

// 🎨 Style nhỏ cho input
const inputStyle = {
  width: "100%",
  padding: "10px",
  marginTop: "4px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  fontSize: "14px",
};

export default Login;
