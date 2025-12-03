"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import "./edit.css";

export default function EditBook() {
  const { id } = useParams();
  const router = useRouter();
  const [book, setBook] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await fetch(`/api/admin/books/${id}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData?.error || "Failed to fetch book");
        }
        const data = await res.json();
        setBook(data.book);
      } catch (err) {
        console.error(err);
        setMsg(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBook();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!book) return <p style={{ color: "red" }}>{msg || "Book not found"}</p>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBook((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      const res = await fetch(`/api/admin/books/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(book),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Failed to update book");

      setMsg("Book updated successfully!");
      router.push("/admin/books");
    } catch (err) {
      console.error(err);
      setMsg(err.message);
    }
  };

  return (
    <div className="edit-book-container">
      <h1>Edit Book</h1>

      {msg && <p style={{ color: msg.includes("successfully") ? "green" : "red" }}>{msg}</p>}

      <form onSubmit={submit} className="edit-book-form">
        <input
          name="name"
          value={book.name}
          onChange={handleChange}
          placeholder="Book Name"
          required
        />
        <input
          name="price"
          type="number"
          value={book.price}
          onChange={handleChange}
          placeholder="Price"
          required
        />
        <input
          name="author"
          value={book.author}
          onChange={handleChange}
          placeholder="Author"
          required
        />
        <input
          name="ISBN"
          value={book.ISBN}
          onChange={handleChange}
          placeholder="ISBN"
          required
        />
        <input
          name="image"
          value={book.image || ""}
          onChange={handleChange}
          placeholder="Image URL (optional)"
        />

        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}
