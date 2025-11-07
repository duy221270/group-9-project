<<<<<<< HEAD
import React, { useState } from 'react';
import UserList from "./components/UserList";
import AddUser from "./components/AddUser";
import './App.css';
import './App.css';
import './App.css';

function App() {
  const [users, setUsers] = useState([]);

  const handleUserAdded = (newUser) => {
    setUsers([...users, newUser]);
  };

  return (
    <div className="App">
      <h1>Quản lý User</h1>
      <AddUser onUserAdded={handleUserAdded} />
      <UserList users={users} setUsers={setUsers} />
=======
import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  selectIsAuthenticated,
  selectUser,
  setLogout,
  setLogin,
} from "./store/authSlice";
import api from "./api/axiosConfig";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import AdminUserList from "./pages/AdminUserList";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminLogs from "./pages/AdminLogs"; // 🆕 Logs trang quản trị
import "./App.css";

// 🧩 Hàm parse JSON an toàn
const safeParse = (text) => {
  try {
    if (!text || typeof text !== "string") return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
};

// 🧩 Header hiển thị có điều kiện (ẩn ở login, register, forgot)
function ConditionalHeader() {
  const location = useLocation();
  const hideHeaderPaths = ["/login", "/register", "/forgot-password"];
  if (hideHeaderPaths.includes(location.pathname)) return null;
  return (
    <div className="header">
      <h1>🧩 Quản Lý Người Dùng</h1>
      <nav style={{ marginBottom: "20px" }}>
        <AuthNav />
      </nav>
>>>>>>> origin/feature/redux-protected
    </div>
  );
}

<<<<<<< HEAD
export default App;
=======
// 🧩 Thanh điều hướng logic
function AuthNav() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout", {
        refreshToken: localStorage.getItem("refreshToken"),
      });
    } catch (err) {
      console.warn("API logout lỗi:", err?.response?.data || err.message);
    } finally {
      dispatch(setLogout());
      navigate("/login");
    }
  };

  if (isAuthenticated) {
    return (
      <>
        <Link to="/" style={{ marginRight: 15, color: "var(--text)" }}>
          Profile
        </Link>
        {(currentUser?.role === "admin" || currentUser?.role === "moderator") && (
          <>
            <Link
              to="/admin/users"
              style={{ marginRight: 15, color: "orange" }}
            >
              Admin Users
            </Link>
            <Link
              to="/admin/logs"
              style={{ marginRight: 15, color: "#26a69a" }}
            >
              Logs
            </Link>
          </>
        )}
        <button
          onClick={handleLogout}
          className="btn btn-sm"
          style={{
            background: "var(--danger)",
            marginLeft: "8px",
            padding: "5px 10px",
          }}
        >
          Đăng xuất
        </button>
      </>
    );
  }

  // Nếu chưa đăng nhập
  return (
    <>
      <Link to="/login" style={{ marginRight: 15, color: "var(--text)" }}>
        Đăng nhập
      </Link>
      <Link to="/register" style={{ marginRight: 15, color: "var(--text)" }}>
        Đăng ký
      </Link>
      <Link to="/forgot-password" style={{ color: "var(--accent)" }}>
        Quên mật khẩu
      </Link>
    </>
  );
}

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectUser);

  // 🧩 Load user khi reload trang
  const loadUserFromLocal = () => {
    const savedUser = safeParse(localStorage.getItem("user"));
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    if (savedUser && accessToken) {
      dispatch(
        setLogin({
          user: savedUser,
          accessToken,
          refreshToken: refreshToken || null,
        })
      );
    }
  };

  useEffect(() => {
    loadUserFromLocal();
    window.addEventListener("storage", loadUserFromLocal);
    return () => window.removeEventListener("storage", loadUserFromLocal);
  }, [dispatch]);

  // 🔐 Route chỉ cho người đã đăng nhập
  const PrivateRoute = ({ children }) =>
    isAuthenticated ? children : <Navigate to="/login" replace />;

  // 🎯 Route chỉ cho admin/moderator
  const AdminRoute = ({ children }) => {
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (!currentUser) return <div className="card">Đang tải thông tin...</div>;
    return currentUser.role === "admin" || currentUser.role === "moderator"
      ? children
      : <Navigate to="/" replace />;
  };

  return (
    <Router>
      <div className="container">
        {/* 🧭 Header hiển thị có điều kiện */}
        <ConditionalHeader />

        {/* 🧭 Các routes */}
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/reset-password/:resetToken"
            element={<ResetPassword />}
          />

          {/* Private route (user) */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <div className="card">
                  <Profile />
                </div>
              </PrivateRoute>
            }
          />

          {/* Admin & Moderator */}
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <div className="card">
                  <AdminUserList currentUser={currentUser} />
                </div>
              </AdminRoute>
            }
          />

          <Route
            path="/admin/logs"
            element={
              <AdminRoute>
                <div className="card">
                  <AdminLogs />
                </div>
              </AdminRoute>
            }
          />

          {/* Fallback */}
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
>>>>>>> origin/feature/redux-protected
