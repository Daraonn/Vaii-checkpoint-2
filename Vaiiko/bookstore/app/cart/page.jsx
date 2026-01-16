'use client';

import { useEffect, useState } from 'react';
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
        setUserId(data.user.id);
        return data.user.id;
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

  if (loading) return <p>Loading cart...</p>;
  if (!userId) return <p>Please log in to view your cart.</p>;
  if (cartItems.length === 0) return <p>Your cart is empty.</p>;

  const totalPrice = cartItems.reduce((sum, item) => sum + item.book.price * item.quantity, 0);

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>
      <div className="cart-list">
        {cartItems.map(item => (
          <div key={item.cart_item_id} className="cart-row">
            <img src={item.book.image || '/placeholder.png'} alt={item.book.name} className="cart-row-img" />
            <div className="cart-row-info">
              <h3>{item.book.name}</h3>
              <p className="cart-author">{item.book.author}</p>
            </div>
            <div className="cart-spacer" />
            <div className="cart-qty">
              <button className="qty-btn" onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}>-</button>
              <span>{item.quantity}</span>
              <button className="qty-btn" onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}>+</button>
            </div>
            <div className="cart-actions">
              <button className="delete-btn" onClick={() => deleteItem(item.cart_item_id)}>Delete</button>
              <button className="fav-btn" onClick={() => toggleFavourite(item.book.book_id)}>
                <img src={isFavourited(item.book.book_id) ? '/heart_full.png' : '/heart.png'} alt="Favourite" />
              </button>
            </div>
            <div className="cart-price">${item.book.price * item.quantity}</div>
          </div>
        ))}
      </div>
      <h2 className="cart-total">Total: ${totalPrice}</h2>
    </div>
  );
};

export default Cart;

