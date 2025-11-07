import React, { useState } from "react";
import api from "../api/axiosConfig";

export default function AddUser({ onSuccess }) {
  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // ✅ CHỈ '/users'
      await api.post("/users", form);
      setForm({ name: "", email: "" });
      onSuccess && onSuccess(); // cho AdminUserList reload
    } catch (err) {
      console.error("Lỗi thêm user:", err);
      alert("Thêm user thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2>Thêm User mới</h2>
      <form onSubmit={submit} className="form">
        <label>
          Tên
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </label>
        <button className="btn" disabled={loading}>
          {loading ? "Đang thêm..." : "Thêm User"}
        </button>
      </form>
    </>
  );
}
