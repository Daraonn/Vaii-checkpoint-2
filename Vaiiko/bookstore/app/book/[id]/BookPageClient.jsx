"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./book.module.css"; 

export default function BookPageClient({ book }) {
  const [message, setMessage] = useState("");

  const addToCart = async () => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_id: book.book_id, quantity: 1 }),
      });

      if (res.ok) setMessage("Book added to cart!");
      else if (res.status === 401) setMessage("Please login to add to cart.");
      else {
        const data = await res.json();
        setMessage(data.error || "Failed to add to cart");
      }
    } catch (err) {
      console.error(err);
      setMessage("An error occurred.");
    }
  };

  return (
    <div className={styles.bookPage}>
      <div className={styles.bookContainer}>
        <div className={styles.bookImage}>
          <Image
            src={book.image || "/placeholder.png"}
            width={260}
            height={380}
            alt={book.name}
            priority
          />
        </div>

        <div className={styles.bookDetails}>
          <div className={styles.bookInfo}>
            <h1 className={styles.bookName}>{book.name}</h1>
            <p className={styles.bookAuthor}>by {book.author}</p>
            <p className={styles.bookAbout}>{book.about}</p>
          </div>

          <p className={styles.bookPrice}>${book.price}</p>
          <button className={styles.addToCart} onClick={addToCart}>
            Add to cart
          </button>
          {message && <p className={styles.cartMessage}>{message}</p>}
        </div>
      </div>
    </div>
  );
}
