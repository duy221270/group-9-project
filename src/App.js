import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  Link,
  useNavigate,
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
import "./App.css";

// --- helper parse JSON an toàn
const safeParse = (text) => {
  try {
    if (!text || typeof text !== "string") return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
};

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectUser);

  // Bootstrap Redux state từ localStorage (an toàn)
  useEffect(() => {
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
  }, [dispatch]);

  // 🔹 Nút Đăng xuất
  const LogoutButton = () => {
    const navigate = useNavigate();
    const handleLogout = async () => {
      try {
        await api.post("/auth/logout", {
          refreshToken: localStorage.getItem("refreshToken"),
        });
      } catch (err) {
        console.warn(
          "API logout báo lỗi (bỏ qua):",
          err?.response?.data || err.message
        );
      } finally {
        dispatch(setLogout());
        navigate("/login");
      }
    };
    return (
      <button
        onClick={handleLogout}
        className="btn btn-sm"
        style={{ background: "var(--danger)" }}
      >
        Đăng xuất
      </button>
    );
  };

  // 🔐 Route bảo vệ
  const PrivateRoute = ({ children }) =>
    isAuthenticated ? children : <Navigate to="/login" replace />;

  // 🎯 AdminRoute cho cả admin và moderator
  const AdminRoute = ({ children }) => {
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (!currentUser) return <div className="card">Đang tải thông tin...</div>;
    return currentUser.role === "admin" || currentUser.role === "moderator" ? (
      children
    ) : (
      <Navigate to="/" replace />
    );
  };

  return (
    <Router>
      <div className="container">
        {/* HEADER */}
        <div className="header">
          <h1>Quản Lý User</h1>
          <nav style={{ marginBottom: "20px" }}>
            {isAuthenticated ? (
              <>
                <Link
                  to="/"
                  style={{ marginRight: "15px", color: "var(--text)" }}
                >
                  Profile
                </Link>
                {(currentUser?.role === "admin" ||
                  currentUser?.role === "moderator") && (
                  <Link
                    to="/admin/users"
                    style={{ marginRight: "15px", color: "orange" }}
                  >
                    Admin Users
                  </Link>
                )}
                <LogoutButton />
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  style={{ marginRight: "15px", color: "var(--text)" }}
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  style={{ marginRight: "15px", color: "var(--text)" }}
                >
                  Đăng ký
                </Link>
                <Link to="/forgot-password" style={{ color: "var(--accent)" }}>
                  Quên mật khẩu
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* ROUTES */}
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/reset-password/:resetToken"
            element={<ResetPassword />}
          />

          {/* Private */}
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

          {/* Fallback */}
          <Route
            path="*"
            element={
              <Navigate to={isAuthenticated ? "/" : "/login"} replace />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
