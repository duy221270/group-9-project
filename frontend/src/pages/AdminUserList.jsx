import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { useSelector } from "react-redux";
import { selectUser } from "../store/authSlice";

export default function AdminUserList() {
  const currentUser = useSelector(selectUser);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [newUser, setNewUser] = useState({ name: "", email: "" });

  // ✅ Đường dẫn API chính xác
  const USERS_API = "/users";

  // 🟢 Lấy danh sách user
  const fetchAllUsers = async () => {
    try {
      const res = await api.get(USERS_API);
      setUsers(res.data || []);
      setMsg("");
    } catch (err) {
      console.error("Lỗi lấy user:", err);
      setMsg("❌ Không thể tải danh sách người dùng (chưa đủ quyền hoặc lỗi server).");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  // 🟢 Thêm user (chỉ admin)
  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email)
      return setMsg("⚠️ Hãy nhập đủ tên và email!");
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

  // 🟢 Xoá user (chỉ admin)
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa user này?")) return;
    try {
      await api.delete(`${USERS_API}/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      setMsg("🗑️ Xóa user thành công!");
      setTimeout(() => setMsg(""), 2000);
    } catch (err) {
      console.error("Lỗi xóa user:", err);
      setMsg("❌ Xóa thất bại!");
    }
  };

  if (loading) return <p>Đang tải danh sách...</p>;

  // Nếu là user thường, không cho truy cập
  if (currentUser?.role === "user") {
    return (
      <div className="card">
        <p style={{ color: "gray" }}>
          ⚠️ Bạn không có quyền truy cập vào trang này.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
      {/* 🧩 Bên trái: Form thêm user (chỉ admin) */}
      {currentUser?.role === "admin" && (
        <div
          style={{
            width: "280px",
            backgroundColor: "#1f2733",
            padding: "20px",
            borderRadius: "12px",
            color: "white",
            boxShadow: "0 0 8px rgba(0,0,0,0.3)",
          }}
        >
          <h3 style={{ marginBottom: "15px" }}>Thêm User mới</h3>

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
              border: "1px solid #333",
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
              border: "1px solid #333",
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
              marginTop: "6px",
            }}
          >
            ➕ Thêm User
          </button>
        </div>
      )}

      {/* 🧩 Bên phải: Danh sách user */}
      <div
        style={{
          flex: 1,
          backgroundColor: "#1f2733",
          borderRadius: "12px",
          padding: "20px",
          color: "white",
          boxShadow: "0 0 8px rgba(0,0,0,0.3)",
        }}
      >
        <h2>Quản lý Người dùng ({currentUser.role === "admin" ? "Admin" : "Moderator"})</h2>
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
                {/* Thông tin user */}
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
                      {user.role === "moderator" && (
                        <span style={{ color: "lightblue", fontSize: 12 }}>
                          (Mod)
                        </span>
                      )}
                    </div>
                    <div style={{ color: "#aaa", fontSize: "13px" }}>
                      {user.email}
                    </div>
                  </div>
                </div>

                {/* Nút xóa: chỉ admin được quyền */}
                {currentUser?.role === "admin" && (
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
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
