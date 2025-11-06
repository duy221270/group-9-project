import axios from "axios";

// Đảm bảo sử dụng biến môi trường Vercel: REACT_APP_API_URL
const API_ORIGIN = process.env.REACT_APP_API_URL || "http://localhost:5000";
const API_BASE = `${API_ORIGIN}/api`;

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Nếu Backend của bạn yêu cầu cookies/session
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
    // Nếu lỗi không phải 401 hoặc không có response, bỏ qua
    if (error.response?.status !== 401) {
        return Promise.reject(error);
    }
    
    // Xử lý logic Refresh Token
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        // Gọi API refresh token
        const res = await axios.post(`${API_BASE}/auth/refresh`, {
          refreshToken,
        });
        const newAccessToken = res.data.accessToken;
        
        if (newAccessToken) {
          // Lưu token mới
          localStorage.setItem("accessToken", newAccessToken);
          
          // Gắn lại header Authorization cho request lỗi
          error.config.headers.Authorization = `Bearer ${newAccessToken}`;
          
          // Gửi lại request ban đầu
          return api.request(error.config);
        }
      } catch (refreshErr) {
        console.warn("⚠️ Refresh token thất bại → logout");
        // Nếu refresh token thất bại, đăng xuất
        localStorage.clear();
        window.location.href = "/login";
      }
    } else {
      // Nếu không có refresh token, đăng xuất
      localStorage.clear();
      window.location.href = "/login";
    }
    
    return Promise.reject(error);
  }
);

export { API_ORIGIN, API_BASE };
export default api;
