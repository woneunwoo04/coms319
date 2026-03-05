import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Confirmation() {
  const { state } = useLocation();
  const nav = useNavigate();

  if (!state) {
    return (
      <div style={fallbackContainer}>
        <h2 style={{ color: '#3c2f2f' }}>Hmm, no order found.</h2>
        <button style={primaryButtonStyle} onClick={() => nav('/menu')}>
          Back to Menu
        </button>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={iconCircle}>
          <span role="img" aria-label="coffee">
            ☕
          </span>
        </div>
        <h1 style={titleStyle}>Order Brewing!</h1>
        <p style={subtitleStyle}>Thanks for choosing Café Delight. Your drinks are being prepared with care.</p>

        <div style={detailsCard}>
          <div style={detailRow}>
            <span>Order ID</span>
            <strong>#{state.orderId}</strong>
          </div>
          <div style={detailRow}>
            <span>Total Paid</span>
            <strong>${state.total.toFixed(2)}</strong>
          </div>
          <div style={detailRow}>
            <span>Status</span>
            <strong style={{ color: '#2e7d32' }}>Preparing</strong>
          </div>
        </div>

        <div style={buttonRow}>
          <button style={primaryButtonStyle} onClick={() => nav('/orders')}>
            View Order History
          </button>
          <button style={secondaryButtonStyle} onClick={() => nav('/menu')}>
            Keep Browsing
          </button>
        </div>
      </div>
    </div>
  );
}

const containerStyle = {
  minHeight: '100vh',
  background: '#fdfaf7',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 20px',
};

const fallbackContainer = {
  ...containerStyle,
  flexDirection: 'column',
  gap: 16,
};

const cardStyle = {
  maxWidth: 520,
  background: '#fff',
  borderRadius: 20,
  border: '1px solid #f1dfcd',
  padding: 32,
  textAlign: 'center',
  boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
};

const iconCircle = {
  width: 72,
  height: 72,
  borderRadius: '50%',
  background: '#f7e1c3',
  margin: '0 auto 16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 32,
};

const titleStyle = {
  fontSize: '2rem',
  color: '#3c2f2f',
  marginBottom: 8,
};

const subtitleStyle = {
  color: '#6b4d32',
  marginBottom: 24,
};

const detailsCard = {
  background: '#fffdf9',
  borderRadius: 16,
  padding: 20,
  border: '1px solid #f1dfcd',
  marginBottom: 24,
};

const detailRow = {
  display: 'flex',
  justifyContent: 'space-between',
  color: '#3c2f2f',
  marginBottom: 10,
};

const buttonRow = {
  display: 'flex',
  gap: 12,
  flexDirection: 'column',
};

const primaryButtonStyle = {
  backgroundColor: '#3c2f2f',
  color: '#fff',
  border: 'none',
  padding: '12px 18px',
  borderRadius: 10,
  fontWeight: 600,
  cursor: 'pointer',
};

const secondaryButtonStyle = {
  backgroundColor: '#f7ede3',
  color: '#6b4d32',
  border: '1px solid #f1dfcd',
  padding: '12px 18px',
  borderRadius: 10,
  fontWeight: 600,
  cursor: 'pointer',
};
