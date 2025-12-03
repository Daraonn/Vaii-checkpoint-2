'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteButton({ bookId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this book?')) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/books/${bookId}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || 'Failed to delete book');

      router.refresh(); 
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="delete-btn"
    >
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  );
}
