import React from "react";
import { Link } from "react-router-dom";

export default function AccessDenied() {
  return (
    <div
      style={{
        height: "80vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        backgroundColor: "#fdfaf7",
      }}
    >
      <h2 style={{ color: "#b22222", fontSize: "2rem", marginBottom: "10px" }}>
        🚫 Access Denied
      </h2>
      <p style={{ color: "#555", fontSize: "1.1rem" }}>
        You do not have permission to view this page.
      </p>
      <Link
        to="/"
        style={{
          marginTop: "20px",
          backgroundColor: "#3c2f2f",
          color: "white",
          padding: "10px 20px",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: "600",
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
        }}
      >
        Back to Home ☕
      </Link>
    </div>
  );
}
