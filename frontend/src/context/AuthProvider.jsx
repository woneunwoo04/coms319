import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api/api";

const AuthCtx = createContext();
export const useAuth = () => useContext(AuthCtx);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ 초기 로딩 상태 추가

  // ✅ 앱 시작 시 localStorage에서 유저 정보 복원
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    setLoading(false);
  }, []);

  // ✅ 로그인
  async function login(email, password) {
    try {
      const { token, user } = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      // 토큰 & 유저정보 저장
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);

      return user;
    } catch (err) {
      console.error("❌ Login failed:", err);
      throw new Error(err.message || "Login failed");
    }
  }

  // ✅ 회원가입 → 바로 로그인까지 자동 연결
  async function signup(name, email, password) {
    try {
      await api("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });

      return await login(email, password);
    } catch (err) {
      console.error("❌ Signup failed:", err);
      throw new Error(err.message || "Signup failed");
    }
  }

  // ✅ 로그아웃
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  async function updateProfile(updates = {}) {
    try {
      const payload = await authFetch("/auth/me", {
        method: "PUT",
        body: {
          name: updates.name,
          email: updates.email,
        },
      });
      localStorage.setItem("user", JSON.stringify(payload));
      setUser(payload);
      return payload;
    } catch (err) {
      console.error("❌ Profile update failed:", err);
      throw new Error(err.message || "Profile update failed");
    }
  }

  // ✅ 로그인된 상태에서 API 요청할 때 헤더에 토큰 자동 추가
  async function authFetch(path, options = {}) {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Unauthorized");

    const body = options.body;
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    };

    return await api(path, {
      ...options,
      headers,
      body: typeof body === "string" || body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    });
  }

  // ✅ Context 값
  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateProfile,
    authFetch,
    async changePassword(currentPassword, newPassword) {
      try {
        await authFetch("/auth/me/password", {
          method: "PUT",
          body: { currentPassword, newPassword },
        });
      } catch (err) {
        throw new Error(err.message || "Password update failed");
      }
    },
  };

  return (
    <AuthCtx.Provider value={value}>
      {/* 로딩 중일 때 children이 깜빡이지 않도록 처리 */}
      {!loading && children}
    </AuthCtx.Provider>
  );
}
