import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserList from './components/UserList';
import AddUser from './components/AddUser';
import './App.css'; // File CSS bạn vừa gửi

const API_URL = 'http://localhost:3000/users';

function App() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(API_URL);
      setUsers(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách user:", error);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa user này?')) {
      try {
        await axios.delete(`${API_URL}/${userId}`);
        setUsers(users.filter(user => user._id !== userId));
      } catch (error) {
        console.error("Lỗi khi xóa user:", error);
      }
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (editingUser) {
      try {
        const response = await axios.put(`${API_URL}/${editingUser._id}`, formData);
        setUsers(users.map(user => (user._id === editingUser._id ? response.data : user)));
      } catch (error) {
        console.error("Lỗi khi cập nhật user:", error);
      }
    } else {
      try {
        const response = await axios.post(API_URL, formData);
        setUsers([...users, response.data]);
      } catch (error) {
        console.error("Lỗi khi thêm user:", error);
      }
    }
    setFormData({ name: '', email: '' });
    setEditingUser(null);
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '' });
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Quản Lý User</h1>
        <p className="subtitle">Hoàn thiện CRUD với React & Node.js</p>
      </div>
      <div className="grid">
        <div className="card">
          <AddUser
            formData={formData}
            setFormData={setFormData}
            editingUser={editingUser}
            onSubmit={handleFormSubmit}
            onCancel={cancelEdit}
          />
        </div>
        <div className="card">
          <UserList
            users={users}
            onEdit={handleEditClick}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}

export default App;