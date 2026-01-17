'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import DeleteUserButton from './userdeletebutton'; 
import './adminusers.css';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/users');
        const data = await res.json();
        
        let filteredUsers = data.users || [];
        
        // Client-side filtering if search is active
        if (debouncedSearch) {
          filteredUsers = filteredUsers.filter(user => 
            user.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            user.email?.toLowerCase().includes(debouncedSearch.toLowerCase())
          );
        }
        
        setUsers(filteredUsers);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [debouncedSearch]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const adminCount = users.filter(u => u.isAdmin).length;
  const regularCount = users.length - adminCount;

  return (
    <div className="admin-users-page">
      <div className="admin-users-container">
        {/* Header Section */}
        <div className="page-header">
          <div className="header-content">
            <h1>User Management</h1>
            <p className="header-subtitle">Manage user accounts and permissions</p>
          </div>
          <Link href="/admin/users/add">
            <button className="btn-add-user">
              <span className="btn-icon">+</span>
              Add New User
            </button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{loading ? '...' : users.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Administrators</div>
            <div className="stat-value">{loading ? '...' : adminCount}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Regular Users</div>
            <div className="stat-value">{loading ? '...' : regularCount}</div>
          </div>
        </div>

        {/* Users Table */}
        <div className="table-container">
          <div className="table-header">
            <h2>All Users</h2>
            <div className="table-actions">
              <div className="search-wrapper">
                <input 
                  type="search" 
                  placeholder="Search by name or email..." 
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
                <p>Loading users...</p>
              </div>
            ) : (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User Details</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="empty-state">
                        <div className="empty-content">
                          <p>{searchQuery ? `No users found for "${searchQuery}"` : 'No users found'}</p>
                          {!searchQuery && (
                            <Link href="/admin/users/add">
                              <button className="btn-secondary">Add Your First User</button>
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
                    users.map((u) => (
                      <tr key={u.user_id}>
                        <td>
                          <span className="user-id">#{u.user_id}</span>
                        </td>
                        <td>
                          <div className="user-details">
                            <img 
                              src={u.avatar || '/default-avatar.png'} 
                              alt={u.name}
                              className="user-avatar"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="user-avatar-fallback" style={{ display: 'none' }}>
                              {u.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="user-info">
                              <span className="user-name">{u.name}</span>
                              <span className="user-meta">
                                Joined {new Date(u.createdAt || Date.now()).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="user-email">{u.email}</span>
                        </td>
                        <td>
                          <span className={`role-badge ${u.isAdmin ? 'admin' : 'user'}`}>
                            {u.isAdmin ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <Link href={`/admin/users/edit/${u.user_id}`}>
                              <button className="btn-edit" title="Edit user">
                                Edit
                              </button>
                            </Link>
                            <DeleteUserButton userId={u.user_id} />
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
          {!loading && users.length > 0 && (
            <div className="table-footer">
              <p className="result-count">
                {searchQuery 
                  ? `Found ${users.length} user${users.length !== 1 ? 's' : ''} for "${searchQuery}"`
                  : `Showing ${users.length} of ${users.length} users`
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}