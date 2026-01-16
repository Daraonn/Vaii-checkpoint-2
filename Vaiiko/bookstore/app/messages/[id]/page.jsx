'use client'
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import './Messages.css';

const MessagesPage = () => {
  const params = useParams();
  const partnerId = params?.id;
  
  console.log('MessagesPage loaded - params:', params);
  console.log('Extracted partnerId:', partnerId);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const [partnerInfo, setPartnerInfo] = useState(null);
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchConversations();
    fetchBlockedUsers();
  }, []);

  useEffect(() => {
    if (partnerId) {
      fetchMessages();
      fetchPartnerInfo();
      markMessagesAsRead();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [partnerId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/token');
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/messages');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!partnerId) return;
    
    try {
      const res = await fetch(`/api/messages/${partnerId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setIsBlocked(false);
      } else if (res.status === 403) {
        const data = await res.json();
        if (data.blocked) {
          setIsBlocked(true);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const markMessagesAsRead = async () => {
    if (!partnerId) return;
    
    try {
      await fetch(`/api/messages/${partnerId}/read`, {
        method: 'POST'
      });
    } catch (err) {
      console.error('Error marking messages as read:', err);
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

  const fetchPartnerInfo = async () => {
    if (!partnerId) return;
    
    try {
      const res = await fetch(`/api/profile/${partnerId}`);
      if (res.ok) {
        const data = await res.json();
        setPartnerInfo(data.user);
      }
    } catch (err) {
      console.error('Error fetching partner info:', err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    console.log('Sending message:', { partnerId, messageContent: messageContent.substring(0, 20) });
    
    if (!messageContent.trim() || !partnerId || sending) {
      console.log('Message send blocked:', { 
        hasContent: !!messageContent.trim(), 
        hasPartnerId: !!partnerId, 
        isSending: sending 
      });
      return;
    }

    setSending(true);
    try {
      const url = `/api/messages/${partnerId}`;
      console.log('POST to:', url);
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: messageContent })
      });

      console.log('Response status:', res.status);

      if (res.ok) {
        setMessageContent('');
        await fetchMessages();
        await fetchConversations();
      } else {
        const data = await res.json();
        console.error('Send failed:', data);
        alert(data.error || 'Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const startEdit = (message) => {
    setEditingMessageId(message.message_id);
    setEditContent(message.content);
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditContent('');
  };

  const saveEdit = async (messageId) => {
    if (!editContent.trim()) return;

    try {
      const res = await fetch(`/api/messages/${partnerId}/${messageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent })
      });

      if (res.ok) {
        setEditingMessageId(null);
        setEditContent('');
        await fetchMessages();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to edit message');
      }
    } catch (err) {
      console.error('Error editing message:', err);
      alert('Failed to edit message');
    }
  };

  const deleteMessage = async (messageId) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const res = await fetch(`/api/messages/${partnerId}/${messageId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        await fetchMessages();
      } else {
        alert('Failed to delete message');
      }
    } catch (err) {
      console.error('Error deleting message:', err);
      alert('Failed to delete message');
    }
  };

  const blockUser = async (userId) => {
    if (!confirm('Are you sure you want to block this user?')) return;

    try {
      const res = await fetch('/api/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocked_id: userId })
      });

      if (res.ok) {
        await fetchBlockedUsers();
        setIsBlocked(true);
        alert('User blocked successfully');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to block user');
      }
    } catch (err) {
      console.error('Error blocking user:', err);
      alert('Failed to block user');
    }
  };

  const unblockUser = async (userId) => {
    if (!confirm('Are you sure you want to unblock this user?')) return;

    try {
      const res = await fetch(`/api/blocks/${userId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        await fetchBlockedUsers();
        setIsBlocked(false);
        alert('User unblocked successfully');
      } else {
        alert('Failed to unblock user');
      }
    } catch (err) {
      console.error('Error unblocking user:', err);
      alert('Failed to unblock user');
    }
  };

  const isUserBlocked = (userId) => {
    return blockedUsers.some(block => block.blocked.user_id === userId);
  };

  const getCurrentPartner = () => {
    if (!partnerId) return null;
    
    if (conversations.length > 0) {
      const conv = conversations.find(c => c.partner.user_id === parseInt(partnerId));
      if (conv) return conv.partner;
    }
    
    return partnerInfo;
  };

  const partner = getCurrentPartner();

  if (loading) {
    return (
      <div className="messages-container">
        <p>Loading messages...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="messages-container">
        <p>Please log in to view messages.</p>
      </div>
    );
  }

  return (
    <div className="messages-container">
      <div className="messages-layout">
        <aside className="conversations-sidebar">
          <div className="sidebar-header">
            <h2>Messages</h2>
          </div>
          
          <div className="conversations-list">
            {conversations.length === 0 ? (
              <p className="no-conversations">No conversations yet</p>
            ) : (
              conversations.map((conv) => (
                <Link
                  key={conv.partner.user_id}
                  href={`/messages/${conv.partner.user_id}`}
                  className={`conversation-item ${partnerId == conv.partner.user_id ? 'active' : ''}`}
                >
                  <div className="conversation-avatar">
                    {conv.partner.avatar ? (
                      <img src={conv.partner.avatar} alt={conv.partner.name} />
                    ) : (
                      <div className="avatar-fallback">
                        {conv.partner.name[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="conversation-info">
                    <div className="conversation-name">{conv.partner.name}</div>
                    <div className="conversation-last-message">
                      {conv.lastMessage.is_deleted 
                        ? '[Message deleted]' 
                        : conv.lastMessage.content.substring(0, 50) + (conv.lastMessage.content.length > 50 ? '...' : '')}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {blockedUsers.length > 0 && (
            <div className="blocked-section">
              <h3>Blocked Users</h3>
              {blockedUsers.map((block) => (
                <div key={block.block_id} className="blocked-user">
                  <span>{block.blocked.name}</span>
                  <button 
                    onClick={() => unblockUser(block.blocked.user_id)}
                    className="unblock-btn"
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          )}
        </aside>

        <main className="chat-area">
          {!partnerId ? (
            <div className="no-chat-selected">
              <p>Select a conversation to start messaging</p>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <div className="chat-header-user">
                  {partner && (
                    <>
                      <Link href={`/profile/${partner.user_id}`} className="partner-avatar">
                        {partner.avatar ? (
                          <img src={partner.avatar} alt={partner.name} />
                        ) : (
                          <div className="avatar-fallback">
                            {partner.name[0].toUpperCase()}
                          </div>
                        )}
                      </Link>
                      <Link href={`/profile/${partner.user_id}`} className="partner-name">
                        {partner.name}
                      </Link>
                    </>
                  )}
                </div>
                {partner && (
                  <button 
                    onClick={() => isUserBlocked(partner.user_id) 
                      ? unblockUser(partner.user_id) 
                      : blockUser(partner.user_id)}
                    className="block-btn"
                  >
                    {isUserBlocked(partner.user_id) ? 'Unblock' : 'Block User'}
                  </button>
                )}
              </div>

              <div className="messages-scroll" ref={chatContainerRef}>
                {isBlocked ? (
                  <div className="blocked-message">
                    You cannot message this user.
                  </div>
                ) : messages.length === 0 ? (
                  <div className="no-messages">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  <div className="messages-list">
                    {messages.map((msg) => {
                      const isOwn = msg.sender_id === currentUser.user_id;
                      const isEditing = editingMessageId === msg.message_id;

                      return (
                        <div 
                          key={msg.message_id} 
                          className={`message ${isOwn ? 'own' : 'other'} ${msg.is_deleted ? 'deleted' : ''}`}
                        >
                          {!isOwn && (
                            <div className="message-avatar">
                              {msg.sender.avatar ? (
                                <img src={msg.sender.avatar} alt={msg.sender.name} />
                              ) : (
                                <div className="avatar-fallback-small">
                                  {msg.sender.name[0].toUpperCase()}
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className="message-content-wrapper">
                            {isEditing ? (
                              <div className="message-edit">
                                <textarea
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  className="edit-textarea"
                                  rows={2}
                                />
                                <div className="edit-actions">
                                  <button onClick={() => saveEdit(msg.message_id)} className="save-btn">
                                    Save
                                  </button>
                                  <button onClick={cancelEdit} className="cancel-btn">
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="message-bubble">
                                  <p>{msg.content}</p>
                                  {msg.is_edited && !msg.is_deleted && (
                                    <span className="edited-label">(edited)</span>
                                  )}
                                </div>
                                <div className="message-time">
                                  {new Date(msg.createdAt).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </div>
                                {isOwn && !msg.is_deleted && (
                                  <div className="message-actions">
                                    <button 
                                      onClick={() => startEdit(msg)}
                                      className="edit-msg-btn"
                                      title="Edit"
                                    >
                                      ✏️
                                    </button>
                                    <button 
                                      onClick={() => deleteMessage(msg.message_id)}
                                      className="delete-msg-btn"
                                      title="Delete"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {!isBlocked && (
                <form onSubmit={sendMessage} className="message-input-form">
                  <textarea
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Type a message..."
                    className="message-input"
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage(e);
                      }
                    }}
                  />
                  <button 
                    type="submit" 
                    disabled={sending || !messageContent.trim()}
                    className="send-btn"
                  >
                    {sending ? 'Sending...' : 'Send'}
                  </button>
                </form>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default MessagesPage;