import axios from "axios";

// ĐÃ SỬA: Sử dụng REACT_APP_API_URL để khớp với cấu hình Vercel.
// Giá trị fallback vẫn là localhost:5000 cho môi trường phát triển cục bộ.
const API_ORIGIN = process.env.REACT_APP_API_URL || "http://localhost:5000";
const API_BASE = `${API_ORIGIN}/api`; // Giả định Backend API bắt đầu bằng /api

const api = axios.create({
  baseURL: API_BASE,
  // Đặt withCredentials: true để cho phép gửi cookie/session (cần thiết cho auth)
  withCredentials: true, 
});

// THÊM CẤU HÌNH CHO INSTANCE AXIOS GỐC
// Cần thiết nếu logic refresh token gọi axios.post() thay vì api.post()
// const axiosBase = axios.create({ baseURL: API_BASE }); 


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
    const originalRequest = error.config;
    // Kiểm tra nếu lỗi là 401 và chưa thử refresh token lần nào
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        
        // Đánh dấu request này đã thử lại
        originalRequest._retry = true;
        
        const refreshToken = localStorage.getItem("refreshToken");
        
        if (refreshToken) {
          try {
            // Gọi API refresh token
            // SỬ DỤNG AXIOS GỐC HOẶC TẠO MỘT INSTANCE RIÊNG KHÔNG CÓ INTERCEPTOR ĐỂ TRÁNH VÒNG LẶP
            const res = await axios.post(`${API_BASE}/auth/refresh`, {
              refreshToken,
            });
            const newAccessToken = res.data.accessToken;

            if (newAccessToken) {
              // Lưu token mới
              localStorage.setItem("accessToken", newAccessToken);
              
              // Cập nhật header cho request gốc và retry
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              
              // Gửi lại request ban đầu
              return api.request(originalRequest);
            }
          } catch (refreshErr) {
            console.warn("⚠️ Refresh token thất bại → logout");
            // Nếu refresh token thất bại, đăng xuất
            localStorage.clear();
            window.location.href = "/login";
            return Promise.reject(refreshErr); // Ngăn lỗi lan truyền
          }
        }
    }

    // Nếu lỗi không phải 401 (hoặc 401 không thể xử lý), hoặc request đã được retry, hoặc token không tồn tại, chỉ cần trả về lỗi
    if (error.response?.status === 401 || !refreshToken) {
      localStorage.clear();
      window.location.href = "/login";
    }
    
    return Promise.reject(error);
  }
);

export { API_ORIGIN, API_BASE };
export default api;
