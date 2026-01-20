'use client';
import { useEffect, useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import "./shop.css";

export default function ShopPage() {
  const [bestRated, setBestRated] = useState([]);
  const [mostPopular, setMostPopular] = useState([]);
  const [fantasyBooks, setFantasyBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [ratedRes, popularRes, fantasyRes, genresRes] = await Promise.all([
          fetch('/api/books/bestRated'),
          fetch('/api/books/mostReviewed'),
          fetch('/api/books/byGenre/1'),
          fetch('/api/genres')
        ]);

        const [rated, popular, fantasy, genresData] = await Promise.all([
          ratedRes.json(),
          popularRes.json(),
          fantasyRes.json(),
          genresRes.json()
        ]);

        console.log('=== MOST POPULAR BOOKS DEBUG ===');
        console.log('Total books:', popular.books?.length);
        popular.books?.forEach(book => {
          console.log(`"${book.name}": ${book.reviewCount} reviews, ${book.ratingCount} ratings, avgRating: ${book.avgRating}`);
        });

        setBestRated(rated.books || []);
        setMostPopular(popular.books || []);
        setFantasyBooks(fantasy.books || []);
        setGenres(genresData.genres || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="home-page">
        <div className="loading-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="hero-overlay">
          <div className="hero-content">
            <h1 className="hero-title">Welcome to Our BookShop</h1>
            <p className="hero-subtitle">Discover your next favorite book from our curated collection</p>
            <div className="hero-buttons">
              <Link href="/browse" className="btn-primary">Browse All Books</Link>
              <Link href="/browse" className="btn-secondary">View Categories</Link>
            </div>
          </div>
        </div>
      </section>

      <div className="home-container">
        {/* Categories Section */}
        <section className="categories-section">
          <h2 className="section-heading">Browse by Category</h2>
          <div className="categories-grid">
            {genres.slice(0, 6).map((genre) => (
              <Link 
                key={genre.genre_id} 
                href={`/browse?genre=${genre.genre_id}`}
                className="category-card"
              >
                <div className="category-icon">📚</div>
                <h3 className="category-name">{genre.name}</h3>
                <span className="category-arrow">→</span>
              </Link>
            ))}
          </div>
          <div className="section-footer">
            <Link href="/browse" className="view-all-link">View All Categories →</Link>
          </div>
        </section>

        {/* Best Rated Books */}
        <section className="featured-section">
          <div className="section-header">
            <div>
              <h2 className="section-heading">⭐ Best Rated Books</h2>
            </div>
            <Link href="/browse?sort=rating" className="view-all-link">View All →</Link>
          </div>
          
          <div className="books-grid">
            {bestRated.length === 0 ? (
              <p className="no-books-message">No rated books yet. Be the first to rate!</p>
            ) : (
              bestRated.map((book) => (
              <div key={book.book_id} className="book-card">
                <Link href={`/book/${book.book_id}`} className="book-image-link">
                  <div className="book-image-wrapper">
                    <Image
                      src={book.image || "/placeholder.png"}
                      width={180}
                      height={270}
                      alt={book.name}
                      className="book-image"
                    />
                    {book.avgRating > 0 && (
                      <span className="rating-badge">
                        ⭐ {book.avgRating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </Link>

                <div className="book-info">
                  <p className="book-author">{book.author}</p>
                  <Link href={`/book/${book.book_id}`}>
                    <h3 className="book-title">{book.name}</h3>
                  </Link>
                  
                  <div className="book-footer">
                    <span className="book-price">${Number(book.price).toFixed(2)}</span>
                    <Link href={`/book/${book.book_id}`} className="quick-view-btn">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))
            )}
          </div>
        </section>

        {/* Most Popular Books */}
        <section className="featured-section popular-section">
          <div className="section-header">
            <div>
              <h2 className="section-heading">🔥 Most Popular</h2>
            </div>
            <Link href="/browse?sort=popular" className="view-all-link">View All →</Link>
          </div>
          
          <div className="books-grid">
            {mostPopular.length === 0 ? (
              <p className="no-books-message">No reviews yet. Be the first to review a book!</p>
            ) : (
              mostPopular.map((book) => {
                const rating = book.avgRating || 0;
                const hasRating = rating > 0;
                console.log(`Book "${book.name}": avgRating=${book.avgRating}, rating=${rating}, hasRating=${hasRating}, ratingCount=${book.ratingCount}`);
                return (
              <div key={book.book_id} className="book-card">
                <Link href={`/book/${book.book_id}`} className="book-image-link">
                  <div className="book-image-wrapper">
                    <Image
                      src={book.image || "/placeholder.png"}
                      width={180}
                      height={270}
                      alt={book.name}
                      className="book-image"
                    />
                    {hasRating ? (
                      <span className="rating-badge" style={{backgroundColor: 'rgba(251, 191, 36, 0.95)', color: 'white'}}>
                        ⭐ {rating.toFixed(1)}
                      </span>
                    ) : (
                      <span className="rating-badge" style={{backgroundColor: 'rgba(100, 116, 139, 0.95)', color: 'white'}}>
                        No rating
                      </span>
                    )}
                  </div>
                </Link>

                <div className="book-info">
                  <p className="book-author">{book.author}</p>
                  <Link href={`/book/${book.book_id}`}>
                    <h3 className="book-title">{book.name}</h3>
                  </Link>
                  
                  <div className="book-footer">
                    <span className="book-price">${Number(book.price).toFixed(2)}</span>
                    <Link href={`/book/${book.book_id}`} className="quick-view-btn">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
              );
            })
            )}
          </div>
        </section>

        {/* Fantasy Books Showcase */}
        {fantasyBooks.length > 0 && (
          <section className="new-arrivals-section">
            <div className="section-header">
              <div>
                <h2 className="section-heading">🧙‍♂️ Fantasy Collection</h2>
                <p className="section-subheading">Step into magical worlds</p>
              </div>
              <Link href={`/browse?genre=fantasy`} className="view-all-link">View All →</Link>
            </div>
            
            <div className="new-arrivals-grid">
              {fantasyBooks.map((book) => (
                <div key={book.book_id} className="book-card">
                  <Link href={`/book/${book.book_id}`} className="book-image-link">
                    <div className="book-image-wrapper">
                      <Image
                        src={book.image || "/placeholder.png"}
                        width={180}
                        height={270}
                        alt={book.name}
                        className="book-image"
                      />
                      <span className="genre-badge-overlay">FANTASY</span>
                    </div>
                  </Link>

                  <div className="book-info">
                    <p className="book-author">{book.author}</p>
                    <Link href={`/book/${book.book_id}`}>
                      <h3 className="book-title">{book.name}</h3>
                    </Link>
                    
                    <div className="book-footer">
                      <span className="book-price">${Number(book.price).toFixed(2)}</span>
                      <Link href={`/book/${book.book_id}`} className="quick-view-btn">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Call to Action */}
        <section className="cta-section">
          <div className="cta-card">
            <h2 className="cta-title">Can't find what you're looking for?</h2>
            <p className="cta-text">Browse our complete catalog with advanced filters and search</p>
            <Link href="/browse" className="cta-button">Explore Full Catalog</Link>
          </div>
        </section>
      </div>
    </div>
  );
}