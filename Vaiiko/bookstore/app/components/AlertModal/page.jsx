// File: components/AlertModal/AlertModal.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './AlertModal.css';

export default function AlertModal({ isOpen, onClose }) {
  const router = useRouter();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAlerts();
    }
  }, [isOpen]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/alerts');
      if (res.ok) {
        const data = await res.json();
        // Show only first 10 alerts in modal
        setAlerts((data.alerts || []).slice(0, 10));
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
      await fetch('/api/alerts/markAllRead', {
        method: 'POST'
      });
      setAlerts(alerts.map(alert => ({ ...alert, is_read: true })));
    } catch (err) {
      console.error('Error marking all alerts as read:', err);
    }
  };

  const handleAlertClick = (alert) => {
    if (!alert.is_read) {
      markAsRead(alert.alert_id);
    }
    onClose();

    if (alert.type === 'FOLLOWING_REVIEWED' && alert.book_id) {
      router.push(`/book/${alert.book_id}`);
    } else if (alert.type === 'FOLLOWING_COMMENTED' && alert.review_id) {
      router.push(`/book/${alert.review?.book_id}#review-${alert.review_id}`);
    } else if (alert.type === 'COMMENT_ON_YOUR_REVIEW' && alert.review_id) {
      router.push(`/book/${alert.review?.book_id}#review-${alert.review_id}`);
    }
  };

  const handleViewAll = () => {
    onClose();
    router.push('/alerts');
  };

  const getAlertMessage = (alert) => {
    switch (alert.type) {
      case 'FOLLOWING_REVIEWED':
        return (
          <>
            <strong>{alert.actor.name}</strong> reviewed{' '}
            <strong>{alert.book?.name}</strong>
          </>
        );
      case 'FOLLOWING_COMMENTED':
        return (
          <>
            <strong>{alert.actor.name}</strong> commented on a review
          </>
        );
      case 'COMMENT_ON_YOUR_REVIEW':
        return (
          <>
            <strong>{alert.actor.name}</strong> commented on your review
          </>
        );
      default:
        return 'New notification';
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

  if (!isOpen) return null;

  return (
    <>
      <div className="alert-modal-overlay" onClick={onClose} />
      <div className="alert-modal">
        <div className="alert-modal-header">
          <h3>Notifications</h3>
          <button className="alert-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="alert-modal-actions">
          <button onClick={markAllAsRead} className="mark-all-read-btn-modal">
            Mark all as read
          </button>
        </div>

        <div className="alert-modal-content">
          {loading ? (
            <div className="alert-modal-loading">Loading...</div>
          ) : alerts.length === 0 ? (
            <div className="alert-modal-empty">No notifications</div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.alert_id}
                className={`alert-modal-item ${!alert.is_read ? 'unread' : ''}`}
                onClick={() => handleAlertClick(alert)}
              >
                <div className="alert-modal-item-avatar">
                  {alert.actor.avatar ? (
                    <img src={alert.actor.avatar} alt={alert.actor.name} />
                  ) : (
                    <div className="alert-modal-avatar-fallback">
                      {alert.actor.name[0].toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="alert-modal-item-content">
                  <p className="alert-modal-item-message">
                    {getAlertMessage(alert)}
                  </p>
                  <span className="alert-modal-item-time">
                    {getTimeAgo(alert.createdAt)}
                  </span>
                </div>

                {alert.book?.image && (
                  <div className="alert-modal-item-book">
                    <img src={alert.book.image} alt={alert.book.name} />
                  </div>
                )}

                {!alert.is_read && (
                  <div className="alert-modal-item-unread-dot"></div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="alert-modal-footer">
          <button onClick={handleViewAll} className="view-all-alerts-btn">
            View All Notifications
          </button>
        </div>
      </div>
    </>
  );
}