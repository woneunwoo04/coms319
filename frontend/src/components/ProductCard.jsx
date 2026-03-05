import React from "react";
import { useNavigate } from "react-router-dom";

export default function ProductCard({ item }) {
  const navigate = useNavigate();

  const handleClick = () => {
    const target = item.link || "/menu";
    navigate(target);
  };

  return (
    <div
      className="card h-100"
      style={{ cursor: "pointer", width: "100%" }}
      onClick={handleClick}
    >
      <img
        src={item.image}
        className="card-img-top"
        alt={item.name}
        style={{ height: "200px", objectFit: "cover" }}
      />
      <div className="card-body">
        <h5 className="card-title">{item.name}</h5>
        <p className="card-text">{item.description}</p>
        <strong>${item.price.toFixed(2)}</strong>
        {item.linkText && (
          <p style={{ marginTop: "12px", fontWeight: "600", color: "#a0522d" }}>
            {item.linkText}
          </p>
        )}
      </div>
    </div>
  );
}
