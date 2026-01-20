'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './Alerts.css';

const AlertsPage = () => {
  const router = useRouter();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/alerts');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertId) => {
    try {
      await fetch(`/api/alerts/${alertId}`, {
        method: 'PUT'
      });
      setAlerts(alerts.map(alert => 
        alert.alert_id === alertId ? { ...alert, is_read: true } : alert
      ));
    } catch (err) {
      console.error('Error marking alert as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/alerts/mark-all-read', {
        method: 'POST'
      });
      setAlerts(alerts.map(alert => ({ ...alert, is_read: true })));
    } catch (err) {
      console.error('Error marking all alerts as read:', err);
    }
  };

  const deleteAlert = async (alertId) => {
    try {
      await fetch(`/api/alerts/${alertId}`, {
        method: 'DELETE'
      });
      setAlerts(alerts.filter(alert => alert.alert_id !== alertId));
    } catch (err) {
      console.error('Error deleting alert:', err);
    }
  };

 const handleAlertClick = (alert) => {
    if (!alert.is_read) {
      markAsRead(alert.alert_id);
    }

  
    if (alert.type === 'THREAD_COMMENT' && alert.thread_id) {
      router.push(`/community/${alert.thread_id}`);
    } else if (alert.type === 'FOLLOWED_USER_THREAD' && alert.thread_id) {
      router.push(`/community/${alert.thread_id}`);
    }
    
    else if (alert.type === 'FOLLOWING_REVIEWED' && alert.book_id) {
      router.push(`/book/${alert.book_id}`);
    } else if (alert.type === 'FOLLOWING_COMMENTED' && alert.review_id) {
      router.push(`/book/${alert.review?.book_id}#review-${alert.review_id}`);
    } else if (alert.type === 'COMMENT_ON_YOUR_REVIEW' && alert.review_id) {
      router.push(`/book/${alert.review?.book_id}#review-${alert.review_id}`);
    }
  };

const getAlertMessage = (alert) => {
  switch (alert.type) {
    case 'THREAD_COMMENT':
      return (
        <>
          <strong>{alert.actor.username || alert.actor.name}</strong> commented on a thread you're following
          {alert.thread?.title && (
            <span className="alert-thread-title-inline">: "{alert.thread.title}"</span>
          )}
        </>
      );
    case 'FOLLOWED_USER_THREAD':
      return (
        <>
          <strong>{alert.actor.name}</strong> created a new thread
          {alert.thread?.title && (
            <span className="alert-thread-title-inline">: "{alert.thread.title}"</span>
          )}
        </>
      );
    case 'FOLLOWING_REVIEWED':
      return (
        <>
          <strong>{alert.actor.username || alert.actor.name}</strong> reviewed{' '}
          <strong>{alert.book?.name}</strong>
        </>
      );
    case 'FOLLOWING_COMMENTED':
      return (
        <>
          <strong>{alert.actor.username || alert.actor.name}</strong> commented on a review
        </>
      );
    case 'COMMENT_ON_YOUR_REVIEW':
      return (
        <>
          <strong>{alert.actor.username || alert.actor.name}</strong> commented on your review
        </>
      );
    default:
      return 'New notification';
  }
};


const getAlertIcon = (alert) => {
  switch (alert.type) {
    case 'THREAD_COMMENT':
      return '💬';
    case 'FOLLOWED_USER_THREAD':
      return '📝';
    case 'FOLLOWING_REVIEWED':
      return '⭐';
    case 'FOLLOWING_COMMENTED':
    case 'COMMENT_ON_YOUR_REVIEW':
      return '💭';
    default:
      return '🔔';
  }
};

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const filteredAlerts = filter === 'unread' 
    ? alerts.filter(alert => !alert.is_read)
    : alerts;

  if (loading) {
    return (
      <div className="alerts-container">
        <p>Loading alerts...</p>
      </div>
    );
  }

  return (
    <div className="alerts-container">
      <div className="alerts-header">
        <h1>Notifications</h1>
        <div className="alerts-actions">
          <div className="alerts-filter">
            <button 
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={filter === 'unread' ? 'active' : ''}
              onClick={() => setFilter('unread')}
            >
              Unread
            </button>
          </div>
          {alerts.some(a => !a.is_read) && (
            <button onClick={markAllAsRead} className="mark-all-read-btn">
              Mark all as read
            </button>
          )}
        </div>
      </div>

      <div className="alerts-list">
        {filteredAlerts.length === 0 ? (
          <div className="no-alerts">
            <p>{filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div 
              key={alert.alert_id}
              className={`alert-item ${!alert.is_read ? 'unread' : ''}`}
            >
              <div 
                className="alert-content"
                onClick={() => handleAlertClick(alert)}
              >
                <div className="alert-icon-container">
                  <span className="alert-type-icon">{getAlertIcon(alert)}</span>
                </div>

                <div className="alert-avatar">
                  {alert.actor.avatar ? (
                    <img src={alert.actor.avatar} alt={alert.actor.username || alert.actor.name} />
                  ) : (
                    <div className="avatar-fallback">
                      {(alert.actor.username || alert.actor.name)[0].toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="alert-text">
                  <p className="alert-message">{getAlertMessage(alert)}</p>
                  <span className="alert-time">{getTimeAgo(alert.createdAt)}</span>
                </div>

                {alert.book?.image && (
                  <div className="alert-book-image">
                    <img src={alert.book.image} alt={alert.book.name} />
                  </div>
                )}
              </div>

              <div className="alert-actions">
                {!alert.is_read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(alert.alert_id);
                    }}
                    className="mark-read-btn"
                    title="Mark as read"
                  >
                    ✓
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteAlert(alert.alert_id);
                  }}
                  className="delete-alert-btn"
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertsPage;