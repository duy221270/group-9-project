<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserList = ({ users, setUsers }) => {
  useEffect(() => {
    axios.get("http://localhost:3000/users")
      .then(response => {
        setUsers(response.data);
      })
      .catch(error => console.error("Lỗi khi lấy danh sách user:", error));
  }, []);

  return (
    <div>
      <h2>Danh sách User</h2>
      <ul>
        {users.map(user => (
          <li key={user.id || user._id}>{user.name} - {user.email}</li>
        ))}
      </ul>
    </div>
  );
};
=======
import React from 'react';

function UserList({ users, onEdit, onDelete }) {
  return (
    <div>
      <h2>Danh sách User</h2>
      {users.length > 0 ? (
        <ul className="list">
          {users.map(user => (
            // Giả định backend trả về _id (MongoDB default)
            <li key={user._id} className="list-item">
              <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
              <div>
                <div className="name">{user.name}</div>
                <div className="email">{user.email}</div>
              </div>
              <div className="list-item-buttons">
                <button className="btn btn-sm edit-btn" onClick={() => onEdit(user)}>Sửa</button>
                <button className="btn btn-sm delete-btn" onClick={() => onDelete(user._id)}>Xóa</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">Không có người dùng nào.</p>
      )}
    </div>
  );
}
>>>>>>> origin/feature/redux-protected

export default UserList;