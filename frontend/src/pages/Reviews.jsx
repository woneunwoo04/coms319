import React, { useEffect, useState } from "react";

const pageStyle = {
  minHeight: "100vh",
  backgroundColor: "#fdfaf7",
  padding: "40px 20px",
  color: "#3c2f2f",
};

const cardsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "20px",
  maxWidth: "1000px",
  margin: "0 auto",
};

const cardStyle = {
  background: "#fff",
  borderRadius: "16px",
  border: "1px solid #e5d4c3",
  padding: "20px",
  boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
};

export default function Reviews() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("http://localhost:8080/api/reviews");
      setReviews(await res.json());
    }
    load();
  }, []);

  return (
    <div style={pageStyle}>
      <h1 style={{ textAlign: "center", fontSize: "2.5rem", marginBottom: "24px" }}>
        Customer Reviews ☕
      </h1>

      <div style={cardsGridStyle}>
        {reviews.map((r) => (
          <div key={r.id} style={cardStyle}>
            <h3 style={{ margin: "0 0 8px 0" }}>{r.product}</h3>
            <p style={{ color: "#d4a373", margin: "0 0 10px 0" }}>{r.rating} ⭐</p>
            <p style={{ marginBottom: "12px", color: "#555" }}>{r.comment}</p>
            <p style={{ fontSize: "0.9rem", color: "#7f8c8d" }}>
              {r.approved ? "✅ Approved" : "🕓 Pending"} · By {r.User?.name || "Anonymous"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
