import React from 'react';

function UserList({ users, onEdit, onDelete }) {
  return (
    <div>
      <h2>Danh sách User</h2>
      {users.length > 0 ? (
        <ul className="list">
          {users.map(user => (
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

export default UserList;