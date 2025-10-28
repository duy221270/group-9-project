import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";

export default function AdminUserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [newUser, setNewUser] = useState({ name: "", email: "" });

  // ⚙️ Kiểm tra backend là "/users" hay "/users/users"
  const USERS_API = "/users/users";

  // 🟢 Lấy danh sách user
  const fetchAllUsers = async () => {
    try {
      const res = await api.get(USERS_API);
      setUsers(res.data || []);
    } catch (err) {
      console.error("Lỗi lấy user:", err);
      if (err.response?.status === 401)
        setMsg("Không có quyền Admin hoặc thiếu token!");
      else setMsg("Không thể tải danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  // 🟢 Thêm user
  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email)
      return setMsg("⚠️ Nhập đủ tên và email!");
    try {
      await api.post(USERS_API, newUser);
      setMsg("✅ Thêm user thành công!");
      setNewUser({ name: "", email: "" });
      fetchAllUsers();
    } catch (err) {
      console.error("Lỗi thêm user:", err);
      setMsg("❌ Không thể thêm user!");
    }
  };

  // 🟢 Xoá user
  const handleDelete = async (id) => {
    if (!window.confirm("Xóa user này?")) return;
    try {
      await api.delete(`${USERS_API}/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      setMsg("Xóa user thành công!");
      setTimeout(() => setMsg(""), 2000);
    } catch (err) {
      console.error("Lỗi xóa user:", err);
      setMsg("❌ Xóa thất bại!");
    }
  };

  if (loading) return <p>Đang tải danh sách...</p>;

  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
      {/* KHUNG TRÁI */}
      <div
        style={{
          width: "280px",
          backgroundColor: "#1f2733",
          padding: "20px",
          borderRadius: "12px",
          color: "white",
        }}
      >
        <h3>Thêm User mới</h3>
        <label>Tên</label>
        <input
          type="text"
          placeholder="Nhập tên..."
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "6px",
            background: "#0d1117",
            color: "white",
            border: "none",
            marginTop: "4px",
          }}
        />
        <label style={{ marginTop: "10px" }}>Email</label>
        <input
          type="email"
          placeholder="Nhập email..."
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "6px",
            background: "#0d1117",
            color: "white",
            border: "none",
            marginTop: "4px",
            marginBottom: "10px",
          }}
        />
        <button
          onClick={handleAddUser}
          style={{
            width: "100%",
            backgroundColor: "#00d061",
            color: "black",
            fontWeight: "bold",
            padding: "10px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Thêm User
        </button>
      </div>

      {/* KHUNG PHẢI */}
      <div
        style={{
          flex: 1,
          backgroundColor: "#1f2733",
          borderRadius: "12px",
          padding: "20px",
          color: "white",
        }}
      >
        <h2>Quản lý Người dùng (Admin)</h2>
        {msg && <p style={{ color: "#00e676" }}>{msg}</p>}

        {users.length === 0 ? (
          <p style={{ color: "#aaa" }}>Không có người dùng nào.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {users.map((user) => (
              <li
                key={user._id}
                style={{
                  background: "#0d1117",
                  marginBottom: "8px",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      backgroundColor: "#e53935",
                      color: "#fff",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {(user.name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: "bold" }}>
                      {user.name}{" "}
                      {user.role === "admin" && (
                        <span style={{ color: "orange", fontSize: 12 }}>
                          (Admin)
                        </span>
                      )}
                    </div>
                    <div style={{ color: "#aaa", fontSize: "13px" }}>{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(user._id)}
                  style={{
                    backgroundColor: "#e53935",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px 12px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Xóa
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
