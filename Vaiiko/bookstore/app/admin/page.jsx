import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import './adminHome.css';

const prisma = new PrismaClient();

export default async function AdminHome() {
  // Fetch statistics
  const [booksCount, usersCount, adminCount] = await Promise.all([
    prisma.book.count(),
    prisma.user.count(),
    prisma.user.count({ where: { isAdmin: true } }),
  ]);

  const regularUsersCount = usersCount - adminCount;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back! Here's what's happening today.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <div className="stat-label">Total Books</div>
            <div className="stat-value">{booksCount}</div>
            <div className="stat-change">In catalog</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{usersCount}</div>
            <div className="stat-change">{regularUsersCount} regular users</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👑</div>
          <div className="stat-content">
            <div className="stat-label">Administrators</div>
            <div className="stat-value">{adminCount}</div>
            <div className="stat-change">With admin access</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link href="/admin/books" className="action-card">
            <div className="action-icon">📖</div>
            <div className="action-content">
              <h3>Manage Books</h3>
              <p>Add, edit, or remove books from your catalog</p>
            </div>
            <div className="action-arrow">→</div>
          </Link>

          <Link href="/admin/books/add" className="action-card">
            <div className="action-icon">➕</div>
            <div className="action-content">
              <h3>Add New Book</h3>
              <p>Quickly add a new book to your inventory</p>
            </div>
            <div className="action-arrow">→</div>
          </Link>

          <Link href="/admin/users" className="action-card">
            <div className="action-icon">👥</div>
            <div className="action-content">
              <h3>Manage Users</h3>
              <p>View and manage user accounts and permissions</p>
            </div>
            <div className="action-arrow">→</div>
          </Link>

          <Link href="/admin/users/add" className="action-card">
            <div className="action-icon">👤</div>
            <div className="action-content">
              <h3>Add New User</h3>
              <p>Create a new user account with custom permissions</p>
            </div>
            <div className="action-arrow">→</div>
          </Link>
        </div>
      </div>

      {/* Recent Activity - Optional */}
      <div className="recent-activity-section">
        <h2>Overview</h2>
        <div className="overview-grid">
          <div className="overview-card">
            <div className="overview-header">
              <span className="overview-title">📚 Books Management</span>
              <Link href="/admin/books" className="view-all-link">View All →</Link>
            </div>
            <div className="overview-stat">
              <span className="overview-number">{booksCount}</span>
              <span className="overview-label">books in catalog</span>
            </div>
          </div>

          <div className="overview-card">
            <div className="overview-header">
              <span className="overview-title">👥 User Management</span>
              <Link href="/admin/users" className="view-all-link">View All →</Link>
            </div>
            <div className="overview-stat">
              <span className="overview-number">{usersCount}</span>
              <span className="overview-label">registered users</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}