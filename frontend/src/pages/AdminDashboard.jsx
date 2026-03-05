import React, { useEffect, useState } from "react";
import { api } from "../api/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const [statsRes, pendingRes, ordersRes] = await Promise.all([
        api("/admin/stats"),
        api("/admin/reviews/pending"),
        api("/admin/orders"),
      ]);
      setStats(statsRes);
      setPending(pendingRes);
      setOrders(ordersRes);
    } catch (err) {
      console.error("❌ Load failed:", err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function approve(id) {
    await api(`/admin/reviews/${id}/approve`, { method: "PUT" });
    load();
  }

  async function removeReview(id) {
    await api(`/admin/reviews/${id}`, { method: "DELETE" });
    load();
  }

  async function updateOrderStatus(id, action) {
    try {
      setUpdatingOrderId(id);
      let body = undefined;
      if (action === "decline") {
        const reason = window.prompt(
          "Enter decline reason",
          "We are currently busy. Please try again later."
        );
        body = JSON.stringify({ reason: reason || undefined });
      }
      await api(`/admin/orders/${id}/${action}`, {
        method: "PUT",
        body,
      });
      await load();
    } catch (err) {
      alert(err.message || "Failed to update order");
    } finally {
      setUpdatingOrderId(null);
    }
  }

  return (
    <div
      style={{
        padding: "32px",
        backgroundColor: "#fdfaf7",
        minHeight: "100vh",
        color: "#3c2f2f",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "16px" }}>☕ Admin Dashboard</h1>

      {/* Summary Stats */}
      {stats ? (
        <div
          style={{
            display: "flex",
            gap: "20px",
            marginBottom: "30px",
            flexWrap: "wrap",
          }}
        >
          {Object.entries(stats).map(([key, val]) => (
            <div
              key={key}
              style={{
                backgroundColor: "#fff",
                border: "1px solid #e5d4c3",
                borderRadius: "10px",
                padding: "16px 20px",
                minWidth: "180px",
                textAlign: "center",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ fontSize: "1rem", textTransform: "capitalize" }}>
                {key}
              </h3>
              <p style={{ fontWeight: "bold", fontSize: "1.2rem" }}>{val}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>Loading stats...</p>
      )}

      {/* Pending Reviews */}
      <section
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "12px",
          border: "1px solid #e5d4c3",
        }}
      >
        <h2 style={{ marginBottom: "16px" }}>Pending Reviews</h2>
        {pending.length === 0 ? (
          <p>No pending reviews.</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.95rem",
            }}
          >
            <thead>
              <tr style={{ background: "#f0e5da" }}>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Product</th>
                <th style={thStyle}>User</th>
                <th style={thStyle}>Rating</th>
                <th style={thStyle}>Comment</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={tdStyle}>#{r.id}</td>
                  <td style={tdStyle}>{r.Product?.name || "—"}</td>
                  <td style={tdStyle}>{r.User?.name || "—"}</td>
                  <td style={tdStyle}>{r.rating}</td>
                  <td style={tdStyle}>{r.comment}</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <button
                      onClick={() => approve(r.id)}
                      style={{
                        ...btnStyle,
                        backgroundColor: "#4caf50",
                        marginRight: "6px",
                      }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => removeReview(r.id)}
                      style={{
                        ...btnStyle,
                        backgroundColor: "#d9534f",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Orders Management */}
      <section
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "12px",
          border: "1px solid #e5d4c3",
          marginTop: "30px",
        }}
      >
        <h2 style={{ marginBottom: "16px" }}>Orders</h2>
        {orders.length === 0 ? (
          <p>No orders yet.</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.95rem",
            }}
          >
            <thead>
              <tr style={{ background: "#f0e5da" }}>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Customer</th>
                <th style={thStyle}>Total</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Items</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={tdStyle}>#{order.id}</td>
                  <td style={tdStyle}>{order.User?.name || "—"}</td>
                  <td style={tdStyle}>${Number(order.total).toFixed(2)}</td>
                  <td style={tdStyle}>{order.status}</td>
                  <td style={tdStyle}>
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      {order.OrderItems?.map((item) => (
                        <li key={item.id}>
                          {item.Product?.name || "Product"} × {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <button
                      style={{
                        ...btnStyle,
                        backgroundColor: "#4caf50",
                        marginRight: 6,
                        ...(!(order.status === "pending" || order.status === "paid") || updatingOrderId === order.id
                          ? disabledBtnStyle
                          : {}),
                      }}
                      disabled={!(order.status === "pending" || order.status === "paid") || updatingOrderId === order.id}
                      onClick={() => updateOrderStatus(order.id, "approve")}
                    >
                      Approve
                    </button>
                    <button
                      style={{
                        ...btnStyle,
                        backgroundColor: "#e67e22",
                        marginRight: 6,
                        ...(!(order.status === "pending" || order.status === "paid") || updatingOrderId === order.id
                          ? disabledBtnStyle
                          : {}),
                      }}
                      disabled={!(order.status === "pending" || order.status === "paid") || updatingOrderId === order.id}
                      onClick={() => updateOrderStatus(order.id, "decline")}
                    >
                      Decline
                    </button>
                    <button
                      style={{
                        ...btnStyle,
                        backgroundColor: "#2980b9",
                        ...(order.status !== "approved" || updatingOrderId === order.id
                          ? disabledBtnStyle
                          : {}),
                      }}
                      disabled={order.status !== "approved" || updatingOrderId === order.id}
                      onClick={() => updateOrderStatus(order.id, "complete")}
                    >
                      Complete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "8px",
  color: "#3c2f2f",
  fontWeight: "600",
};

const tdStyle = {
  padding: "8px",
  color: "#3c2f2f",
};

const btnStyle = {
  border: "none",
  color: "white",
  padding: "6px 10px",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "500",
};

const disabledBtnStyle = {
  backgroundColor: "#bdc3c7",
  cursor: "not-allowed",
};
