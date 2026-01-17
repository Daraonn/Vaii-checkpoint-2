import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import Link from "next/link";
import "./admin.css";

const prisma = new PrismaClient();

export default async function AdminLayout({ children }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  let isAdmin = false;
  let userName = "";

  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || "supersecret");
      const user = await prisma.user.findUnique({
        where: { user_id: payload.user_id },
        select: { isAdmin: true, name: true },
      });
      isAdmin = user?.isAdmin === true;
      userName = user?.name || "";
    } catch {
      isAdmin = false;
    }
  }

  if (!isAdmin) {
    return (
      <div className="access-denied-container">
        <div className="access-denied-card">
          <div className="access-denied-icon">🔒</div>
          <h1>Access Denied</h1>
          <p>You don't have permission to access this area.</p>
          <p className="access-denied-hint">This section is restricted to administrators only.</p>
          <Link href="/">
            <button className="btn-home">← Go to Homepage</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">📚</span>
            <span className="logo-text">Admin Panel</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link href="/admin" className="nav-item">
            <span className="nav-emoji">🏠</span>
            <span>Dashboard</span>
          </Link>

          <Link href="/admin/books" className="nav-item">
            <span className="nav-emoji">📖</span>
            <span>Books</span>
          </Link>

          <Link href="/admin/users" className="nav-item">
            <span className="nav-emoji">👥</span>
            <span>Users</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {userName?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="user-details">
              <div className="user-name">{userName || 'Administrator'}</div>
              <div className="user-role">Admin</div>
            </div>
          </div>
          <Link href="/api/auth/logout" className="logout-btn" title="Logout">
            ←
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-content">{children}</main>
    </div>
  );
}