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