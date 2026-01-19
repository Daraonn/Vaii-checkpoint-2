'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../context/user';
import './community.css';

export default function CommunityPage() {
  const [threads, setThreads] = useState([]);
  const userContext = useUser();
  const user = userContext?.user || null;
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newThread, setNewThread] = useState({ title: '', content: '' });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchThreads();
    checkAdminStatus();
  }, [page]);

  const checkAdminStatus = async () => {
    try {
      const res = await fetch('/api/token');
      const data = await res.json();
      if (data.user) {
        setIsAdmin(data.user.isAdmin || false);
      }
    } catch (err) {
      console.error('Error checking admin status:', err);
    }
  };

  const fetchThreads = async () => {
    try {
      setLoading(true);
      console.log('Fetching threads from API...');
      const response = await fetch(`/api/threads?page=${page}&limit=10`);
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers.get('content-type'));
      
      const text = await response.text();
      console.log('Response text (first 200 chars):', text.substring(0, 200));
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse JSON:', e);
        console.error('Full response text:', text);
        throw new Error('Server returned invalid JSON. Check console for details.');
      }
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch threads');
      }
      
      setThreads(data.threads || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching threads:', error);
      setError(error.message || 'Failed to load threads');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateThread = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('You must be logged in to create a thread');
      return;
    }

    if (newThread.title.trim().length < 3) {
      setError('Title must be at least 3 characters long');
      return;
    }

    if (newThread.content.trim().length < 10) {
      setError('Content must be at least 10 characters long');
      return;
    }

    try {
      const response = await fetch('/api/threads/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newThread),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create thread');
      }

      setNewThread({ title: '', content: '' });
      setShowCreateModal(false);
      fetchThreads();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleAdminDeleteThread = async (threadId, e) => {
    e.stopPropagation(); 
    
    if (!isAdmin) return;
    
    if (!confirm('Are you sure you want to delete this thread as admin? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/threads/${threadId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete thread');
      }

      setSuccessMessage('✓ Thread deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchThreads();
    } catch (error) {
      setError(error.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (loading && threads.length === 0) {
    return (
      <div className="community-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="community-container">
      <div className="community-content">
        <div className="community-header">
          <div className="header-text">
            <h1>Community Forum</h1>
            <p>Share your thoughts and connect with other book lovers</p>
          </div>
          {user && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              New Thread
            </button>
          )}
        </div>

        {error && (
          <div className="error-message" style={{ marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {successMessage && (
          <div className="success-message" style={{ marginBottom: '20px', backgroundColor: '#d4edda', color: '#155724', padding: '12px', borderRadius: '6px' }}>
            {successMessage}
          </div>
        )}

        <div className="threads-list">
          {threads.length === 0 ? (
            <div className="empty-state">
              <p>No threads yet. Be the first to start a discussion!</p>
            </div>
          ) : (
            threads.map((thread) => (
              <div
                key={thread.thread_id}
                className="thread-card"
              >
                <div 
                  className="thread-content"
                  onClick={() => router.push(`/community/${thread.thread_id}`)}
                  style={{ cursor: 'pointer', flex: 1 }}
                >
                  <div className="thread-avatar">
                    {thread.user.avatar ? (
                      <img src={thread.user.avatar} alt={thread.user.name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {thread.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="thread-details">
                    <h2>{thread.title}</h2>
                    <p className="thread-excerpt">{thread.content}</p>
                    <div className="thread-meta">
                      <span className="author">{thread.user.name}</span>
                      <span className="separator">•</span>
                      <span>{formatDate(thread.createdAt)}</span>
                      <span className="separator">•</span>
                      <span>{thread.commentCount} {thread.commentCount === 1 ? 'comment' : 'comments'}</span>
                    </div>
                  </div>
                </div>
                
                {isAdmin && user && user.user_id !== thread.user_id && (
                  <button
                    className="admin-delete-thread-btn"
                    onClick={(e) => handleAdminDeleteThread(thread.thread_id, e)}
                    title="Delete thread as admin"
                  >
                    🗑️ Admin Delete
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary"
            >
              Previous
            </button>
            <span className="page-info">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-secondary"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Thread</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateThread}>
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  type="text"
                  value={newThread.title}
                  onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                  placeholder="Enter thread title"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="content">Content</label>
                <textarea
                  id="content"
                  value={newThread.content}
                  onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                  placeholder="Share your thoughts..."
                  rows="6"
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Thread
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}