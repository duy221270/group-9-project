import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";

export default function ResetPassword() {
  const { resetToken } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setMsg("⚠️ Mật khẩu xác nhận không khớp!");
      return;
    }
    setLoading(true);
    setMsg("");
    try {
      const res = await api.post(`/auth/resetpassword/${resetToken}`, { password });
      setMsg(res.data.message || "✅ Đặt lại mật khẩu thành công!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMsg("❌ " + (err.response?.data?.message || "Lỗi đặt lại mật khẩu"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 400, margin: "50px auto", textAlign: "center" }}>
      <h2>Đặt lại mật khẩu</h2>
      <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
        <input
          type="password"
          placeholder="Mật khẩu mới"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", padding: 10, borderRadius: 5, marginBottom: 10 }}
        />
        <input
          type="password"
          placeholder="Nhập lại mật khẩu"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          style={{ width: "100%", padding: 10, borderRadius: 5, marginBottom: 10 }}
        />
        <button className="btn" type="submit" disabled={loading} style={{ width: "100%" }}>
          {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
        </button>
      </form>
      {msg && <p style={{ marginTop: 12, color: "var(--accent)" }}>{msg}</p>}
    </div>
  );
}
