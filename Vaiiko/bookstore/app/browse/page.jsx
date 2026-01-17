'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import './browse.css';

const Browse = () => {
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [books, setBooks] = useState([]);
  const [visibleGenresCount, setVisibleGenresCount] = useState(10);
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('');

  const GENRES_INCREMENT = 10;

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

  const handleClearFilters = () => {
    setSelectedGenres([]);
  };

  const handleShowMoreGenres = () => {
    setVisibleGenresCount((prev) => Math.min(prev + GENRES_INCREMENT, genres.length));
  };

  const filteredBooks = books.filter((book) =>
    book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'author':
        return a.author.localeCompare(b.author);
      default:
        return 0;
    }
  });

  const displayedGenres = genres.slice(0, visibleGenresCount);

  return (
    <div className="browse-page">
      <div className="browse-container">
        
        <aside className="browse-sidebar">
          <div className="filter-header">
            <h2>Filters</h2>
            {selectedGenres.length > 0 && (
              <button onClick={handleClearFilters} className="clear-filters-btn">
                Clear All
              </button>
            )}
          </div>

          <div className="filter-section">
            <h3>Genres</h3>
            {selectedGenres.length > 0 && (
              <div className="active-filters">
                {selectedGenres.map((genreId) => {
                  const genre = genres.find((g) => g.genre_id === genreId);
                  return (
                    <span key={genreId} className="active-filter-tag">
                      {genre?.name}
                      <button onClick={() => handleGenreToggle(genreId)}>×</button>
                    </span>
                  );
                })}
              </div>
            )}
            <div className="genre-list">
              {displayedGenres.map((genre) => (
                <label key={genre.genre_id} className="genre-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedGenres.includes(genre.genre_id)}
                    onChange={() => handleGenreToggle(genre.genre_id)}
                  />
                  <span>{genre.name}</span>
                </label>
              ))}
            </div>

            {visibleGenresCount < genres.length && (
              <button className="show-more-btn" onClick={handleShowMoreGenres}>
                + Show More Genres
              </button>
            )}
          </div>
        </aside>

        
        <main className="browse-main">
          
          <div className="browse-header">
            <div className="browse-info">
              <h1>Browse Books</h1>
              <p className="results-count">
                {sortedBooks.length} {sortedBooks.length === 1 ? 'book' : 'books'} found
              </p>
            </div>

            <div className="browse-controls">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search books or authors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <span className="search-icon">🔍</span>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="name">Name (A-Z)</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="author">Author (A-Z)</option>
              </select>

              <div className="view-toggle">
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid view"
                >
                  ⊞
                </button>
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="List view"
                >
                  ☰
                </button>
              </div>
            </div>
          </div>

          
          {sortedBooks.length === 0 ? (
            <div className="no-results">
              <h3>No books found</h3>
              <p>Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className={`books-container ${viewMode}-view`}>
              {sortedBooks.map((book) => (
                <Link
                  href={`/book/${book.book_id}`}
                  key={book.book_id}
                  className="book-card"
                >
                  <div className="book-image-wrapper">
                    <img
                      src={book.image || '/placeholder.png'}
                      alt={book.name}
                      className="book-image"
                    />
                  </div>
                  
                  <div className="book-info">
                    <h3 className="book-title">{book.name}</h3>
                    <p className="book-author">by {book.author}</p>
                    
                    <div className="book-genres">
                      {book.genres.slice(0, 3).map((bg) => (
                        <span key={bg.book_genre_id} className="genre-tag">
                          {bg.genre.name}
                        </span>
                      ))}
                      {book.genres.length > 3 && (
                        <span className="genre-tag more">+{book.genres.length - 3}</span>
                      )}
                    </div>

                    <div className="book-footer">
                      <span className="book-price">${book.price.toFixed(2)}</span>
                      <button className="quick-view-btn">View Details</button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Browse;