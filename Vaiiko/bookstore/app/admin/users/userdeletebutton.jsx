
'use client';
import React from 'react';
import './userdeletebutton.css';

export default function DeleteUserButton({ userId }) {
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete user');
      alert('User deleted successfully');
      location.reload();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <button className="delete-btn" onClick={handleDelete}>
      Delete
    </button>
  );
}
