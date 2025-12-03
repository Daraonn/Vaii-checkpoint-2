'use client';

import { useEffect } from 'react';
import { useUser } from '../../context/user';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Searchbar from '../Searchbar/Searchbar';
import './Navbar.css';

export default function Navbar() {
  const userContext = useUser();
  const router = useRouter();

  if (!userContext) return null;

  const { user, setUser } = userContext;

  useEffect(() => {
    if (!setUser) return;

    const fetchUser = async () => {
      try {
        const res = await fetch('/api/token');
        const data = await res.json();
        if (setUser) setUser(data.user);
      } catch {
        if (setUser) setUser(null);
      }
    };

    fetchUser();
  }, [setUser]);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });

      if (setUser) setUser(null);

      router.push('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
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
            <Link href="/profile" className="navbar-profile-link">
              <div className="navbar-profile">
                <img src="/profile-picture.png" alt="Profile" />
                <p>{user.name}</p>
              </div>
            </Link>
            <button onClick={handleLogout} className="navbar-logout-link">
              <div className="navbar-logout"><p>Logout</p></div>
            </button>
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
