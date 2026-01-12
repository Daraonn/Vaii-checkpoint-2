'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import './favourite.css';

const FAVOURITES_PER_PAGE = 5;

const Favourites = () => {
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

 
  const fetchFavourites = async () => {
    try {
      const res = await fetch('/api/favourite', { cache: 'no-store' });
      const data = await res.json();
      setFavourites(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavourites();
  }, []);


  const toggleFavourite = async (bookId) => {
    const existing = favourites.find(f => f.book.book_id === bookId);
    try {
      if (existing) {
        setFavourites(favs => favs.filter(f => f.book.book_id !== bookId));
        await fetch(`/api/favourite/${bookId}`, { method: 'DELETE' });
      } else {
        const res = await fetch('/api/favourite', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ book_id: bookId }) 
        });
        const newFav = await res.json();
        setFavourites(favs => [ ...favs, newFav ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isFavourited = (bookId) => favourites.some(f => f.book.book_id === bookId);

  if (loading) return <p>Loading favourites...</p>;
  if (favourites.length === 0) return <p>You have no favourites yet.</p>;


  const totalPages = Math.ceil(favourites.length / FAVOURITES_PER_PAGE);
  const startIndex = (currentPage - 1) * FAVOURITES_PER_PAGE;
  const currentFavourites = favourites.slice(startIndex, startIndex + FAVOURITES_PER_PAGE);

  return (
    <div className="favourite-page">
      <h1>Your Favourites</h1>
      <div className="favourite-list">
        {currentFavourites.map(fav => (
          <div key={fav.book.book_id} className="favourite-row">
            
            
            <Link href={`/book/${fav.book.book_id}`}>
              <img 
                src={fav.book.image || '/placeholder.png'} 
                alt={fav.book.name} 
                className="favourite-row-img" 
              />
            </Link>

            
            <div className="favourite-row-info">
              <Link href={`/book/${fav.book.book_id}`} className="favourite-book-link">
                <h3>{fav.book.name}</h3>
              </Link>
              <p className="favourite-author">{fav.book.author}</p>
            </div>

            <div className="favourite-spacer" />

            <div className="favourite-actions">
              <button 
                className="fav-btn" 
                onClick={() => toggleFavourite(fav.book.book_id)}
              >
                <img 
                  src={isFavourited(fav.book.book_id) ? '/heart_full.png' : '/heart.png'} 
                  alt="Favourite" 
                />
              </button>
            </div>
          </div>
        ))}
      </div>


      {totalPages > 1 && (
        <div className="pagination">
          <button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(p => p - 1)}
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Favourites;
