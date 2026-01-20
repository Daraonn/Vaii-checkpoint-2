"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./book.module.css"; 

export default function BookPageClient({ book }) {
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  
  const [userRating, setUserRating] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState("");
  
  const [userReview, setUserReview] = useState(null);
  const [reviewContent, setReviewContent] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  const [reviews, setReviews] = useState([]);
  const [showCommentForm, setShowCommentForm] = useState({});
  const [commentContent, setCommentContent] = useState({});
  
  const [bookStats, setBookStats] = useState({
    averageRating: 0,
    totalRatings: 0,
    statusCounts: {
      COMPLETED: 0,
      WANT_TO_READ: 0,
      CURRENTLY_READING: 0,
      DNF: 0
    },
    ratings: [],
    starDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  const detailsRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch('/api/token');
        const data = await res.json();
        if (data.user) {
          setUserId(data.user.user_id);
          setIsAdmin(data.user.isAdmin || false);
          
          const favRes = await fetch(`/api/user/${data.user.user_id}/favorites`);
          const favData = await favRes.json();
          const isBookFavorited = favData.favorites?.some(
            fav => fav.book.book_id === book.book_id
          );
          setIsFavorited(isBookFavorited);

          try {
            const ratingRes = await fetch(`/api/user/${data.user.user_id}/ratings/${book.book_id}`);
            if (ratingRes.ok) {
              const ratingData = await ratingRes.json();
              if (ratingData && ratingData.rating_id) {
                setUserRating(ratingData);
                setSelectedStatus(ratingData.status);
              }
            }
          } catch (err) {
            console.error('No existing rating');
          }
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchBookStats = async () => {
      try {
        const res = await fetch(`/api/books/${book.book_id}/ratings`);
        const data = await res.json();
        
        const starDist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        data.ratings.forEach(r => {
          if (r.stars) starDist[r.stars]++;
        });
        
        setBookStats({...data, starDistribution: starDist});
      } catch (err) {
        console.error('Error fetching book stats:', err);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/books/${book.book_id}/reviews`);
        const data = await res.json();
        setReviews(data.reviews || []);
        
        if (data.reviews && userId) {
          const userReviewData = data.reviews.find(r => r.user_id === userId);
          if (userReviewData) {
            setUserReview(userReviewData);
            setReviewContent(userReviewData.content);
          }
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      }
    };

    fetchUserData();
    fetchBookStats();
    fetchReviews();
  }, [book.book_id, userId]);

  const addToCart = async () => {
    if (!userId) {
      setMessage("Please login to add to cart.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      const res = await fetch(`/api/user/${userId}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_id: book.book_id, quantity: 1 }),
      });

      if (res.ok) {
        setMessage("✓ Book added to cart!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        const data = await res.json();
        setMessage(data.error || "Failed to add to cart");
      }
    } catch (err) {
      console.error(err);
      setMessage("An error occurred.");
    }
  };

  const submitRating = async (stars) => {
    if (!userId) {
      setMessage("Please login to rate this book.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    let statusToSubmit = selectedStatus;
    if (!statusToSubmit && stars) {
      statusToSubmit = 'COMPLETED';
      setSelectedStatus('COMPLETED');
    }

    try {
      const res = await fetch(`/api/user/${userId}/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book_id: book.book_id,
          stars: stars,
          status: statusToSubmit
        })
      });

      if (res.ok) {
        const data = await res.json();
        setUserRating(data);
        setMessage("✓ Rating saved!");
        setTimeout(() => setMessage(""), 3000);
        
        const statsRes = await fetch(`/api/books/${book.book_id}/ratings`);
        const statsData = await statsRes.json();
        
        const starDist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        statsData.ratings.forEach(r => {
          if (r.stars) starDist[r.stars]++;
        });
        
        setBookStats({...statsData, starDistribution: starDist});
      } else {
        const data = await res.json();
        setMessage(data.error || "Failed to save rating");
      }
    } catch (err) {
      console.error(err);
      setMessage("An error occurred.");
    }
  };

  const updateStatus = async (status) => {
    if (!userId) {
      setMessage("Please login to update status.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setSelectedStatus(status);

    try {
      const res = await fetch(`/api/user/${userId}/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book_id: book.book_id,
          stars: userRating?.stars || null,
          status: status
        })
      });

      if (res.ok) {
        const data = await res.json();
        setUserRating(data);
        setMessage("✓ Status updated!");
        setTimeout(() => setMessage(""), 3000);
        
        const statsRes = await fetch(`/api/books/${book.book_id}/ratings`);
        const statsData = await statsRes.json();
        
        const starDist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        statsData.ratings.forEach(r => {
          if (r.stars) starDist[r.stars]++;
        });
        
        setBookStats({...statsData, starDistribution: starDist});
      }
    } catch (err) {
      console.error(err);
      setMessage("An error occurred.");
    }
  };

  const submitReview = async () => {
    if (!userId) {
      setMessage("Please login to write a review.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    if (!reviewContent.trim()) {
      setMessage("Please write a review.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      const res = await fetch(`/api/user/${userId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book_id: book.book_id,
          content: reviewContent
        })
      });

      if (res.ok) {
        const data = await res.json();
        setUserReview(data);
        setShowReviewModal(false);
        setMessage("✓ Review saved!");
        setTimeout(() => setMessage(""), 3000);
        
        const reviewsRes = await fetch(`/api/books/${book.book_id}/reviews`);
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData.reviews || []);
      } else {
        const data = await res.json();
        setMessage(data.error || "Failed to save review");
      }
    } catch (err) {
      console.error(err);
      setMessage("An error occurred.");
    }
  };

  const submitComment = async (reviewId) => {
    if (!userId) {
      setMessage("Please login to comment.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    const content = commentContent[reviewId];
    if (!content?.trim()) {
      setMessage("Please write a comment.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      const res = await fetch(`/api/reviews/${reviewId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

      if (res.ok) {
        setCommentContent({ ...commentContent, [reviewId]: "" });
        setShowCommentForm({ ...showCommentForm, [reviewId]: false });
        
        const reviewsRes = await fetch(`/api/books/${book.book_id}/reviews`);
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData.reviews || []);
        
        setMessage("✓ Comment added!");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      console.error(err);
      setMessage("An error occurred.");
    }
  };

  const deleteReview = async () => {
    if (!userId || !userReview) return;

    if (!confirm("Are you sure you want to delete your review?")) return;

    try {
      const res = await fetch(`/api/user/${userId}/reviews/${book.book_id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setUserReview(null);
        setReviewContent("");
        setMessage("✓ Review deleted!");
        setTimeout(() => setMessage(""), 3000);
        
        const reviewsRes = await fetch(`/api/books/${book.book_id}/reviews`);
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData.reviews || []);
      }
    } catch (err) {
      console.error(err);
      setMessage("An error occurred.");
    }
  };

  const deleteComment = async (reviewId, commentId) => {
    if (!userId) return;

    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      const res = await fetch(`/api/reviews/${reviewId}/comments/${commentId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setMessage("✓ Comment deleted!");
        setTimeout(() => setMessage(""), 3000);
        
        const reviewsRes = await fetch(`/api/books/${book.book_id}/reviews`);
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData.reviews || []);
      }
    } catch (err) {
      console.error(err);
      setMessage("An error occurred.");
    }
  };

  const adminDeleteReview = async (reviewId) => {
    if (!isAdmin) return;

    if (!confirm("Are you sure you want to delete this review as admin?")) return;

    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setMessage("✓ Review deleted by admin!");
        setTimeout(() => setMessage(""), 3000);
        
        const reviewsRes = await fetch(`/api/books/${book.book_id}/reviews`);
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData.reviews || []);
      } else {
        const data = await res.json();
        setMessage(data.error || "Failed to delete review");
      }
    } catch (err) {
      console.error(err);
      setMessage("An error occurred.");
    }
  };

  const adminDeleteComment = async (reviewId, commentId) => {
    if (!isAdmin) return;

    if (!confirm("Are you sure you want to delete this comment as admin?")) return;

    try {
      const res = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setMessage("✓ Comment deleted by admin!");
        setTimeout(() => setMessage(""), 3000);
        
        const reviewsRes = await fetch(`/api/books/${book.book_id}/reviews`);
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData.reviews || []);
      } else {
        const data = await res.json();
        setMessage(data.error || "Failed to delete comment");
      }
    } catch (err) {
      console.error(err);
      setMessage("An error occurred.");
    }
  };

  const toggleLike = async (reviewId, isLike) => {
    if (!userId) {
      setMessage("Please login to like reviews.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      await fetch(`/api/reviews/${reviewId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_like: isLike })
      });

      const reviewsRes = await fetch(`/api/books/${book.book_id}/reviews`);
      const reviewsData = await reviewsRes.json();
      setReviews(reviewsData.reviews || []);
    } catch (err) {
      console.error(err);
    }
  };

  const renderStars = (rating, interactive = false, size = "24px") => {
    const stars = [];
    const currentRating = interactive ? (hoverRating || rating || 0) : (rating || 0);
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`${styles.star} ${i <= currentRating ? styles.filled : ''} ${interactive ? styles.interactive : ''}`}
          onMouseEnter={interactive ? () => setHoverRating(i) : undefined}
          onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
          onClick={interactive ? () => submitRating(i) : undefined}
          style={{ fontSize: size }}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className={styles.bookPage}>
      <div className={styles.bookLayout}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarSticky}>
            <div className={styles.bookImage}>
              <Image
                src={book.image || "/placeholder.png"}
                width={300}
                height={450}
                alt={book.name}
                priority
              />
            </div>

            <button 
              className={styles.addToCartBtn} 
              onClick={addToCart}
              disabled={loading}
            >
              <Image
                src="/cart.png"
                width={20}
                height={20}
                alt="Cart"
                className={styles.cartIcon}
              />
              {loading ? "Loading..." : "Add to Cart"}
            </button>

            <div className={styles.rateThisBook}>
              <p className={styles.rateLabel}>Rate this book</p>
              <div className={styles.rateStars}>
                {[1,2,3,4,5].map(i => (
                  <span 
                    key={i}
                    className={`${styles.rateStar} ${
                      (hoverRating || userRating?.stars || 0) >= i ? styles.filled : ''
                    }`}
                    onMouseEnter={() => setHoverRating(i)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => submitRating(i)}
                  >
                    ★
                  </span>
                ))}
              </div>
              
              <div className={styles.statusSection}>
                <p className={styles.statusLabel}>Reading Status</p>
                <div className={styles.statusButtons}>
                  <button
                    className={`${styles.statusBtn} ${selectedStatus === 'WANT_TO_READ' ? styles.active : ''}`}
                    onClick={() => updateStatus('WANT_TO_READ')}
                  >
                    Want to Read
                  </button>
                  <button
                    className={`${styles.statusBtn} ${selectedStatus === 'CURRENTLY_READING' ? styles.active : ''}`}
                    onClick={() => updateStatus('CURRENTLY_READING')}
                  >
                    Reading
                  </button>
                  <button
                    className={`${styles.statusBtn} ${selectedStatus === 'COMPLETED' ? styles.active : ''}`}
                    onClick={() => updateStatus('COMPLETED')}
                  >
                    Completed
                  </button>
                  <button
                    className={`${styles.statusBtn} ${selectedStatus === 'DNF' ? styles.active : ''}`}
                    onClick={() => updateStatus('DNF')}
                  >
                    DNF
                  </button>
                </div>

                {/* Reading Statistics */}
                <div className={styles.statusStats}>
                  <div className={styles.statItem}>
                    <span className={styles.statCount}>
                      {bookStats.statusCounts?.WANT_TO_READ || 0}
                    </span>
                    <span className={styles.statLabel}>Want to Read</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statCount}>
                      {bookStats.statusCounts?.CURRENTLY_READING || 0}
                    </span>
                    <span className={styles.statLabel}>Reading</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statCount}>
                      {bookStats.statusCounts?.COMPLETED || 0}
                    </span>
                    <span className={styles.statLabel}>Completed</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statCount}>
                      {bookStats.statusCounts?.DNF || 0}
                    </span>
                    <span className={styles.statLabel}>DNF</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className={styles.mainContent}>
          <div className={styles.bookHeader}>
            <h1 className={styles.bookTitle}>{book.name}</h1>
            <p className={styles.bookAuthor}>by {book.author}</p>
            
            <div className={styles.ratingOverview}>
              <div className={styles.starsLarge}>
                {renderStars(Math.round(bookStats.averageRating), false, "32px")}
              </div>
              <span className={styles.averageScore}>{bookStats.averageRating.toFixed(2)}</span>
              <span className={styles.ratingMeta}>
                {bookStats.totalRatings.toLocaleString()} ratings · {reviews.length} reviews
              </span>
            </div>
          </div>

            {/* GENRES SECTION */}
            {book.genres && book.genres.length > 0 && (
              <div className={styles.genresSection}>
                <div className={styles.genres}>
                  {book.genres.map(g => (
                    <span key={g.genre_id || g.book_genre_id} className={styles.genreTag}>
                       {g.genre.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          <div className={styles.bookAbout}>
            <p style={{ whiteSpace: "pre-wrap" }}>{book.about}</p>
          </div>

          {/* Professional Pricing Section */}
          <div className={styles.bookMeta}>
            <div className={styles.metaInfo}>
              <span className={styles.metaItem}>Language: {book.language}</span>
              <span className={styles.metaItem}>Year: {book.year}</span>
              <span className={styles.metaItem}>ISBN: {book.ISBN}</span>
              
              {/* Genres in metadata */}
              {book.genres && book.genres.length > 0 && (
                <div className={styles.metaItemBlock}>
                  <div className={styles.metaGenresLabel}>Genres:</div>
                  <div className={styles.metaGenres}>
                    {book.genres.map((g, index) => (
                      <span key={g.genre_id}>
                        {g.genre.name}
                        {index < book.genres.length - 1 && ', '}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
            
            <div className={styles.bookPriceAction}>
              <div className={styles.bookPrice}>
                <span className={styles.priceAmount}>${Number(book.price).toFixed(2)}</span>
              </div>
              <button 
                className={styles.addToCartBtnMain} 
                onClick={addToCart}
                disabled={loading}
              >
                <Image
                  src="/cart.png"
                  width={20}
                  height={20}
                  alt="Cart"
                />
                {loading ? "Loading..." : "Add to Cart"}
              </button>
            </div>
          </div>

          <div ref={detailsRef} className={styles.ratingsSection}>
            <h2>Ratings & Reviews</h2>
            
            <div className={styles.ratingBreakdown}>
              {[5,4,3,2,1].map(stars => {
                const count = bookStats.starDistribution[stars] || 0;
                const percentage = bookStats.totalRatings > 0 
                  ? (count / bookStats.totalRatings) * 100 
                  : 0;
                
                return (
                  <div key={stars} className={styles.ratingRow}>
                    <div className={styles.ratingRowStars}>
                      {renderStars(stars, false, "16px")}
                    </div>
                    <div className={styles.ratingBar}>
                      <div 
                        className={styles.ratingBarFill} 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className={styles.ratingCount}>{count}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.reviewsSection}>
            <div className={styles.reviewsHeader}>
              <h2>Community Reviews</h2>
              {userId && (
                <div className={styles.reviewHeaderActions}>
                  <button 
                    className={styles.writeReviewBtn}
                    onClick={() => setShowReviewModal(true)}
                  >
                    {userReview ? 'Edit your review' : 'Write a review'}
                  </button>
                  {userReview && (
                    <button 
                      className={styles.deleteReviewBtn}
                      onClick={deleteReview}
                    >
                      Delete review
                    </button>
                  )}
                </div>
              )}
            </div>

            {reviews.length === 0 ? (
              <p className={styles.noReviews}>No reviews yet. Be the first to review this book!</p>
            ) : (
              <div className={styles.reviewsList}>
                {reviews.map((review) => (
                  <div key={review.review_id} className={styles.reviewCard}>
                    <div className={styles.reviewHeader}>
                      <div className={styles.reviewUserInfo}>
                        <Link href={`/profile/${review.user.user_id}`} className={styles.avatarLink}>
                          {review.user.avatar ? (
                            <Image
                              src={review.user.avatar}
                              width={48}
                              height={48}
                              alt={review.user.name}
                              className={styles.userAvatar}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : (
                            <div className={styles.avatarFallback}>
                              {review.user.name?.[0]?.toUpperCase() || '?'}
                            </div>
                          )}
                        </Link>
                        <div>
                          <Link href={`/profile/${review.user.user_id}`} className={styles.reviewAuthor}>
                            {review.user.name}
                          </Link>
                          <div className={styles.reviewDate}>
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                      {isAdmin && review.user_id !== userId && (
                        <button 
                          className={styles.adminDeleteBtn}
                          onClick={() => adminDeleteReview(review.review_id)}
                          title="Delete as admin"
                        >
                          Admin Delete
                        </button>
                      )}
                    </div>
                    
                    <p className={styles.reviewText}>{review.content}</p>

                    <div className={styles.reviewActions}>
                      <button 
                        className={`${styles.likeBtn} ${review.userLiked ? styles.active : ''}`}
                        onClick={() => toggleLike(review.review_id, true)}
                      >
                        👍 {review.likesCount || 0}
                      </button>
                      <button 
                        className={`${styles.likeBtn} ${review.userDisliked ? styles.active : ''}`}
                        onClick={() => toggleLike(review.review_id, false)}
                      >
                        👎 {review.dislikesCount || 0}
                      </button>
                      <button 
                        className={styles.commentBtn}
                        onClick={() => setShowCommentForm({
                          ...showCommentForm,
                          [review.review_id]: !showCommentForm[review.review_id]
                        })}
                      >
                        💬 Comment ({review.comments?.length || 0})
                      </button>
                    </div>

                    {review.comments && review.comments.length > 0 && (
                      <div className={styles.commentsList}>
                        {review.comments.map(comment => (
                          <div key={comment.comment_id} className={styles.comment}>
                            <div className={styles.commentUserInfo}>
                              <Link href={`/profile/${comment.user.user_id}`} className={styles.avatarLink}>
                                {comment.user.avatar ? (
                                  <Image
                                    src={comment.user.avatar}
                                    width={32}
                                    height={32}
                                    alt={comment.user.name}
                                    className={styles.commentAvatar}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : (
                                  <div className={styles.commentAvatarFallback}>
                                    {comment.user.name?.[0]?.toUpperCase() || '?'}
                                  </div>
                                )}
                              </Link>
                              <div className={styles.commentMain}>
                                <div className={styles.commentHeader}>
                                  <Link href={`/profile/${comment.user.user_id}`} className={styles.commentAuthor}>
                                    {comment.user.name}
                                  </Link>
                                  {userId === comment.user.user_id && (
                                    <button 
                                      className={styles.deleteCommentBtn}
                                      onClick={() => deleteComment(review.review_id, comment.comment_id)}
                                      title="Delete comment"
                                    >
                                      ×
                                    </button>
                                  )}
                                  {isAdmin && userId !== comment.user.user_id && (
                                    <button 
                                      className={styles.adminDeleteCommentBtn}
                                      onClick={() => adminDeleteComment(review.review_id, comment.comment_id)}
                                      title="Delete as admin"
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>
                                <div className={styles.commentText}>{comment.content}</div>
                                <div className={styles.commentDate}>
                                  {new Date(comment.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {showCommentForm[review.review_id] && (
                      <div className={styles.commentForm}>
                        <textarea
                          value={commentContent[review.review_id] || ""}
                          onChange={(e) => setCommentContent({
                            ...commentContent,
                            [review.review_id]: e.target.value
                          })}
                          placeholder="Write a comment..."
                          className={styles.commentTextarea}
                          rows={2}
                        />
                        <button 
                          className={styles.submitCommentBtn}
                          onClick={() => submitComment(review.review_id)}
                        >
                          Post Comment
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {showReviewModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>{userReview ? 'Edit your review' : 'Write a review'}</h3>
            
            <textarea
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              placeholder="Share your thoughts about this book..."
              className={styles.reviewTextarea}
              rows={6}
            />

            <div className={styles.modalActions}>
              <button 
                className={styles.cancelBtn}
                onClick={() => setShowReviewModal(false)}
              >
                Cancel
              </button>
              <button 
                className={styles.saveBtn}
                onClick={submitReview}
              >
                {userReview ? 'Update Review' : 'Post Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div className={`${styles.toast} ${message.includes('✓') || message.includes('Added') ? styles.success : styles.error}`}>
          {message}
        </div>
      )}
    </div>
  );
}