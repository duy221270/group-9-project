import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, setLogin } from "../store/authSlice";
import api, { API_ORIGIN } from "../api/axiosConfig";
import AvatarEditor from "react-avatar-editor";

/** Ghép base URL khi backend trả về đường dẫn tương đối */
const withBase = (url) =>
  url?.startsWith("http") ? url : url ? `${API_ORIGIN}${url}` : "";

/** Modal đơn giản */
function Modal({ open, onClose, children, title }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ width: 520, maxWidth: "95%", padding: 16 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button className="btn btn-sm" onClick={onClose} style={{ background: "var(--secondary)" }}>
            Đóng
          </button>
        </div>
        <div style={{ marginTop: 12 }}>{children}</div>
      </div>
    </div>
  );
}

export default function Profile() {
  const dispatch = useDispatch();
  const storeUser = useSelector(selectUser);

  const [user, setUser] = useState(storeUser);
  const [name, setName] = useState(storeUser?.name || "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ====== Upload & Crop ======
  const [file, setFile] = useState(null);       // file gốc
  const [cropOpen, setCropOpen] = useState(false);
  const [scale, setScale] = useState(1.2);
  const [rotate, setRotate] = useState(0);
  const editorRef = useRef(null);

  useEffect(() => {
    setUser(storeUser);
    setName(storeUser?.name || "");
  }, [storeUser]);

  const avatarSrc = useMemo(() => {
    return withBase(user?.avatar) || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  }, [user]);

  const roleNote = {
    admin: "🌟 Bạn là Admin — toàn quyền quản lý người dùng.",
    moderator: "🔧 Bạn là Moderator — có quyền xem danh sách user.",
    user: "👤 Bạn là User — chỉ có thể chỉnh sửa thông tin cá nhân.",
  };

  // ====== Update tên ======
  const handleUpdateName = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await api.put("/users/profile", { name });
      const newUser = { ...user, name: res.data?.name || name };
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      dispatch(setLogin({ user: newUser, accessToken, refreshToken }));
      localStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);
      setMessage("✅ Cập nhật tên thành công!");
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Cập nhật thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // ====== Chọn file và mở modal crop ======
  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    // Giới hạn dung lượng nhẹ nhàng (ví dụ 5MB)
    if (f.size > 5 * 1024 * 1024) {
      setMessage("⚠️ Ảnh quá lớn (tối đa 5MB).");
      return;
    }
    setFile(f);
    setScale(1.2);
    setRotate(0);
    setCropOpen(true);
  };

  // ====== Upload sau khi crop ======
  const uploadCropped = async () => {
    if (!editorRef.current) return;
    setLoading(true);
    setMessage("");
    try {
      // Lấy blob từ canvas (ảnh đã crop + resize)
      const canvas = editorRef.current.getImageScaledToCanvas();
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));

      const form = new FormData();
      form.append("avatar", blob, "avatar.jpg");

      // Giữ nguyên API cũ: /users/upload-avatar (SV1/SV3 sẽ gửi Cloudinary URL về avatarUrl)
      const res = await api.post("/users/upload-avatar", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newUser = { ...user, avatar: res.data?.avatarUrl || user?.avatar };
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      // Cập nhật Redux + localStorage để avatar luôn còn sau F5/Logout/Login
      dispatch(setLogin({ user: newUser, accessToken, refreshToken }));
      localStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);

      setMessage("✅ Upload avatar thành công!");
      setCropOpen(false);
      setFile(null);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "❌ Upload thất bại!");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p>Đang tải...</p>;

  return (
    <>
      {/* ===== Thông tin cá nhân ===== */}
      <h2>Thông tin cá nhân</h2>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <img
          src={avatarSrc}
          alt="Avatar"
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            objectFit: "cover",
            border: "2px solid var(--accent)",
          }}
        />
        <p><strong>Tên:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        {user.role && <p><strong>Vai trò:</strong> {user.role}</p>}
        <p style={{ color: "#fdd835" }}>{roleNote[user.role] || ""}</p>
      </div>

      <hr style={{ margin: "16px 0", borderColor: "var(--secondary)" }} />

      {/* ===== Cập nhật tên (giữ lại như ảnh #1) ===== */}
      <form onSubmit={handleUpdateName} className="form">
        <h3>Cập nhật tên</h3>
        <label>
          Tên mới
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <button className="btn" disabled={loading}>
          {loading ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </form>

      <hr style={{ margin: "16px 0", borderColor: "var(--secondary)" }} />

      {/* ===== Upload Avatar + Modal crop ===== */}
      <div style={{ textAlign: "center" }}>
        <h3>Upload Avatar</h3>
        <input type="file" accept="image/*" onChange={onPickFile} />
      </div>

      {!!message && (
        <p style={{ marginTop: 12, textAlign: "center", color: "var(--accent)" }}>{message}</p>
      )}

      {/* Modal Crop */}
      <Modal open={cropOpen} onClose={() => setCropOpen(false)} title="Cắt ảnh avatar">
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexDirection: "column" }}>
          <div
            style={{
              width: 320,
              height: 320,
              background: "#0d1117",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* react-avatar-editor là MỘT component, không phải array nên sẽ không gây lỗi “objects are not valid as a React child” */}
            <AvatarEditor
              ref={editorRef}
              image={file}
              width={260}
              height={260}
              border={20}
              borderRadius={260 / 2}
              color={[13, 17, 23, 0.6]} // overlay
              scale={scale}
              rotate={rotate}
            />
          </div>

          <div style={{ width: "100%" }}>
            <label>Zoom: {scale.toFixed(2)}</label>
            <input
              type="range"
              min="1"
              max="3"
              step="0.01"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>

          <div style={{ width: "100%" }}>
            <label>Xoay: {rotate}°</label>
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={rotate}
              onChange={(e) => setRotate(parseInt(e.target.value || "0", 10))}
              style={{ width: "100%" }}
            />
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", width: "100%" }}>
            <button className="btn btn-sm" onClick={() => setCropOpen(false)}>
              Hủy
            </button>
            <button className="btn" onClick={uploadCropped} disabled={loading}>
              {loading ? "Đang tải..." : "Lưu & Tải lên"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
