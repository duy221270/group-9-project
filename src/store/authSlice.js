// src/store/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

// ✅ Hàm đọc JSON an toàn từ localStorage
const loadSafeJSON = (key) => {
  try {
    const value = localStorage.getItem(key);
    if (!value || value === "undefined" || value === "null") return null;
    return JSON.parse(value);
  } catch (err) {
    console.warn(`Lỗi parse localStorage[${key}]:`, err);
    return null;
  }
};

// ✅ Load dữ liệu đã lưu
const user = loadSafeJSON("user");
const accessToken = localStorage.getItem("accessToken") || null;
const refreshToken = localStorage.getItem("refreshToken") || null;

// ✅ Trạng thái khởi tạo
const initialState = {
  user,
  accessToken,
  refreshToken,
  isAuthenticated: !!accessToken,
};

// ✅ Slice quản lý Auth
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Khi đăng nhập thành công
    setLogin: (state, action) => {
      const { user, accessToken, refreshToken } = action.payload || {};
      if (user && accessToken) {
        state.user = user;
        state.accessToken = accessToken;
        state.refreshToken = refreshToken;
        state.isAuthenticated = true;

        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
      }
    },

    // Khi đăng xuất
    setLogout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      localStorage.clear();
    },

    // Khi cập nhật user (tên, avatar, ...)
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem("user", JSON.stringify(state.user));
    },
  },
});

export const { setLogin, setLogout, updateUser } = authSlice.actions;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

export default authSlice.reducer;
