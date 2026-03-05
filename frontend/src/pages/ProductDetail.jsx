import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthProvider';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [size, setSize] = useState('M');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [canReview, setCanReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');
  const { add } = useCart();
  const { user, authFetch } = useAuth();

  useEffect(() => {
    api(`/products/${id}`).then(setProduct);
  }, [id]);

  useEffect(() => {
    async function checkPurchase() {
      if (!user || !product) {
        setCanReview(false);
        return;
      }
      try {
        const res = await authFetch(`/orders/has-item/${product.id}`);
        setCanReview(res.purchased);
      } catch (err) {
        console.error('❌ Purchase check failed:', err);
        setCanReview(false);
      }
    }
    checkPurchase();
  }, [user, product, authFetch]);

  if (!product) return <div style={{ padding: 24 }}>Loading...</div>;

  async function submitReview() {
    try {
      await authFetch('/reviews', {
        method: 'POST',
        body: { product: product.name, productId: product.id, rating, comment },
      });
      setRating(5);
      setComment('');
      setReviewMessage('Review submitted for approval.');
      setTimeout(() => setReviewMessage(''), 3000);
    } catch (e) {
      setReviewMessage(e.message);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>{product.name}</h2>
      <img
        src={product.imageUrl || 'https://via.placeholder.com/600x300'}
        alt={product.name}
        style={{ maxWidth: 600, width: '100%' }}
      />
      <p>{product.description}</p>
      <div>
        <label>Size: </label>
        <select value={size} onChange={(e) => setSize(e.target.value)}>
          {(product.sizes || ['S', 'M', 'L']).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <button onClick={() => add(product, 1)}>Add to Cart</button>

      <h3 style={{ marginTop: 24 }}>Reviews</h3>
      <ul>
        {(product.Reviews || [])
          .filter((r) => r.approved)
          .map((r) => (
            <li key={r.id}>
              <b>{r.User?.name || 'Anon'}</b>: {r.comment} ({r.rating}/5)
            </li>
          ))}
      </ul>

      {user && (
        <div style={{ marginTop: 16 }}>
          <h4>Write a review</h4>
          {canReview ? (
            <>
              <input
                type="number"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
              />
              <textarea
                placeholder="Comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button onClick={submitReview}>Submit</button>
              {reviewMessage && <p>{reviewMessage}</p>}
            </>
          ) : (
            <p style={{ color: '#a05b2d' }}>
              You can only review items you have ordered. Place an order and try again!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
