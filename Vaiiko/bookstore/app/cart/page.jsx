'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import './cart.css';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  const fetchUserId = async () => {
    try {
      const res = await fetch('/api/token');
      const data = await res.json();
      if (data.user) {
        setUserId(data.user.user_id);
        return data.user.user_id;
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    }
    return null;
  };

  const fetchCart = async (uid) => {
    try {
      const res = await fetch(`/api/user/${uid}/cart`, { cache: 'no-store' });
      setCartItems(await res.json());
    } catch (err) { 
      console.error('Error fetching cart:', err); 
    }
  };

  const fetchFavourites = async (uid) => {
    try {
      const res = await fetch(`/api/user/${uid}/favorites`, { cache: 'no-store' });
      const data = await res.json();
      setFavourites(data.favorites || []);
    } catch (err) { 
      console.error('Error fetching favourites:', err); 
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const uid = await fetchUserId();
      if (uid) {
        await Promise.all([fetchCart(uid), fetchFavourites(uid)]);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const updateQuantity = async (itemId, qty) => {
    if (qty < 1 || !userId) return;
    try {
      await fetch(`/api/user/${userId}/cart/${itemId}`, { 
        method: 'PATCH', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ quantity: qty }) 
      });
      await fetchCart(userId);
    } catch (err) { 
      console.error('Error updating quantity:', err); 
    }
  };

  const deleteItem = async (itemId) => {
    if (!userId) return;
    try {
      await fetch(`/api/user/${userId}/cart/${itemId}`, { method: 'DELETE' });
      await fetchCart(userId);
    } catch (err) { 
      console.error('Error deleting item:', err); 
    }
  };

  const toggleFavourite = async (bookId) => {
    if (!userId) return;
    
    const existing = favourites.find(f => f.book.book_id === bookId);
    try {
      if (existing) {
        setFavourites(favs => favs.filter(f => f.book.book_id !== bookId));
        await fetch(`/api/user/${userId}/favorites/${bookId}`, { method: 'DELETE' });
      } else {
        const res = await fetch(`/api/user/${userId}/favorites`, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ book_id: bookId }) 
        });
        const newFav = await res.json();
        setFavourites(favs => [...favs, newFav]); 
      }
    } catch (err) { 
      console.error('Error toggling favourite:', err); 
    }
  };

  const isFavourited = (bookId) => favourites.some(f => f.book.book_id === bookId);

  if (loading) {
    return (
      <div className="cart-page">
        <div className="cart-loading">Loading cart...</div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <h2>Please log in to view your cart</h2>
          <Link href="/login" className="continue-shopping-btn">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <h2>Your cart is empty</h2>
          <p>Add some books to get started!</p>
          <Link href="/browse" className="continue-shopping-btn">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.book.price * item.quantity, 0);
  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-main">
          <div className="cart-header">
            <h1>Shopping Cart</h1>
            <span className="cart-count">{totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}</span>
          </div>

          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.cart_item_id} className="cart-item">
                <Link href={`/book/${item.book.book_id}`} className="cart-item-image">
                  <img src={item.book.image || '/placeholder.png'} alt={item.book.name} />
                </Link>

                <div className="cart-item-details">
                  <Link href={`/book/${item.book.book_id}`} className="cart-item-title">
                    {item.book.name}
                  </Link>
                  <p className="cart-item-author">by {item.book.author}</p>
                  <p className="cart-item-isbn">ISBN: {item.book.ISBN}</p>
                  <p className="cart-item-unit-price">Unit price: ${item.book.price.toFixed(2)}</p>
                  
                  <div className="cart-item-actions-mobile">
                    <button 
                      className="cart-item-remove" 
                      onClick={() => deleteItem(item.cart_item_id)}
                    >
                      Remove
                    </button>
                    <button 
                      className={`cart-item-favorite ${isFavourited(item.book.book_id) ? 'active' : ''}`}
                      onClick={() => toggleFavourite(item.book.book_id)}
                    >
                      {isFavourited(item.book.book_id) ? '❤️ Saved' : '🤍 Save for later'}
                    </button>
                  </div>
                </div>

                <div className="cart-item-quantity">
                  <label>Quantity</label>
                  <div className="quantity-selector">
                    <button 
                      onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}>
                      +
                    </button>
                  </div>
                </div>

                <div className="cart-item-price">
                  <span className="price-label">Total</span>
                  <span className="price-value">${(item.book.price * item.quantity).toFixed(2)}</span>
                </div>

                <button 
                  className="cart-item-delete"
                  onClick={() => deleteItem(item.cart_item_id)}
                  title="Remove from cart"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <Link href="/browse" className="continue-shopping">
            ← Continue Shopping
          </Link>
        </div>

        <div className="cart-sidebar">
          <div className="order-summary">
            <h2>Order Summary</h2>
            
            <div className="summary-row">
              <span>Subtotal ({totalItemCount} {totalItemCount === 1 ? 'item' : 'items'})</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
            </div>

            {shipping === 0 && (
              <p className="free-shipping-notice">🎉 You've got free shipping!</p>
            )}

            {subtotal < 50 && (
              <p className="free-shipping-notice">
                Add ${(50 - subtotal).toFixed(2)} more for free shipping
              </p>
            )}

            <div className="summary-row">
              <span>Estimated Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row summary-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <Link href="/checkout" className="checkout-btn">
              Proceed to Checkout
            </Link>

            <div className="payment-methods">
              <p>We accept:</p>
              <div className="payment-icons">
                💳 💵 🏦
              </div>
            </div>
          </div>

          <div className="cart-benefits">
            <h3>Why shop with us?</h3>
            <ul>
              <li>📦 Free shipping on orders over $50</li>
              <li>🔄 30-day return policy</li>
              <li>🔒 Secure checkout</li>
              <li>⚡ Fast delivery</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;