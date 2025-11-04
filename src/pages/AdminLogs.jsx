import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatAction = (action) => {
    switch (action) {
      case "LOGIN":
        return "🔑 Đăng nhập hệ thống";
      case "LOGOUT":
        return "🚪 Đăng xuất";
      case "UPLOAD_AVATAR":
        return "🖼️ Cập nhật ảnh đại diện";
      case "UPDATE_PROFILE":
        return "📝 Cập nhật hồ sơ cá nhân";
      case "RESET_PASSWORD":
        return "🔒 Đặt lại mật khẩu";
      case "DELETE_USER":
        return "❌ Xóa người dùng";
      case "CREATE_USER":
        return "🆕 Tạo tài khoản mới";
      case "FAILED_LOGIN":
        return "⚠️ Đăng nhập sai mật khẩu";
      case "CHANGE_ROLE":
        return "👑 Thay đổi vai trò người dùng";
      default:
        return "⚙️ Hoạt động khác";
    }
  };

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get("/logs");
        setLogs(res.data);
      } catch (err) {
        console.warn("⚠️ Không tìm thấy /api/logs, dùng dữ liệu demo!");
        setError("Không thể tải logs từ server.");

        // 🧠 Dữ liệu mô phỏng hoạt động người dùng
        const mockLogs = [
          {
            _id: "1",
            user: { name: "Vy", email: "vyfinal@example.com" },
            action: "LOGIN",
            timestamp: "2025-11-04T08:35:00.000Z",
          },
          {
            _id: "2",
            user: { name: "Vy", email: "vyfinal@example.com" },
            action: "UPLOAD_AVATAR",
            timestamp: "2025-11-04T08:40:00.000Z",
          },
          {
            _id: "3",
            user: { name: "Vy", email: "vyfinal@example.com" },
            action: "UPDATE_PROFILE",
            timestamp: "2025-11-04T08:45:00.000Z",
          },
          {
            _id: "4",
            user: { name: "Vy", email: "vyfinal@example.com" },
            action: "LOGOUT",
            timestamp: "2025-11-04T09:00:00.000Z",
          },
          {
            _id: "5",
            user: { name: "Khang Duy", email: "duy3012@gmail.com" },
            action: "RESET_PASSWORD",
            timestamp: "2025-11-04T07:15:00.000Z",
          },
          {
            _id: "6",
            user: { name: "SonK", email: "yen@gmail.com" },
            action: "FAILED_LOGIN",
            timestamp: "2025-11-03T21:10:00.000Z",
          },
          {
            _id: "7",
            user: { name: "Trang", email: "trangfinal@example.com" },
            action: "CREATE_USER",
            timestamp: "2025-11-03T18:00:00.000Z",
          },
          {
            _id: "8",
            user: { name: "Moderator Test", email: "mod@gmail.com" },
            action: "CHANGE_ROLE",
            timestamp: "2025-11-03T22:25:00.000Z",
          },
          {
            _id: "9",
            user: { name: "Vy", email: "vyfinal@example.com" },
            action: "DELETE_USER",
            timestamp: "2025-11-04T10:15:00.000Z",
          },
          {
            _id: "10",
            user: { name: "Trang", email: "trangfinal@example.com" },
            action: "LOGIN",
            timestamp: "2025-11-02T12:35:00.000Z",
          },
        ];

        setLogs(mockLogs);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading)
    return <div className="card">⏳ Đang tải nhật ký hoạt động...</div>;

  return (
    <div className="card" style={{ animation: "fadeIn 0.4s ease-in-out" }}>
      <h3 style={{ color: "#25c78d" }}>📜 Nhật ký hoạt động người dùng</h3>
      {logs.length === 0 ? (
        <p>Chưa có hoạt động nào được ghi nhận.</p>
      ) : (
        <table
          style={{
            width: "100%",
            marginTop: "10px",
            borderCollapse: "collapse",
            background: "var(--dark)",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <thead
            style={{
              background: "#222",
              color: "#f4f4f4",
              fontWeight: "bold",
            }}
          >
            <tr>
              <th style={thStyle}>#</th>
              <th style={thStyle}>👤 Người dùng</th>
              <th style={thStyle}>📧 Email</th>
              <th style={thStyle}>⚙️ Hành động</th>
              <th style={thStyle}>🕒 Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={log._id} style={trStyle(index)}>
                <td style={tdStyle}>{index + 1}</td>
                <td style={{ ...tdStyle, color: "#fff" }}>
                  {log.user?.name || "Ẩn danh"}
                </td>
                <td style={tdStyle}>{log.user?.email || "-"}</td>
                <td style={{ ...tdStyle, color: "#25c78d" }}>
                  {formatAction(log.action)}
                </td>
                <td style={tdStyle}>
                  {new Date(log.timestamp).toLocaleTimeString("vi-VN")}{" "}
                  {new Date(log.timestamp).toLocaleDateString("vi-VN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// 🎨 Style phần bảng
const thStyle = {
  padding: "10px",
  borderBottom: "2px solid #333",
  textAlign: "left",
  background: "#2d2d2d",
};

const tdStyle = {
  padding: "8px 10px",
  borderBottom: "1px solid #333",
  color: "#ddd",
};

const trStyle = (index) => ({
  backgroundColor: index % 2 === 0 ? "#121212" : "#1a1a1a",
  transition: "background 0.2s",
  cursor: "default",
});
