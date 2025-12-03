import prisma from "../lib/prisma";
import Image from "next/image";
import Link from "next/link";
import "./shop.css";

export async function ShopPage() {
  const books = await prisma.book.findMany();

  return (
    <div className="shop-container">
      <h1 className="shop-title">Shop</h1>

      <div className="shop-grid">
        {books.map((book) => (
          <div key={book.book_id} className="shop-card">
            <Link href={`/book/${book.book_id}`}>
              <Image
                src={book.image || "/placeholder.png"}
                width={150}
                height={200}
                alt={book.name}
                className="book-image"
              />
            </Link>

            <Link href={`/book/${book.book_id}`} className="book-link">
              <p className="book-name">{book.name}</p>
            </Link>

            <p className="book-author">{book.author}</p>
            <p className="book-price">${book.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ShopPage;
