'use client'
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import '../ProfilePage.css';

const ProfilePage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const profileId = params?.id?.[0];
  
  const [currentUser, setCurrentUser] = useState(null);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState(tabParam || 'overview');
  const [favouriteBooks, setFavouriteBooks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [follows, setFollows] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/token');
        const data = await res.json();
        
        if (!data.user) {
          setLoading(false);
          return;
        }

        setCurrentUser(data.user);
        const loggedInUserId = data.user.user_id || data.user.id;
        
        let targetUserId;
        let viewingOwnProfile = false;
        
        if (profileId) {
          targetUserId = parseInt(profileId);
          viewingOwnProfile = (loggedInUserId === targetUserId);
        } else {
          targetUserId = loggedInUserId;
          viewingOwnProfile = true;
        }
        
        setIsOwnProfile(viewingOwnProfile);

        if (!profileId) {
          setUser(data.user);
        } else {
          const userRes = await fetch(`/api/profile/${targetUserId}`);
          if (userRes.ok) {
            const userData = await userRes.json();
            setUser(userData.user);
          } else {
            console.error('User fetch failed');
            setLoading(false);
            return;
          }
        }

        // Fetch favorites
        try {
          const favRes = await fetch(`/api/user/${targetUserId}/favorites`);
          if (favRes.ok) {
            const favData = await favRes.json();
            console.log('Favorites for user', targetUserId, ':', favData.favorites?.length || 0);
            setFavouriteBooks(favData.favorites || []);
          }
        } catch (err) {
          setFavouriteBooks([]);
        }

        // Fetch reviews
        try {
          const reviewsRes = await fetch(`/api/user/${targetUserId}/reviews`);
          if (reviewsRes.ok) {
            const reviewsData = await reviewsRes.json();
            console.log('Reviews for user', targetUserId, ':', reviewsData.reviews?.length || 0);
            setReviews(reviewsData.reviews || []);
          }
        } catch (err) {
          setReviews([]);
        }

        // Fetch follows (people this user follows)
        try {
          const followsRes = await fetch(`/api/user/${targetUserId}/follows`);
          if (followsRes.ok) {
            const followsData = await followsRes.json();
            console.log('Following for user', targetUserId, ':', followsData.follows?.length || 0);
            setFollows(followsData.follows || []);
          }
        } catch (err) {
          setFollows([]);
        }

        // Fetch ratings
        try {
          const ratingsRes = await fetch(`/api/user/${targetUserId}/ratings`);
          if (ratingsRes.ok) {
            const ratingsData = await ratingsRes.json();
            console.log('Ratings for user', targetUserId, ':', ratingsData.ratings?.length || 0);
            setRatings(ratingsData.ratings || []);
          }
        } catch (err) {
          setRatings([]);
        }

        // Check if following (only if viewing someone else's profile)
        if (!viewingOwnProfile && profileId) {
          try {
            const followCheckRes = await fetch(`/api/user/${loggedInUserId}/follows`);
            if (followCheckRes.ok) {
              const followData = await followCheckRes.json();
              const following = followData.follows?.some(
                f => f.following.user_id === targetUserId
              );
              setIsFollowing(following);
            }
          } catch (err) {
            console.error('Error checking follow status:', err);
          }
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [profileId]);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: i <= rating ? '#d4a574' : '#ddd', fontSize: '18px' }}>
          ★
        </span>
      );
    }
    return stars;
  };

  const handleFollowToggle = async () => {
    if (!currentUser || !profileId) {
      console.error('Missing data:', { currentUser, profileId });
      return;
    }

    const myUserId = currentUser.user_id || currentUser.id;
    const targetProfileId = parseInt(profileId); 
    
    console.log('Attempting to follow/unfollow:', {
      myUserId,
      profileId: targetProfileId,
      isFollowing,
      url: `/api/user/${myUserId}/follows`
    });

    setFollowLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        const res = await fetch(`/api/user/${myUserId}/follows/${targetProfileId}`, {
          method: 'DELETE'
        });

        console.log('Unfollow response:', res.status);

        if (res.ok) {
          setIsFollowing(false);
          // Update followers count
          const followersRes = await fetch(`/api/user/${targetProfileId}/followers`);
          if (followersRes.ok) {
            const followersData = await followersRes.json();
            setFollowers(followersData.followers || []);
          }
        } else {
          const errorData = await res.json();
          console.error('Unfollow failed:', errorData);
          alert('Failed to unfollow: ' + (errorData.error || 'Unknown error'));
        }
      } else {
        // Follow
        const res = await fetch(`/api/user/${myUserId}/follows`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ following_id: targetProfileId })
        });

        console.log('Follow response:', res.status);

        if (res.ok) {
          setIsFollowing(true);
          // Update followers count
          const followersRes = await fetch(`/api/user/${targetProfileId}/followers`);
          if (followersRes.ok) {
            const followersData = await followersRes.json();
            setFollowers(followersData.followers || []);
          }
        } else {
          const errorData = await res.json();
          console.error('Follow failed:', errorData);
          alert('Failed to follow: ' + (errorData.error || 'Unknown error'));
        }
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
      alert('An error occurred: ' + err.message);
    } finally {
      setFollowLoading(false);
    }
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <>
            {user.bio && (
              <section className="section">
                <h2 className="section-title">
                  <span className="section-icon">📝</span> About
                </h2>
                <p style={{ color: '#555', lineHeight: '1.6', fontSize: '15px' }}>{user.bio}</p>
              </section>
            )}

            <section className="section">
              <h2 className="section-title">
                <span className="section-icon">📈</span> Activity
              </h2>
              
              <div className="activity-list">
                <div className="activity-item">
                  <span className="activity-label">Followers</span>
                  <span className="activity-value">{followers.length}</span>
                </div>
                
                <div className="activity-item">
                  <span className="activity-label">Following</span>
                  <span className="activity-value">{follows.length}</span>
                </div>
                
                <div className="activity-item">
                  <span className="activity-label">Favorites</span>
                  <span className="activity-value">{favouriteBooks.length}</span>
                </div>
                
                <div className="activity-item">
                  <span className="activity-label">Ratings</span>
                  <span className="activity-value">{ratings.length}</span>
                </div>
                
                <div className="activity-item">
                  <span className="activity-label">Reviews</span>
                  <span className="activity-value">{reviews.length}</span>
                </div>
                
                <div className="activity-item no-border">
                  <span className="activity-label">Comments</span>
                  <span className="activity-value">0</span>
                </div>
              </div>
            </section>

            {isOwnProfile && (
              <section className="section">
                <h2 className="section-title">
                  <span className="section-icon">👤</span> Personal Information
                </h2>
                
                <div className="info-list">
                  <div className="info-item">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{user.email}</span>
                  </div>
                  
                  <div className="info-item no-border">
                    <span className="info-label">Joined:</span>
                    <span className="info-value">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      }) : 'N/A'}
                    </span>
                  </div>
                </div>
              </section>
            )}
          </>
        );

      case 'ratings':
        return (
          <section className="section">
            <h2 className="section-title">
              <span className="section-icon">⭐</span> Book Ratings ({ratings.length})
            </h2>
            
            {ratings.length === 0 ? (
              <p className="empty-message">{isOwnProfile ? "You haven't rated any books yet." : "No ratings yet."}</p>
            ) : (
              <div className="ratings-list">
                {ratings.map(rating => (
                  <Link href={`/book/${rating.book.book_id}`} key={rating.rating_id} className="rating-card">
                    <div className="rating-book-image">
                      <img src={rating.book.image || '/placeholder.png'} alt={rating.book.name} />
                    </div>
                    <div className="rating-book-info">
                      <h3 className="rating-book-title">{rating.book.name}</h3>
                      <p className="rating-book-author">by {rating.book.author}</p>
                      <div className="rating-stars">
                        {renderStars(rating.stars)}
                      </div>
                      {rating.status && (
                        <span className="rating-status">{rating.status.replace(/_/g, ' ')}</span>
                      )}
                      <div className="rating-date">
                        {new Date(rating.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        );

      case 'favorites':
        return (
          <section className="section">
            <h2 className="section-title">
              <span className="section-icon">❤️</span> Favorite Books ({favouriteBooks.length})
            </h2>
            
            {favouriteBooks.length === 0 ? (
              <p className="empty-message">{isOwnProfile ? "You haven't added any favorite books yet." : "No favorite books yet."}</p>
            ) : (
              <div className="books-grid">
                {favouriteBooks.map(fav => (
                  <Link href={`/book/${fav.book.book_id}`} key={fav.book.book_id} className="book-card">
                    <div className="book-card-image">
                      <img src={fav.book.image || '/placeholder.png'} alt={fav.book.name} />
                    </div>
                    <div className="book-card-info">
                      <h3 className="book-card-title">{fav.book.name}</h3>
                      <p className="book-card-author">by {fav.book.author}</p>
                      {fav.book.year && <p className="book-card-year">{fav.book.year}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        );

      case 'reviews':
        return (
          <section className="section">
            <h2 className="section-title">
              <span className="section-icon">📝</span> Reviews ({reviews.length})
            </h2>
            
            {reviews.length === 0 ? (
              <p className="empty-message">{isOwnProfile ? "You haven't written any reviews yet." : "No reviews yet."}</p>
            ) : (
              <div className="reviews-list">
                {reviews.map(review => (
                  <div key={review.review_id} className="review-card">
                    <div className="review-header">
                      <Link href={`/book/${review.book.book_id}`} className="review-book-link">
                        <div className="review-book-image">
                          <img src={review.book.image || '/placeholder.png'} alt={review.book.name} />
                        </div>
                        <div className="review-book-info">
                          <h3 className="review-book-title">{review.book.name}</h3>
                          <p className="review-book-author">by {review.book.author}</p>
                        </div>
                      </Link>
                      <div className="review-date">
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                    <div className="review-content">
                      <p>{review.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        );

      case 'follows':
        return (
          <section className="section">
            <h2 className="section-title">
              <span className="section-icon">👥</span> Following ({follows.length})
            </h2>
            
            {follows.length === 0 ? (
              <p className="empty-message">{isOwnProfile ? "You're not following anyone yet." : "Not following anyone yet."}</p>
            ) : (
              <div className="follows-list">
                {follows.map(follow => (
                  <Link href={`/profile/${follow.following.user_id}`} key={follow.follow_id} className="follow-card">
                    <div className="follow-avatar">
                      {follow.following.avatar ? (
                        <img src={follow.following.avatar} alt={follow.following.name} className="follow-avatar-image" />
                      ) : (
                        <div className="follow-avatar-fallback">{follow.following.name[0].toUpperCase()}</div>
                      )}
                    </div>
                    <div className="follow-info">
                      <h3 className="follow-name">{follow.following.name}</h3>
                      <p className="follow-email">{follow.following.email}</p>
                      <p className="follow-date">
                        Following since {new Date(follow.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        );

      default:
        return null;
    }
  };

  if (loading) return (
    <div className="loading-container">
      <p className="loading-text">Loading profile...</p>
    </div>
  );

  if (!user) return (
    <div className="loading-container">
      <p className="loading-text">{currentUser ? "User not found." : "Please log in to view profiles."}</p>
    </div>
  );

  return (
    <div className="profile-container">
      <div className="profile-banner">
        <div className="avatar-wrapper">
          <div className="avatar-container">
            <div className="decorative-frame"></div>
            <div className="profile-avatar">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="avatar-image" onError={(e) => { e.target.onerror = null; e.target.src = "/profile-picture.png"; }} />
              ) : (
                <div className="avatar-fallback">{user.name[0].toUpperCase()}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-number">{followers.length}</div>
          <div className="stat-label">Followers</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{follows.length}</div>
          <div className="stat-label">Following</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{favouriteBooks.length}</div>
          <div className="stat-label">Favorites</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{ratings.length}</div>
          <div className="stat-label">Ratings</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{reviews.length}</div>
          <div className="stat-label">Reviews</div>
        </div>
      </div>

      <div className="username-section">
        <h1 className="username">{user.name}</h1>
        {!isOwnProfile && currentUser && (
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px', justifyContent: 'center' }}>
            <button 
              onClick={handleFollowToggle}
              disabled={followLoading}
              style={{ 
                padding: '8px 20px', 
                background: isFollowing ? '#6c757d' : '#d4a574', 
                color: 'white', 
                border: 'none',
                borderRadius: '6px', 
                fontSize: '14px',
                cursor: followLoading ? 'not-allowed' : 'pointer',
                opacity: followLoading ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
            >
              {followLoading ? 'Loading...' : (isFollowing ? 'Unfollow' : 'Follow')}
            </button>
            <Link 
              href={`/messages/${user.user_id}`}
              style={{ 
                padding: '8px 20px', 
                background: '#28a745', 
                color: 'white', 
                border: 'none',
                borderRadius: '6px', 
                fontSize: '14px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                transition: 'all 0.2s'
              }}
            >
              Message
            </Link>
          </div>
        )}
      </div>

      <div className="main-content">
        <aside className="sidebar">
          <nav className="nav">
            <button onClick={() => setActiveTab('overview')} className={`nav-button ${activeTab === 'overview' ? 'active' : ''}`}>
              📊 Overview
            </button>
            <button onClick={() => setActiveTab('ratings')} className={`nav-button ${activeTab === 'ratings' ? 'active' : ''}`}>
              ⭐ Ratings
            </button>
            <button onClick={() => setActiveTab('reviews')} className={`nav-button ${activeTab === 'reviews' ? 'active' : ''}`}>
              📝 Reviews
            </button>
            <button onClick={() => setActiveTab('favorites')} className={`nav-button ${activeTab === 'favorites' ? 'active' : ''}`}>
              ❤️ Favorites
            </button>
            <button onClick={() => setActiveTab('follows')} className={`nav-button ${activeTab === 'follows' ? 'active' : ''}`}>
              👥 Following
            </button>
          </nav>
        </aside>

        <main className="content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;