import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  function handleLogout() {
    logout();
    nav("/"); // 로그아웃 후 홈으로 이동
  }

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 24px",
        backgroundColor: "#3c2f2f", // 진한 브라운
        color: "white",
      }}
    >
      {/* ✅ 왼쪽 로고 + 메뉴 */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <Link
          to="/"
          style={{
            fontWeight: "bold",
            fontSize: "1.25rem",
            color: "white",
            textDecoration: "none",
          }}
        >
          Café Delight
        </Link>

        <Link to="/faq" style={linkStyle}>
          FAQ
        </Link>
        <Link to="/menu" style={linkStyle}>
          Menu
        </Link>
        <Link to="/order" style={linkStyle}>
          Order
        </Link>
        <Link to="/orders" style={linkStyle}>
          Order History
        </Link>
        <Link to="/ai-recommendation" style={linkStyle}>
          AI Barista
        </Link>
        <Link to="/authors" style={linkStyle}>
          Authors
        </Link>
        <Link to="/profile" style={linkStyle}>
          Profile
        </Link>
        <Link to="/reviews" style={linkStyle}>
          Reviews
        </Link>

        {/* ✅ 관리자만 보이는 Dashboard 메뉴 */}
        {user?.role === "admin" && (
          <Link to="/admin" style={{ ...linkStyle, color: "#ffd27f" }}>
            Admin Dashboard
          </Link>
        )}
      </div>

      {/* ✅ 오른쪽 로그인 / 로그아웃 영역 */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "0.95rem" }}>
              👋 Hi, <b>{user.name}</b>
            </span>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: "#d4b49c",
                color: "#3c2f2f",
                border: "none",
                padding: "6px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            style={{
              backgroundColor: "#d4b49c",
              color: "#3c2f2f",
              padding: "6px 14px",
              borderRadius: "6px",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

/* 🔸 공통 링크 스타일 */
const linkStyle = {
  color: "white",
  textDecoration: "none",
  fontSize: "0.95rem",
  fontWeight: "500",
  transition: "0.2s",
  padding: "4px 0",
};
