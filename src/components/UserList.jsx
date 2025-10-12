import React from 'react';

function UserList({ users, onEdit, onDelete }) {
  return (
    <div>
      <h2>Danh sách User</h2>
      <table>
        <thead>
          <tr>
            <th>Tên</th>
            <th>Email</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <button className="edit-btn" onClick={() => onEdit(user)}>Sửa</button>
                <button className="delete-btn" onClick={() => onDelete(user._id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserList;