'use client';

import { useUser } from '@/app/context/user'; 
import { useRouter } from 'next/navigation';
import "./LogoutButton.css";

export default function LogoutButton({ userName }) {
  const { setUser } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
  };

  return (
    <div className="sidebar-footer">
      <div className="user-info">
        <div className="user-avatar">
          {userName?.charAt(0)?.toUpperCase() || 'A'}
        </div>
        <div className="user-details">
          <div className="user-name">{userName || 'Administrator'}</div>
          <div className="user-role">Admin</div>
        </div>
      </div>
      <button onClick={handleLogout} className="logout-btn" title="Logout">
        ←
      </button>
    </div>
  );
}