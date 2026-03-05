import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/api';
import { useAuth } from '../context/AuthProvider';

export default function OrderHistory() {
  const { user, authFetch } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewModal, setReviewModal] = useState({ open: false, item: null, orderId: null });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewMessage, setReviewMessage] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return;
      setLoading(true);
      setError('');
      try {
        const data = await api('/orders/mine');
        setOrders(data);
      } catch (err) {
        setError(err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [user, authFetch]);

  if (!user) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <p>You need to be logged in to view your order history.</p>
          <button style={primaryButtonStyle} onClick={() => nav('/login')}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>🧾 Order History</h1>
      <p style={subtitleStyle}>Track your past orders and revisit your favorites.</p>

      {loading ? (
        <div style={cardStyle}>
          <p>Loading orders...</p>
        </div>
      ) : error ? (
        <div style={{ ...cardStyle, color: '#d9534f' }}>
          <p>{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div style={cardStyle}>
          <p>No orders yet. Start by exploring the menu!</p>
          <button style={primaryButtonStyle} onClick={() => nav('/menu')}>
            Go to Menu
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {orders.map((order) => (
            <div key={order.id} style={orderCardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ margin: '0 0 6px 0' }}>Order #{order.id}</h2>
                  <p style={mutedTextStyle}>
                    {new Date(order.createdAt || order.updatedAt).toLocaleString()}
                  </p>
                </div>
                <span style={statusBadgeStyle(order.status)}>{order.status}</span>
              </div>
              <hr style={dividerStyle} />
              <div style={summaryRowStyle}>
                <span>Total Paid</span>
                <strong>${Number(order.total).toFixed(2)}</strong>
              </div>
              {order.notification && (
                <p style={{ color: '#2e7d32', fontStyle: 'italic', marginTop: 8 }}>
                  {order.notification}
                </p>
              )}
              {Array.isArray(order.OrderItems) && order.OrderItems.length > 0 && (
                <div style={itemsListStyle}>
                  <p style={{ margin: '0 0 8px 0', color: '#6b4d32', fontWeight: 600 }}>Items</p>
                  <ul style={{ paddingLeft: 16, margin: 0, color: '#3c2f2f', listStyle: 'none' }}>
                    {order.OrderItems.map((item) => (
                      <li key={item.id} style={{ marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>
                            {item.Product?.name || 'Product'} × {item.quantity} — $
                            {(item.priceAtPurchase * item.quantity).toFixed(2)}
                          </span>
                          {['approved', 'completed'].includes(order.status) ? (
                            <button
                              style={reviewButtonStyle}
                              onClick={() =>
                                setReviewModal({
                                  open: true,
                                  item,
                                  orderId: order.id,
                                })
                              }
                            >
                              Review
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.85rem', color: '#a05b2d' }}>
                              Reviews available after approval
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {reviewModal.open && reviewModal.item && (
        <div style={modalOverlayStyle} onClick={() => setReviewModal({ open: false, item: null, orderId: null })}>
          <div
            style={modalContentStyle}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <h3 style={{ marginBottom: 12 }}>
              Review {reviewModal.item.Product?.name || 'Product'}
            </h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!user) return;
                setSubmittingReview(true);
                setReviewMessage('');
                try {
                  await authFetch('/reviews', {
                    method: 'POST',
                    body: {
                      productId: reviewModal.item.productId,
                      product: reviewModal.item.Product?.name,
                      rating: reviewForm.rating,
                      comment: reviewForm.comment,
                    },
                  });
                  setReviewMessage('Review submitted for approval.');
                  setReviewForm({ rating: 5, comment: '' });
                } catch (err) {
                  setReviewMessage(err.message);
                } finally {
                  setSubmittingReview(false);
                }
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              <label style={labelStyle}>
                Rating
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                  style={inputStyle}
                  required
                />
              </label>
              <label style={labelStyle}>
                Comment
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  style={{ ...inputStyle, minHeight: 80 }}
                  required
                />
              </label>
              {reviewMessage && (
                <p style={{ color: reviewMessage.includes('submitted') ? '#2e7d32' : '#d9534f', margin: 0 }}>
                  {reviewMessage}
                </p>
              )}
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" style={primaryButtonStyle} disabled={submittingReview}>
                  {submittingReview ? 'Submitting...' : 'Submit'}
                </button>
                <button
                  type="button"
                  style={{ ...primaryButtonStyle, backgroundColor: '#6c757d' }}
                  onClick={() => setReviewModal({ open: false, item: null, orderId: null })}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const containerStyle = {
  minHeight: '100vh',
  background: '#fdfaf7',
  padding: '40px 20px',
};

const titleStyle = {
  fontSize: '2.25rem',
  color: '#3c2f2f',
  marginBottom: 8,
};

const subtitleStyle = {
  color: '#6b4d32',
  marginBottom: 32,
};

const cardStyle = {
  background: '#fff',
  borderRadius: 16,
  border: '1px solid #f1dfcd',
  padding: 24,
  textAlign: 'center',
  boxShadow: '0 8px 20px rgba(60, 47, 47, 0.08)',
  maxWidth: 520,
  margin: '0 auto',
};

const orderCardStyle = {
  background: '#fff',
  borderRadius: 16,
  border: '1px solid #f1dfcd',
  padding: 20,
  boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
};

const mutedTextStyle = {
  color: '#a07b57',
  margin: 0,
};

const dividerStyle = {
  border: 'none',
  borderTop: '1px solid #f1dfcd',
  margin: '12px 0',
};

const summaryRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  color: '#3c2f2f',
};

const statusBadgeStyle = (status) => ({
  textTransform: 'capitalize',
  padding: '6px 12px',
  borderRadius: 999,
  background:
    status === 'paid'
      ? 'rgba(76, 175, 80, 0.15)'
      : status === 'pending'
      ? 'rgba(255, 193, 7, 0.2)'
      : 'rgba(108, 117, 125, 0.2)',
  color:
    status === 'paid'
      ? '#2e7d32'
      : status === 'pending'
      ? '#b28704'
      : '#6c757d',
  fontWeight: 600,
});

const primaryButtonStyle = {
  marginTop: 16,
  backgroundColor: '#3c2f2f',
  color: '#fff',
  border: 'none',
  padding: '10px 16px',
  borderRadius: 10,
  cursor: 'pointer',
  fontWeight: 600,
};

const itemsListStyle = {
  marginTop: 12,
  padding: 12,
  background: '#fffdf9',
  borderRadius: 12,
  border: '1px solid #f1dfcd',
};

const labelStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  color: '#6b4d32',
  fontSize: '0.9rem',
};

const inputStyle = {
  borderRadius: 8,
  border: '1px solid #e1cdb7',
  padding: '8px 10px',
  fontSize: '0.95rem',
};

const secondaryButtonStyle = {
  backgroundColor: '#f7ede3',
  color: '#6b4d32',
  border: '1px solid #f1dfcd',
  padding: '10px 16px',
  borderRadius: 10,
  fontWeight: 600,
  cursor: 'pointer',
};

const reviewButtonStyle = {
  backgroundColor: '#3c2f2f',
  color: '#fff',
  border: 'none',
  padding: '4px 10px',
  borderRadius: 6,
  fontSize: '0.85rem',
  cursor: 'pointer',
};

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalContentStyle = {
  background: '#fff',
  padding: 24,
  borderRadius: 16,
  width: '90%',
  maxWidth: 420,
  boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
};
