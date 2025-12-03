import prisma from "../../lib/prisma";
import Image from "next/image";

export default async function BookPage({ params }) {

  const resolvedParams = await params; 
  const { id } = resolvedParams; 
  const bookId = Number(id);

  if (isNaN(bookId)) return <p>Invalid book ID</p>;

  const book = await prisma.book.findUnique({
    where: { book_id: bookId },
  });

  if (!book) return <p>Book not found</p>;

  return (
    <div style={{ padding: "40px" }}>
      <h1>{book.name}</h1>
      <p>Author: {book.author}</p>
      <p>Price: ${book.price}</p>
      <Image
        src={book.image || "/placeholder.png"}
        width={250}
        height={350}
        alt={book.name}
      />
      <p>{book.ISBN}</p>
    </div>
  );
}

