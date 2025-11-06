<<<<<<< HEAD
// src/AddUser.jsx

import React, { useState } from 'react';
import axios from 'axios';

const AddUser = ({ onUserAdded }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const newUser = { name, email };

    axios.post("http://localhost:3000/users", newUser)
      .then(response => {
        onUserAdded(response.data);
        setName('');
        setEmail('');
      })
      .catch(error => console.error("Lỗi khi thêm user:", error));
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Thêm User mới</h2>
      
      {/* Bọc mỗi input trong một thẻ div */}
      <div>
        <input
          type="text"
          placeholder="Tên"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <button type="submit">Thêm</button>
    </form>
  );
};

export default AddUser;
=======
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
>>>>>>> origin/feature/redux-protected
