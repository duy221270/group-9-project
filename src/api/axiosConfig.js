// src/api/axiosConfig.js
import axios from "axios";

const API_ORIGIN = process.env.REACT_APP_API_ORIGIN || "http://localhost:5000";
const API_BASE = `${API_ORIGIN}/api`;

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
});

// Gắn token vào mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { API_ORIGIN, API_BASE };
export default api;
