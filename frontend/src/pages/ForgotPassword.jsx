import React, { useState } from "react";
import api from "../api/axiosConfig";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMsg(res.data.message || "✅ Đã gửi email đặt lại mật khẩu!");
    } catch (err) {
      setMsg("❌ " + (err.response?.data?.message || "Lỗi gửi email"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 400, margin: "50px auto", textAlign: "center" }}>
      <h2>Quên mật khẩu</h2>
      <p>Nhập email bạn đã đăng ký để nhận liên kết đặt lại mật khẩu.</p>
      <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
        <input
          type="email"
          required
          placeholder="Nhập email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: 10, borderRadius: 5, marginBottom: 10 }}
        />
        <button className="btn" type="submit" disabled={loading} style={{ width: "100%" }}>
          {loading ? "Đang gửi..." : "Gửi liên kết đặt lại"}
        </button>
      </form>
      {msg && <p style={{ marginTop: 12, color: "var(--accent)" }}>{msg}</p>}
    </div>
  );
}
