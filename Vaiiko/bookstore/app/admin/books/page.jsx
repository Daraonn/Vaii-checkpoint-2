'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import DeleteButton from './bookdeletebutton'; 
import './adminbooks.css';

export default function AdminBooksPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');


  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch books
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const url = debouncedSearch 
          ? `/api/books?name=${encodeURIComponent(debouncedSearch)}`
          : '/api/books';
        
        const res = await fetch(url);
        const data = await res.json();
        setBooks(data.books || []);
      } catch (err) {
        console.error('Failed to fetch books:', err);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [debouncedSearch]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="admin-books-page">
      <div className="admin-books-container">
        {/* Header Section */}
        <div className="page-header">
          <div className="header-content">
            <h1>Books Management</h1>
            <p className="header-subtitle">Manage your book inventory and pricing</p>
          </div>
          <Link href="/admin/books/add">
            <button className="btn-add-book">
              <span className="btn-icon">+</span>
              Add New Book
            </button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Books</div>
            <div className="stat-value">{loading ? '...' : books.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active Listings</div>
            <div className="stat-value">{loading ? '...' : books.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Authors</div>
            <div className="stat-value">
              {loading ? '...' : new Set(books.map(b => b.author)).size}
            </div>
          </div>
        </div>

        {/* Books Table */}
        <div className="table-container">
          <div className="table-header">
            <h2>All Books</h2>
            <div className="table-actions">
              <div className="search-wrapper">
                <input 
                  type="search" 
                  placeholder="Search by book name..." 
                  className="search-input"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                {searchQuery && (
                  <button 
                    onClick={clearSearch}
                    className="clear-search-btn"
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="table-wrapper">
            {loading ? (
              <div className="loading-state">
                <p>Loading books...</p>
              </div>
            ) : (
              <table className="books-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Book Details</th>
                    <th>Author</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="empty-state">
                        <div className="empty-content">
                          <p>{searchQuery ? `No books found for "${searchQuery}"` : 'No books found'}</p>
                          {!searchQuery && (
                            <Link href="/admin/books/add">
                              <button className="btn-secondary">Add Your First Book</button>
                            </Link>
                          )}
                          {searchQuery && (
                            <button onClick={clearSearch} className="btn-secondary">
                              Clear Search
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    books.map((b) => (
                      <tr key={b.book_id}>
                        <td>
                          <span className="book-id">#{b.book_id}</span>
                        </td>
                        <td>
                          <div className="book-details">
                            {b.image && (
                              <img 
                                src={b.image} 
                                alt={b.name} 
                                className="book-thumbnail"
                              />
                            )}
                            <div className="book-info">
                              <span className="book-name">{b.name}</span>
                              {b.ISBN && (
                                <span className="book-isbn">ISBN: {b.ISBN}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="author-name">{b.author}</span>
                        </td>
                        <td>
                          <span className="book-price">${Number(b.price).toFixed(2)}</span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <Link href={`/admin/books/edit/${b.book_id}`}>
                              <button className="btn-edit" title="Edit book">
                                Edit
                              </button>
                            </Link>
                            <DeleteButton bookId={b.book_id} />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Table Footer */}
          {!loading && books.length > 0 && (
            <div className="table-footer">
              <p className="result-count">
                {searchQuery 
                  ? `Found ${books.length} book${books.length !== 1 ? 's' : ''} for "${searchQuery}"`
                  : `Showing ${books.length} of ${books.length} books`
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}