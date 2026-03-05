import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import AccessDenied from "../pages/AccessDenied"; // ✅ 추가

export default function AdminRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <AccessDenied />; // ✅ 깔끔하게 분리됨
  }

  return children;
}
