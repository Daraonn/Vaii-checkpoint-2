'use client';

import React, { useEffect, useState } from 'react';
import './browse.css';

const Browse = () => {
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [books, setBooks] = useState([]);
  const [visibleGenresCount, setVisibleGenresCount] = useState(5); // Start by showing 5 genres

  const GENRES_INCREMENT = 5; // Show 5 more genres per click

  // Fetch genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await fetch('/api/genres');
        const data = await res.json();
        setGenres(data.genres);
      } catch (err) {
        console.error('Failed to fetch genres', err);
      }
    };
    fetchGenres();
  }, []);

  // Fetch books
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const query = selectedGenres.join(',');
        const res = await fetch(`/api/books/browse${query ? `?genres=${query}` : ''}`);
        const data = await res.json();
        setBooks(data.books);
      } catch (err) {
        console.error('Failed to fetch books', err);
      }
    };
    fetchBooks();
  }, [selectedGenres]);

  const handleGenreToggle = (genreId) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
  };

  const handleShowMoreGenres = () => {
    setVisibleGenresCount((prev) => Math.min(prev + GENRES_INCREMENT, genres.length));
  };

  const displayedGenres = genres.slice(0, visibleGenresCount);

  return (
    <div className="browse-container">
      {/* Filter panel */}
      <aside className="browse-filters">
        <h3>Filter by Genre</h3>
        <div className="browse-genres">
          {displayedGenres.map((genre) => (
            <label key={genre.genre_id} className="browse-genre-label">
              <input
                type="checkbox"
                checked={selectedGenres.includes(genre.genre_id)}
                onChange={() => handleGenreToggle(genre.genre_id)}
              />
              {genre.name}
            </label>
          ))}
        </div>

        {visibleGenresCount < genres.length && (
          <button
            className="browse-show-more-btn"
            onClick={handleShowMoreGenres}
          >
            Show More
          </button>
        )}
      </aside>

      {/* Books display */}
      <main className="browse-books">
        {books.length === 0 ? (
          <p className="browse-no-books">No books found</p>
        ) : (
          books.map((book) => (
            <div key={book.book_id} className="browse-book-card">
              <img
                src={book.image || '/placeholder.png'}
                alt={book.name}
                className="browse-book-image"
              />
              <h4 className="browse-book-title">{book.name}</h4>
              <p className="browse-book-author">Author: {book.author}</p>
              <p className="browse-book-price">Price: ${book.price}</p>
              <div className="browse-book-genres">
                {book.genres.map((bg) => (
                  <span key={bg.book_genre_id} className="browse-book-genre">
                    {bg.genre.name}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
};

export default Browse;
