
import BookPageClient from './BookPageClient';
import prisma from "../../lib/prisma";
import Image from "next/image";


export default async function BookPage({ params }) {

  const resolvedParams = await params; 
  const { id } = resolvedParams; 
  const bookId = Number(id);


  if (isNaN(bookId)) return <p>Invalid book ID</p>;

  const book = await prisma.book.findUnique({
    where: { book_id: bookId },
    include: {
      genres: {
        include: {
          genre: true,
        },
      },
    },
  })

  if (!book) return <p>Book not found</p>;

  return <BookPageClient book={book} />;


  
}

