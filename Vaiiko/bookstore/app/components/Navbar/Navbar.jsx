'use client';

import { useEffect, useState, useRef } from 'react';
import { useUser } from '../../context/user';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Searchbar from '../Searchbar/Searchbar';
import './Navbar.css';

export default function Navbar() {
  const userContext = useUser();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const dropdownRef = useRef(null);

  if (!userContext) return null;

  const { user, setUser } = userContext;

  useEffect(() => {
    if (!setUser) return;

    const fetchUser = async () => {
      try {
        const res = await fetch('/api/token');
        const data = await res.json();
        setUser(data.user);
      } catch {
        setUser(null);
      }
    };

    fetchUser();
  }, [setUser]);


  useEffect(() => {
    if (!user) return;

    const fetchUnreadCount = async () => {
      try {
        const res = await fetch('/api/messages/unreadCount');
        if (res.ok) {
          const data = await res.json();
          setUnreadMessages(data.count || 0);
        }
      } catch (err) {
        console.error('Error fetching unread count:', err);
      }
    };

    fetchUnreadCount();
    
    const interval = setInterval(fetchUnreadCount, 300);
    
    return () => clearInterval(interval);
  }, [user]);


  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
  };

  const handleProfileNavigation = (tab) => {
    router.push(`/profile/${user.user_id}?tab=${tab}`);
    setOpen(false);
  };

  return (
    <div className="navbar-top">
      <div className="navbar-left">
        <Link href="/" className="navbar-logo-link">
          <div className="navbar-logo">
            <img src="/placeholder.png" alt="Logo" />
            <p>BookShop</p>
          </div>
        </Link>

        <Link href="/" className="navbar-menu-link">
          <div className="navbar-home"><p>Home</p></div>
        </Link>

        <Link href="/browse" className="navbar-menu-link">
          <div className="navbar-browse"><p>Browse</p></div>
        </Link>

        <div className="navbar-searchbar">
          <Searchbar />
        </div>

        {user?.isAdmin && (
          <Link href="/admin/books" className="navbar-menu-link">
            <div className="navbar-admin"><p>Admin Panel</p></div>
          </Link>
        )}
      </div>

      <div className="navbar-right">
        {user ? (
          <>
            <Link href="/messages" className="navbar-messages-link">
              <div className="navbar-messages">
                <img
                  src="/mail-navbar.png"
                  alt="Messages"
                  className="navbar-messages-img"
                />
                {unreadMessages > 0 && (
                  <span className="navbar-notification-badge">
                    {unreadMessages > 99 ? '99+' : unreadMessages}
                  </span>
                )}
              </div>
            </Link>

            <Link href="/alerts" className="navbar-alerts-link">
              <div className="navbar-alerts">
                <img
                  src="/alert-bell.png"
                  alt="Alerts"
                  className="navbar-alerts-img"
                />
              </div>
            </Link>

            <Link href="/cart" className="navbar-cart-link">
              <div className="navbar-cart">
                <img
                  src="/cart.png"
                  alt="Cart"
                  className="navbar-cart-img"
                />
              </div>
            </Link>

            
            <div className="navbar-profile-wrapper" ref={dropdownRef}>
              <div
                className="navbar-profile-trigger"
                role="button"
                tabIndex={0}
                onClick={() => setOpen(!open)}
              >
                <img
                  src={user.avatar || "/login-picture.png"}
                  alt={user.name}
                  className="navbar-profile-img"
                  onError={(e) => {
                  console.log('Image failed to load:', e.target.src);
                  e.target.src = "/login-picture.png";
                }}
/>
                <p className="navbar-username">{user.name}</p>
              </div>

              {open && (
                <div className="navbar-dropdown">
                  <div className="navbar-dropdown-arrow" />
                  
                  <Link
                    href={`/profile/${user.user_id}`}
                    className="navbar-dropdown-item"
                    onClick={() => setOpen(false)}
                  >
                    <span className="dropdown-icon">👤</span>
                    Profile
                  </Link>

                  <div className="navbar-dropdown-divider" />

                  <div
                    className="navbar-dropdown-item"
                    onClick={() => handleProfileNavigation('reviews')}
                  >
                    <span className="dropdown-icon">📝</span>
                    My Reviews
                  </div>

                  <Link
                    href="/messages"
                    className="navbar-dropdown-item"
                    onClick={() => setOpen(false)}
                  >
                    <span className="dropdown-icon">💬</span>
                    Messages
                    {unreadMessages > 0 && (
                      <span className="dropdown-notification-badge">
                        {unreadMessages}
                      </span>
                    )}
                  </Link>

                  <Link
                    href="/alerts"
                    className="navbar-dropdown-item"
                    onClick={() => setOpen(false)}
                  >
                    <span className="dropdown-icon">🔔</span>
                    Alerts
                  </Link>

                  <div
                    className="navbar-dropdown-item"
                    onClick={() => handleProfileNavigation('favorites')}
                  >
                    <span className="dropdown-icon">⭐</span>
                    My Favorites
                  </div>

                  <div
                    className="navbar-dropdown-item"
                    onClick={() => handleProfileNavigation('follows')}
                  >
                    <span className="dropdown-icon">👥</span>
                    Following
                  </div>

                  <div className="navbar-dropdown-divider" />

                  <Link
                    href="/settings"
                    className="navbar-dropdown-item"
                    onClick={() => setOpen(false)}
                  >
                    <span className="dropdown-icon">⚙️</span>
                    Settings
                  </Link>

                  <div className="navbar-dropdown-divider" />

                  <div
                    className="navbar-dropdown-item navbar-dropdown-logout"
                    onClick={handleLogout}
                  >
                    <span className="dropdown-icon">🚪</span>
                    Logout
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link href="/login" className="navbar-login-link">
            <div className="navbar-login">
              <img src="/login-picture.png" alt="Login" />
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}