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
import AdminLogs from "./pages/AdminLogs"; // 🆕 thêm dòng này
import "./App.css";

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

  const loadUserFromLocal = () => {
    const savedUser = safeParse(localStorage.getItem("user"));
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    if (savedUser && accessToken) {
      dispatch(setLogin({ user: savedUser, accessToken, refreshToken: refreshToken || null }));
    }
  };

  useEffect(() => {
    loadUserFromLocal();
    window.addEventListener("storage", loadUserFromLocal);
    return () => window.removeEventListener("storage", loadUserFromLocal);
  }, [dispatch]);

  const LogoutButton = () => {
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

  const PrivateRoute = ({ children }) =>
    isAuthenticated ? children : <Navigate to="/login" replace />;

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
        <div className="header">
          <h1>Quản Lý User</h1>
          <nav style={{ marginBottom: "20px" }}>
            {isAuthenticated ? (
              <>
                <Link to="/" style={{ marginRight: "15px", color: "var(--text)" }}>
                  Profile
                </Link>
                {(currentUser?.role === "admin" || currentUser?.role === "moderator") && (
                  <>
                    <Link to="/admin/users" style={{ marginRight: "15px", color: "orange" }}>
                      Admin Users
                    </Link>
                    {/* 🆕 thêm link đến trang log */}
                    <Link to="/admin/logs" style={{ marginRight: "15px", color: "#26a69a" }}>
                      Logs
                    </Link>
                  </>
                )}
                <LogoutButton />
              </>
            ) : (
              <>
                <Link to="/login" style={{ marginRight: "15px", color: "var(--text)" }}>
                  Đăng nhập
                </Link>
                <Link to="/register" style={{ marginRight: "15px", color: "var(--text)" }}>
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
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:resetToken" element={<ResetPassword />} />

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

          {/* 🆕 Route Logs cho admin */}
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
            path="*"
            element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
