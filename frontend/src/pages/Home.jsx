import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch("/featured-items.json")
      .then((res) => res.json())
      .then((data) => setItems(data.featuredItems || []))
      .catch((err) => console.error("Error loading featured items:", err));
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "20px" }}>
        Featured Menu
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "24px",
          justifyContent: "center",
          alignItems: "stretch",
        }}
      >
        {items.map((item) => (
          <ProductCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
