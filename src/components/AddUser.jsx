import React, { useState } from 'react';

function AddUser({ formData, setFormData, editingUser, onSubmit, onCancel }) {
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Tên không được để trống";
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email không hợp lệ";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    onSubmit(e); // Gọi hàm submit từ App.js
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <h2>{editingUser ? 'Cập nhật User' : 'Thêm User mới'}</h2>
      <label>
        Tên
        <input type="text" name="name" value={formData.name} onChange={handleInputChange} />
        {errors.name && <p className="error">{errors.name}</p>}
      </label>
      <label>
        Email
        <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
        {errors.email && <p className="error">{errors.email}</p>}
      </label>
      <button type="submit" className="btn">{editingUser ? 'Lưu thay đổi' : 'Thêm User'}</button>
      {editingUser && <button typeD="button" className="btn btn-secondary" onClick={onCancel}>Hủy</button>}
    </form>
  );
}

export default AddUser;