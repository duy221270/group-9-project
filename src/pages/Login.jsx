// src/pages/Login.jsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { setLogin } from "../store/authSlice";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      // 1) Đăng nhập
      const res = await api.post("/auth/login", form);
      const { accessToken, refreshToken, user: userInLogin } = res.data || {};

      // 2) Lấy user đầy đủ (nếu login chưa trả user) – để chắc chắn có avatar/role
      let user = userInLogin;
      if (!user) {
        const me = await api.get("/users/profile", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        user = me.data;
      }

      // 3) Lưu Redux + localStorage
      dispatch(setLogin({ user, accessToken, refreshToken }));
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setMsg(err.response?.data?.message || "Đăng nhập thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="form" style={{ maxWidth: 420, margin: "0 auto" }}>
      <h2>Đăng nhập</h2>
      <label>
        Email
        <input name="email" type="email" value={form.email} onChange={onChange} required />
      </label>
      <label>
        Mật khẩu
        <input name="password" type="password" value={form.password} onChange={onChange} required />
      </label>
      <button className="btn" disabled={loading}>{loading ? "Đang xử lý..." : "Đăng nhập"}</button>
      {msg && <p style={{ marginTop: 12, color: "var(--danger)" }}>{msg}</p>}
    </form>
  );
}

export default Login;
