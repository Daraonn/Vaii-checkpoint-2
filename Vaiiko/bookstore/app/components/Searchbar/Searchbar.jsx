"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import "./Searchbar.css";

export default function Searchbar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const fetchBooks = async (search) => {
    if (!search) {
      setResults([]);
      return;
    }

    try {
      const res = await fetch(`/api/books?name=${encodeURIComponent(search)}`);
      const data = await res.json();
      setResults(data.books || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchBooks(query);
    }, 300);

    return () => clearTimeout(delay);
  }, [query]);

  const handleChange = (e) => setQuery(e.target.value);
  const handleSubmit = (e) => {
    e.preventDefault();
    fetchBooks(query); 
  };

  return (
    <div className="searchbar-container">
      <form className="search-bar" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search books..."
          value={query}
          onChange={handleChange}
        />
        <div className="button-wrapper">
          <button type="submit" className="searchbar-search-button">Search</button>
        </div>
      </form>
      
      {query && (
        <div className="results">
          {results.length === 0 ? (
            <p className="no-results">No books found.</p>
          ) : (
            results.map((book) => (
              <Link
                key={book.book_id}
                href={`/book/${book.book_id}`}
                className="result-row"
              >
                <img
                  src={book.image || "/placeholder.png"}
                  alt={book.name}
                  style={{
                    width: "30px",
                    height: "30px",
                    objectFit: "cover",
                    borderRadius: "4px",
                    marginRight: "10px",
                  }}
                />
                <p className="book-name">{book.name}</p>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}