import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/api';

export default function Order() {
  const { items, update, remove, total, clear } = useCart();
  const nav = useNavigate();

  const handleQuantityChange = (productId, value) => {
    const qty = Math.max(1, Number(value) || 1);
    update(productId, qty);
  };

  async function placeOrder() {
    try {
      const payload = {
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
      };
      const res = await api('/orders', { method: 'POST', body: JSON.stringify(payload) });
      clear();
      nav('/confirm', { state: { orderId: res.orderId, total: res.total } });
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>🛒 Review & Confirm</h1>
      <p style={subtitleStyle}>Take one last look at your treats before sending the order to the barista.</p>

      {items.length === 0 ? (
        <div style={emptyStateStyle}>
          <p style={{ marginBottom: 12 }}>Your cart is empty. Let’s add something delicious!</p>
          <button style={primaryButtonStyle} onClick={() => nav('/menu')}>
            Browse Menu
          </button>
        </div>
      ) : (
        <div style={layoutStyle}>
          <section style={itemsCardStyle}>
            <h2 style={sectionTitleStyle}>Items in Cart</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {items.map((it) => {
                const image = it.product.image || it.product.image_url;
                return (
                  <div key={it.product.id} style={itemCardStyle}>
                    {image && (
                      <img
                        src={image}
                        alt={it.product.name}
                        style={{ width: 90, height: 90, borderRadius: 12, objectFit: 'cover' }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={itemNameStyle}>{it.product.name}</h3>
                        <button style={removeButtonStyle} onClick={() => remove(it.product.id)}>
                          Remove
                        </button>
                      </div>
                      <p style={itemPriceStyle}>${it.product.price.toFixed(2)} each</p>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <label style={{ fontSize: 14, color: '#6b4d32' }}>Qty</label>
                        <input
                          type="number"
                          min="1"
                          value={it.quantity}
                          onChange={(e) => handleQuantityChange(it.product.id, e.target.value)}
                          style={quantityInputStyle}
                        />
                        <span style={{ marginLeft: 'auto', fontWeight: 600 }}>
                          ${(it.product.price * it.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section style={summaryCardStyle}>
            <h2 style={sectionTitleStyle}>Order Summary</h2>
            <div style={summaryRowStyle}>
              <span>Items</span>
              <span>{items.length}</span>
            </div>
            <div style={summaryRowStyle}>
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div style={summaryRowStyle}>
              <span>Service</span>
              <span>Complimentary</span>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid #f1dfcd', margin: '16px 0' }} />
            <div style={{ ...summaryRowStyle, fontWeight: 700, fontSize: 18 }}>
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <button style={{ ...primaryButtonStyle, width: '100%', marginTop: 20 }} onClick={placeOrder}>
              Place Order
            </button>
            <button style={secondaryButtonStyle} onClick={() => nav('/menu')}>
              Continue Shopping
            </button>
          </section>
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

const layoutStyle = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)',
  gap: 24,
};

const itemsCardStyle = {
  background: '#fff',
  padding: 24,
  borderRadius: 16,
  border: '1px solid #f1dfcd',
  boxShadow: '0 8px 20px rgba(60, 47, 47, 0.08)',
};

const summaryCardStyle = {
  background: '#fff',
  padding: 24,
  borderRadius: 16,
  border: '1px solid #f1dfcd',
  boxShadow: '0 8px 20px rgba(60, 47, 47, 0.08)',
  alignSelf: 'flex-start',
};

const sectionTitleStyle = {
  marginBottom: 16,
  color: '#3c2f2f',
};

const itemCardStyle = {
  display: 'flex',
  gap: 16,
  padding: 16,
  border: '1px solid #f1dfcd',
  borderRadius: 14,
  background: '#fffdf9',
};

const itemNameStyle = {
  margin: 0,
  fontSize: '1.1rem',
  color: '#3c2f2f',
};

const itemPriceStyle = {
  margin: '4px 0 12px 0',
  color: '#a07b57',
};

const quantityInputStyle = {
  width: 70,
  borderRadius: 8,
  border: '1px solid #d3b9a4',
  padding: '4px 8px',
};

const removeButtonStyle = {
  border: 'none',
  background: 'transparent',
  color: '#d9534f',
  fontSize: 14,
  cursor: 'pointer',
};

const summaryRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  color: '#3c2f2f',
  marginBottom: 8,
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
  marginTop: 10,
  width: '100%',
  backgroundColor: '#f7ede3',
  color: '#6b4d32',
  border: '1px solid #f1dfcd',
  padding: '10px 18px',
  borderRadius: 10,
  fontWeight: 600,
  cursor: 'pointer',
};

const emptyStateStyle = {
  background: '#fff',
  padding: 32,
  borderRadius: 16,
  border: '1px solid #f1dfcd',
  maxWidth: 480,
  textAlign: 'center',
  boxShadow: '0 10px 24px rgba(0,0,0,0.07)',
  color: '#3c2f2f',
  margin: '0 auto',
};
