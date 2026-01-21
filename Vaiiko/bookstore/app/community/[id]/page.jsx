'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '../../context/user';
import './thread.css';

export default function ThreadDetailPage() {
  const [thread, setThread] = useState(null);
  const userContext = useUser();
  const user = userContext?.user || null;
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [editingThread, setEditingThread] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [commentPage, setCommentPage] = useState(1);
  const [commentsPerPage] = useState(10);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const router = useRouter();
  const params = useParams();
  const threadId = params.id;

  useEffect(() => {
    if (threadId) {
      fetchThread();
      checkAdminStatus();
      fetchBlockedUsers();
    }
  }, [threadId]);

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

  const fetchBlockedUsers = async () => {
    try {
      const res = await fetch('/api/blocks');
      if (res.ok) {
        const data = await res.json();
        setBlockedUsers(data.blocks || []);
      }
    } catch (err) {
      console.error('Error fetching blocked users:', err);
    }
  };

  const isUserBlocked = (userId) => {
    return blockedUsers.some(block => block.blocked.user_id === userId);
  };

  const fetchThread = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/threads/${threadId}`);
      if (!response.ok) throw new Error('Thread not found');
      const data = await response.json();
      setThread(data);
      setIsFollowing(data.isFollowing || false);
    } catch (error) {
      console.error('Error fetching thread:', error);
      setError('Failed to load thread');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to comment');
      return;
    }

    if (newComment.trim().length < 1) {
      setError('Comment cannot be empty');
      return;
    }

    try {
      const response = await fetch(`/api/threads/${threadId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      });

      if (!response.ok) throw new Error('Failed to add comment');

      setNewComment('');
      setError('');
      fetchThread();
      const newTotalPages = Math.ceil((thread.comments.length + 1) / commentsPerPage);
      setCommentPage(newTotalPages);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEditThread = async () => {
    try {
      const response = await fetch(`/api/threads/${threadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingThread),
      });

      if (!response.ok) throw new Error('Failed to update thread');

      setEditingThread(null);
      setError('');
      fetchThread();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteThread = async () => {
    if (!confirm('Are you sure you want to delete this thread?')) return;

    try {
      const response = await fetch(`/api/threads/${threadId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete thread');

      router.push('/community');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleAdminDeleteThread = async () => {
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

      router.push('/community');
    } catch (error) {
      setError(error.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleEditComment = async (id) => {
    try {
      const response = await fetch(`/api/threads/comments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editingComment.content }),
      });

      if (!response.ok) throw new Error('Failed to update comment');

      setEditingComment(null);
      setError('');
      fetchThread();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteComment = async (id) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(`/api/threads/comments/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete comment');

      fetchThread();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleAdminDeleteComment = async (id) => {
    if (!isAdmin) return;
    
    if (!confirm('Are you sure you want to delete this comment as admin? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/threadComments/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete comment');
      }

      setSuccessMessage('✓ Comment deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchThread();
    } catch (error) {
      setError(error.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleToggleFollow = async () => {
    if (!user) {
      setError('You must be logged in to follow threads');
      return;
    }

    try {
      setFollowLoading(true);
      const method = isFollowing ? 'DELETE' : 'POST';
      const response = await fetch(`/api/threads/${threadId}/follow`, {
        method,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update follow status');
      }

      setIsFollowing(!isFollowing);
    } catch (error) {
      setError(error.message);
    } finally {
      setFollowLoading(false);
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

  const totalComments = thread?.comments?.length || 0;
  const totalPages = Math.ceil(totalComments / commentsPerPage);
  const startIndex = (commentPage - 1) * commentsPerPage;
  const endIndex = startIndex + commentsPerPage;
  const paginatedComments = thread?.comments?.slice(startIndex, endIndex) || [];

  if (loading) {
    return (
      <div className="thread-detail-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="thread-detail-container">
        <div className="error-state">Thread not found</div>
      </div>
    );
  }

  return (
    <div className="thread-detail-container">
      <div className="thread-detail-content">
        <button onClick={() => router.push('/community')} className="back-button">
          ← Back to Forum
        </button>

        {user && (
          <button
            onClick={handleToggleFollow}
            disabled={followLoading}
            className={`follow-button ${isFollowing ? 'following' : ''}`}
          >
            {followLoading ? 'Loading...' : isFollowing ? '✓ Following' : '+ Follow Thread'}
          </button>
        )}

        {error && <div className="error-message">{error}</div>}
        {successMessage && (
          <div className="success-message" style={{ backgroundColor: '#d4edda', color: '#155724', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>
            {successMessage}
          </div>
        )}

        <div className="thread-main">
          <div className="thread-header-section">
            <div 
              className="user-info"
              onClick={() => !isUserBlocked(thread.user.user_id) && router.push(`/profile/${thread.user.user_id}`)}
              style={{ cursor: isUserBlocked(thread.user.user_id) ? 'default' : 'pointer' }}
            >
              {isUserBlocked(thread.user.user_id) ? (
                <>
                  <div className="avatar-placeholder">B</div>
                  <div className="user-details">
                    <span className="user-name">Blocked User</span>
                    <span className="post-time">{formatDate(thread.createdAt)}</span>
                  </div>
                </>
              ) : (
                <>
                  {thread.user.avatar ? (
                    <img src={thread.user.avatar} alt={thread.user.username || thread.user.name} className="user-avatar" />
                  ) : (
                    <div className="avatar-placeholder">
                      {(thread.user.username || thread.user.name)?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="user-details">
                    <span className="user-name">{thread.user.username || thread.user.name}</span>
                    <span className="post-time">{formatDate(thread.createdAt)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="thread-actions">
              {user && user.user_id === thread.user_id && !editingThread && (
                <>
                  <button
                    onClick={() => setEditingThread({ title: thread.title, content: thread.content })}
                    className="action-button edit-btn"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteThread}
                    className="action-button delete-btn"
                  >
                    Delete
                  </button>
                </>
              )}
              
              {isAdmin && user && user.user_id !== thread.user_id && (
                <button
                  onClick={handleAdminDeleteThread}
                  className="action-button admin-delete"
                  title="Delete thread as admin"
                  style={{ 
                  backgroundColor: '#dc3545', 
                  color: 'white',
                  border: 'none'
                }}
                 
                >
                  Admin Delete
                </button>
              )}
            </div>
          </div>

          {editingThread ? (
            <div className="edit-form">
              <input
                type="text"
                value={editingThread.title}
                onChange={(e) => setEditingThread({ ...editingThread, title: e.target.value })}
                className="edit-input"
              />
              <textarea
                value={editingThread.content}
                onChange={(e) => setEditingThread({ ...editingThread, content: e.target.value })}
                className="edit-textarea"
                rows="6"
              />
              <div className="edit-actions">
                <button onClick={() => setEditingThread(null)} className="btn-secondary">
                  Cancel
                </button>
                <button onClick={handleEditThread} className="btn-primary">
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="thread-title">{thread.title}</h1>
              <p className="thread-content">
                {isUserBlocked(thread.user.user_id) ? '[Content hidden - User blocked]' : thread.content}
              </p>
            </>
          )}
        </div>

        <div className="comments-section">
          <h2 className="comments-header">
            {thread.comments.length} {thread.comments.length === 1 ? 'Comment' : 'Comments'}
          </h2>

          <div className="comments-list">
            {paginatedComments.length === 0 ? (
              <div className="empty-comments">
                <p>No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              paginatedComments.map((comment) => {
                const commentBlocked = isUserBlocked(comment.user.user_id);
                
                return (
                  <div key={comment.comment_id} className="comment">
                    <div className="comment-header">
                      <div 
                        className="comment-user-info"
                        onClick={() => !commentBlocked && router.push(`/profile/${comment.user.user_id}`)}
                        style={{ cursor: commentBlocked ? 'default' : 'pointer' }}
                      >
                        {commentBlocked ? (
                          <>
                            <div className="avatar-placeholder small">B</div>
                            <div className="comment-user-details">
                              <span className="comment-user-name">Blocked User</span>
                              <span className="comment-time">{formatDate(comment.createdAt)}</span>
                            </div>
                          </>
                        ) : (
                          <>
                            {comment.user.avatar ? (
                              <img src={comment.user.avatar} alt={comment.user.username || comment.user.name} className="comment-avatar" />
                            ) : (
                              <div className="avatar-placeholder small">
                                {(comment.user.username || comment.user.name)?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                            )}
                            <div className="comment-user-details">
                              <span className="comment-user-name">{comment.user.username || comment.user.name}</span>
                              <span className="comment-time">{formatDate(comment.createdAt)}</span>
                              {comment.updatedAt !== comment.createdAt && (
                                <span className="edited-badge">(edited)</span>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      <div className="comment-actions">
                        {user && user.user_id === comment.user_id && !editingComment && (
                          <>
                            <button
                              onClick={() => setEditingComment({ id: comment.comment_id, content: comment.content })}
                              className="action-button edit-btn small"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment.comment_id)}
                              className="action-button delete-btn small"
                            >
                              Delete
                            </button>
                          </>
                        )}
                        
                        {isAdmin && user && user.user_id !== comment.user_id && (
                          <button
                            onClick={() => handleAdminDeleteComment(comment.comment_id)}
                            className="action-button admin-delete"
                            title="Delete comment as admin"

                            style={{ 
                              backgroundColor: '#dc3545', 
                              color: 'white',
                              border: 'none'
                            }}
                          >
                            Admin Delete
                          </button>
                        )}
                      </div>
                    </div>

                    {editingComment && editingComment.id === comment.comment_id ? (
                      <div className="edit-comment-form">
                        <textarea
                          value={editingComment.content}
                          onChange={(e) => setEditingComment({ ...editingComment, content: e.target.value })}
                          className="edit-textarea"
                          rows="3"
                        />
                        <div className="edit-actions">
                          <button onClick={() => setEditingComment(null)} className="btn-secondary small">
                            Cancel
                          </button>
                          <button onClick={() => handleEditComment(comment.comment_id)} className="btn-primary small">
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="comment-content">
                        {commentBlocked ? '[Comment hidden - User blocked]' : comment.content}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {totalPages > 1 && (
            <div className="comment-pagination">
              <button
                onClick={() => setCommentPage(p => Math.max(1, p - 1))}
                disabled={commentPage === 1}
                className="btn-secondary small"
              >
                Previous
              </button>
              <span className="page-info">
                Page {commentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCommentPage(p => Math.min(totalPages, p + 1))}
                disabled={commentPage === totalPages}
                className="btn-secondary small"
              >
                Next
              </button>
            </div>
          )}

          {user ? (
            <form onSubmit={handleAddComment} className="comment-form comment-form-bottom">
              <div className="comment-input-wrapper">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username || user.name} className="comment-avatar" />
                ) : (
                  <div className="avatar-placeholder small">
                    {(user.username || user.name)?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="comment-input"
                  rows="3"
                />
              </div>
              <div className="comment-form-actions">
                <button type="submit" className="btn-primary">
                  Post Comment
                </button>
              </div>
            </form>
          ) : (
            <div className="login-prompt">
              Please log in to comment
            </div>
          )}
        </div>
      </div>
    </div>
  );
}