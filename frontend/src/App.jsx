import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import FAQ from "./pages/faq";
import LoginSignup from "./pages/LoginSignup";
import ProductDetail from "./pages/ProductDetail";
import AIRecommendation from "./pages/AIRecommendation"; 
import Reviews from "./pages/Reviews";
import Menu from "./pages/Menu";
import Order from "./pages/Order";
import Confirmation from "./pages/Confirmation";
import OrderHistory from "./pages/OrderHistory";
import AdminDashboard from "./pages/AdminDashboard"; // ✅ 관리자 페이지
import AdminRoute from "./pages/AdminRoutes"; // 만약 pages 폴더에 있다면 이렇게
import Profile from "./pages/Profile";
import Authors from "./pages/Authors";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <>
      <Navbar />

      <main style={{ padding: "20px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/login" element={<LoginSignup />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/order" element={<Order />} />
          <Route path="/confirm" element={<Confirmation />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/ai-recommendation" element={<AIRecommendation />} /> {/* ✅ 추가 */}
          <Route path="/authors" element={<Authors />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          {/* ✅ 관리자 전용 보호 라우트 */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route path="*" element={<h2>404 - Page Not Found</h2>} />
        </Routes>
      </main>
    </>
  );
}
