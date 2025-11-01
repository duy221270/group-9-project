import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, setLogin } from "../store/authSlice";
import api, { API_ORIGIN } from "../api/axiosConfig";

const withBase = (url) =>
  url?.startsWith("http") ? url : url ? `${API_ORIGIN}${url}` : "";

export default function Profile() {
  const dispatch = useDispatch();
  const userFromStore = useSelector(selectUser);
  const [userData, setUserData] = useState(userFromStore);
  const [nameInput, setNameInput] = useState(userFromStore?.name || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // 🟢 Đồng bộ khi Redux thay đổi
  useEffect(() => {
    setUserData(userFromStore);
    setNameInput(userFromStore?.name || "");
  }, [userFromStore]);

  // 🟢 Làm mới thông tin user
  const refreshProfile = async () => {
    try {
      const res = await api.get("/users/profile");
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      dispatch(setLogin({ user: res.data, accessToken, refreshToken }));
      localStorage.setItem("user", JSON.stringify(res.data));
      setUserData(res.data);
    } catch (err) {
      console.error("Lỗi tải profile:", err);
    }
  };

  // 🟢 Cập nhật tên
  const handleUpdateName = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await api.put("/users/profile", { name: nameInput });
      const newUser = { ...userData, name: res.data.name };
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      dispatch(setLogin({ user: newUser, accessToken, refreshToken }));
      localStorage.setItem("user", JSON.stringify(newUser));
      setUserData(newUser);
      setMessage("✅ Cập nhật tên thành công!");
    } catch (err) {
      console.error(err);
      setMessage("❌ Cập nhật thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Upload avatar — FIX MẤT ẢNH KHI RELOAD
  const handleUploadAvatar = async () => {
    if (!avatarFile) return setMessage("⚠️ Chưa chọn ảnh!");
    setLoading(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);

      const res = await api.post("/users/upload-avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const avatarUrl = res.data?.avatarUrl;
      if (!avatarUrl) throw new Error("Không có URL trả về từ server!");

      // 🔁 Gọi lại /users/profile để lấy dữ liệu mới nhất từ DB
      const me = await api.get("/users/profile");
      const newUser = { ...me.data, avatar: avatarUrl };

      // ✅ Cập nhật Redux + localStorage
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      dispatch(setLogin({ user: newUser, accessToken, refreshToken }));
      localStorage.setItem("user", JSON.stringify(newUser));

      setUserData(newUser);
      setMessage("✅ Upload avatar thành công!");
    } catch (err) {
      console.error(err);
      setMessage("❌ Upload thất bại!");
    } finally {
      setLoading(false);
    }
  };

  if (!userData) return <p>Đang tải...</p>;

  const avatarSrc = userData.avatar
    ? withBase(userData.avatar)
    : "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  return (
    <div>
      <h2>Thông tin cá nhân</h2>

      {/* Ảnh đại diện */}
      <div style={{ textAlign: "center" }}>
        <img
          src={avatarSrc}
          alt="avatar"
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            border: "2px solid var(--accent)",
            objectFit: "cover",
          }}
        />
        <p>
          <strong>Tên:</strong> {userData.name}
        </p>
        <p>
          <strong>Email:</strong> {userData.email}
        </p>
        <p>
          <strong>Vai trò:</strong> {userData.role}
        </p>
      </div>

      {/* 🌟 Hiển thị mô tả theo vai trò */}
      {userData.role === "admin" && (
        <p style={{ color: "gold" }}>
          🌟 Bạn là <b>Admin</b> — toàn quyền quản lý người dùng.
        </p>
      )}
      {userData.role === "moderator" && (
        <p style={{ color: "skyblue" }}>
          🔧 Bạn là <b>Moderator</b> — có quyền xem danh sách user.
        </p>
      )}
      {userData.role === "user" && (
        <p style={{ color: "gray" }}>
          👤 Bạn là <b>User</b> — chỉ có thể chỉnh sửa thông tin cá nhân.
        </p>
      )}

      <hr style={{ margin: "20px 0", borderColor: "#222" }} />

      {/* 📝 Form cập nhật tên */}
      <form onSubmit={handleUpdateName}>
        <h3>Cập nhật tên</h3>
        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Nhập tên mới..."
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "8px",
            background: "#0d1117",
            color: "white",
            border: "1px solid #333",
            marginBottom: "10px",
          }}
          required
        />
        <button
          className="btn"
          disabled={loading}
          style={{
            backgroundColor: "#00d061",
            color: "black",
            fontWeight: "bold",
            padding: "8px 16px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          {loading ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </form>

      <hr style={{ margin: "20px 0", borderColor: "#222" }} />

      {/* 📸 Upload avatar */}
      <div style={{ textAlign: "center" }}>
        <h3>Upload Avatar</h3>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setAvatarFile(e.target.files[0])}
          style={{ marginBottom: 10 }}
        />
        <div>
          <button
            onClick={handleUploadAvatar}
            className="btn"
            disabled={loading}
            style={{
              backgroundColor: "#00d061",
              color: "black",
              fontWeight: "bold",
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
          >
            {loading ? "Đang tải..." : "Tải ảnh lên"}
          </button>
        </div>
      </div>

      {/* Thông báo */}
      {message && (
        <p
          style={{
            textAlign: "center",
            marginTop: 12,
            color: "var(--accent)",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}
