'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import './favourite.css';

const Favourites = () => {
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // Fetch user ID first
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

  // Fetch favourites using new API endpoint
  const fetchFavourites = async (uid) => {
    try {
      const res = await fetch(`/api/user/${uid}/favorites`, { cache: 'no-store' });
      const data = await res.json();
      setFavourites(data.favorites || []);
    } catch (err) {
      console.error('Error fetching favourites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const uid = await fetchUserId();
      if (uid) {
        await fetchFavourites(uid);
      } else {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Toggle favourite
  const toggleFavourite = async (bookId) => {
    if (!userId) return;

    const existing = favourites.find(f => f.book.book_id === bookId);
    try {
      if (existing) {
        // Optimistically update UI
        setFavourites(favs => favs.filter(f => f.book.book_id !== bookId));
        // DELETE /api/user/[id]/favorites/[bookId]
        await fetch(`/api/user/${userId}/favorites/${bookId}`, { method: 'DELETE' });
      } else {
        // Add to favourites
        // POST /api/user/[id]/favorites
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
      // Revert on error
      fetchFavourites(userId);
    }
  };

  if (loading) {
    return (
      <div className="favourite-page">
        <p className="loading-text">Loading favourites...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="favourite-page">
        <p className="empty-text">Please log in to view your favourites.</p>
      </div>
    );
  }

  if (favourites.length === 0) {
    return (
      <div className="favourite-page">
        <h1 className="page-title">⭐ Favorites</h1>
        <p className="empty-text">You have no favourites yet.</p>
      </div>
    );
  }

  return (
    <div className="favourite-page">
      <h1 className="page-title">⭐ Favorites</h1>
      
      <div className="favourite-grid">
        {favourites.map(fav => (
          <div key={fav.book.book_id} className="favourite-card">
            <Link href={`/book/${fav.book.book_id}`} className="book-link">
              <div className="book-image-container">
                <img 
                  src={fav.book.image || '/placeholder.png'} 
                  alt={fav.book.name} 
                  className="book-image" 
                />
              </div>
              
              <div className="book-info">
                <h3 className="book-title">{fav.book.name}</h3>
                <p className="book-author">BY {fav.book.author.toUpperCase()}</p>
                {fav.book.year && (
                  <p className="book-meta">{fav.book.year}</p>
                )}
              </div>
            </Link>
            
            <button 
              className="remove-fav-btn" 
              onClick={() => toggleFavourite(fav.book.book_id)}
              title="Remove from favorites"
            >
              ❌
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Favourites;