"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import "./add.css";

export default function AddBook() {
  const router = useRouter();
  const [book, setBook] = useState({
    name: "",
    author: "",
    price: "",
    ISBN: "",
    image: "",
  });
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBook((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      const res = await fetch(`/api/admin/books`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(book),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add book");

      setMsg("Book added successfully!");
      setBook({ name: "", author: "", price: "", ISBN: "", image: "" });

    } catch (err) {
      console.error(err);
      setMsg(err.message);
    }
  };

  return (
    <div className="add-book-container">
      <h1>Add Book</h1>

      {msg && <p style={{ color: msg.includes("successfully") ? "green" : "red" }}>{msg}</p>}

      <form onSubmit={submit} className="add-book-form">
        <input
          name="name"
          placeholder="Name"
          value={book.name}
          onChange={handleChange}
          required
        />
        <input
          name="price"
          type="number"
          placeholder="Price"
          value={book.price}
          onChange={handleChange}
          required
        />
        <input
          name="author"
          placeholder="Author"
          value={book.author}
          onChange={handleChange}
          required
        />
        <input
          name="ISBN"
          placeholder="ISBN"
          value={book.ISBN}
          onChange={handleChange}
          required
        />
        <input
          name="image"
          placeholder="Image URL"
          value={book.image || ""}
          onChange={handleChange}
        />

        <button type="submit">Add Book</button>
      </form>
    </div>
  );
}
