// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, setLogin } from "../store/authSlice";
import api, { API_ORIGIN } from "../api/axiosConfig";

const withBase = (url) => (url?.startsWith("http") ? url : url ? `${API_ORIGIN}${url}` : "");

function Profile() {
  const dispatch = useDispatch();
  const userFromStore = useSelector(selectUser);
  const [userData, setUserData] = useState(userFromStore);
  const [nameInput, setNameInput] = useState(userFromStore?.name || "");
  const [message, setMessage] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Đồng bộ khi Redux thay đổi (vd. sau login khôi phục)
  useEffect(() => {
    setUserData(userFromStore);
    setNameInput(userFromStore?.name || "");
  }, [userFromStore]);

  const refreshProfile = async () => {
    try {
      const me = await api.get("/users/profile");
      setUserData(me.data);
      setNameInput(me.data?.name || "");
      // Cập nhật Redux + localStorage để các chỗ khác dùng chung
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      dispatch(setLogin({ user: me.data, accessToken, refreshToken }));
      localStorage.setItem("user", JSON.stringify(me.data));
    } catch (err) {
      console.error("Fetch profile error:", err);
    }
  };

  // Update tên
  const handleUpdateName = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await api.put("/users/profile", { name: nameInput });
      setMessage("Cập nhật thông tin thành công!");
      // Cập nhật lại store + localStorage
      const newUser = { ...userData, name: res.data?.name || nameInput };
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      dispatch(setLogin({ user: newUser, accessToken, refreshToken }));
      localStorage.setItem("user", JSON.stringify(newUser));
      setUserData(newUser);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Cập nhật thất bại.");
    } finally {
      setLoading(false);
    }
  };

  // Upload avatar
  const handleUpload = async () => {
    if (!avatarFile) {
      setMessage("Hãy chọn ảnh trước!");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);
      const res = await api.post("/users/upload-avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const avatarUrl = res.data?.avatarUrl;
      const newUser = { ...userData, avatar: avatarUrl };
      // Cập nhật Redux + localStorage để giữ avatar sau reload
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      dispatch(setLogin({ user: newUser, accessToken, refreshToken }));
      localStorage.setItem("user", JSON.stringify(newUser));
      setUserData(newUser);
      setMessage("Upload avatar thành công!");
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Upload thất bại.");
    } finally {
      setLoading(false);
    }
  };

  if (!userData) return <p className="muted">Đang tải...</p>;

  const firstInitial = (userData.name || "?").charAt(0).toUpperCase();
  const avatarSrc = userData.avatar ? withBase(userData.avatar) : "";

  return (
    <>
      <h2>Thông tin cá nhân</h2>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt="Avatar"
            onError={(e) => (e.currentTarget.style.display = "none")}
            style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--accent)" }}
          />
        ) : (
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "var(--secondary)",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "2rem",
              color: "var(--muted)",
            }}
          >
            {firstInitial}
          </div>
        )}

        <p><strong>Tên:</strong> {userData.name}</p>
        <p><strong>Email:</strong> {userData.email}</p>
        {userData.role && <p><strong>Vai trò:</strong> {userData.role}</p>}
      </div>

      <hr style={{ margin: "16px 0", borderColor: "var(--secondary)" }} />

      <form onSubmit={handleUpdateName} className="form">
        <h3>Cập nhật tên</h3>
        <label>
          Tên mới
          <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} required />
        </label>
        <button className="btn" disabled={loading}>{loading ? "Đang lưu..." : "Lưu thay đổi"}</button>
      </form>

      <hr style={{ margin: "16px 0", borderColor: "var(--secondary)" }} />

      <div style={{ textAlign: "center" }}>
        <h3>Upload Avatar</h3>
        <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
        <div style={{ marginTop: 10 }}>
          <button className="btn" onClick={handleUpload} disabled={loading || !avatarFile}>
            {loading ? "Đang tải..." : "Tải ảnh lên"}
          </button>
        </div>
      </div>

      {message && <p style={{ marginTop: 12, textAlign: "center", color: "var(--accent)" }}>{message}</p>}

      {/* Nếu muốn chắc ăn, sau khi mọi thao tác, có thể làm nút tải lại profile */}
      {/* <button onClick={refreshProfile} className="btn btn-sm" style={{ marginTop: 12 }}>Tải lại profile</button> */}
    </>
  );
}

export default Profile;
