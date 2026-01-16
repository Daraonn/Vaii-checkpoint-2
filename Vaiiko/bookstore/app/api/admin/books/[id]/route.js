import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(req, context) {
  const { params } = context;
  const resolvedParams = await params;  
  const bookId = Number(resolvedParams.id);

  if (isNaN(bookId))
    return new Response(JSON.stringify({ error: "Invalid book ID" }), { status: 400 });

  const book = await prisma.book.findUnique({
    where: { book_id: bookId },
    include: {
      genres: {
        include: { genre: true },
      },
    },
  });

  if (!book)
    return new Response(JSON.stringify({ error: "Book not found" }), { status: 404 });

  return new Response(JSON.stringify({ book }), { status: 200 });
}

export async function PATCH(req, context) {
  const { params } = context;
  const resolvedParams = await params; 
  const bookId = Number(resolvedParams.id);

  if (isNaN(bookId))
    return new Response(JSON.stringify({ error: "Invalid book ID" }), { status: 400 });

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const { name, author, price, ISBN, image, about, language, year, genres } = body;

  if (!name || !author || !price || !ISBN || !about || !language || !year)
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });

  try {
    const updatedBook = await prisma.book.update({
      where: { book_id: bookId },
      data: {
        name,
        author,
        price: Number(price),
        ISBN,
        image: image || null,
        about,
        language,
        year: Number(year),
        ...(genres !== undefined && {
          genres: {
            deleteMany: {},
            create: genres.map((genreId) => ({
              genre: {
                connect: { genre_id: Number(genreId) }
              }
            })),
          },
        }),
      },
      include: {
        genres: { include: { genre: true } },
      },
    });
    return new Response(JSON.stringify({ book: updatedBook }), { status: 200 });
  } catch (err) {
    console.error("PATCH error:", err);
    if (err.code === "P2025")
      return new Response(JSON.stringify({ error: "Book not found" }), { status: 404 });
    if (err.code === "P2002")
      return new Response(JSON.stringify({ error: "ISBN already exists" }), { status: 400 });
    return new Response(JSON.stringify({ error: "Server error", details: err.message }), { status: 500 });
  }
}

export async function DELETE(req, context) {
  const { params } = context;
  const resolvedParams = await params;
  const bookId = Number(resolvedParams.id);

  if (isNaN(bookId))
    return new Response(JSON.stringify({ error: "Invalid book ID" }), { status: 400 });

  try {
    await prisma.book.delete({ where: { book_id: bookId } });
    return new Response(JSON.stringify({ message: "Book deleted successfully" }), { status: 200 });
  } catch (err) {
    if (err.code === "P2025")
      return new Response(JSON.stringify({ error: "Book not found" }), { status: 404 });
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}