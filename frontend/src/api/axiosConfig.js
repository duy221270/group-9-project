import axios from "axios";

const API_ORIGIN = process.env.REACT_APP_API_ORIGIN || "http://localhost:5000";
const API_BASE = `${API_ORIGIN}/api`;

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
});

// 🟢 Gắn token cho mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🟢 Tự động refresh token khi token hết hạn
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE}/auth/refresh`, {
            refreshToken,
          });
          const newAccessToken = res.data.accessToken;
          if (newAccessToken) {
            // Lưu token mới
            localStorage.setItem("accessToken", newAccessToken);
            // Gắn lại header Authorization
            error.config.headers.Authorization = `Bearer ${newAccessToken}`;
            // Gửi lại request cũ
            return api.request(error.config);
          }
        } catch (refreshErr) {
          console.warn("⚠️ Refresh token thất bại → logout");
          localStorage.clear();
          window.location.href = "/login";
        }
      } else {
        localStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export { API_ORIGIN, API_BASE };
export default api;
