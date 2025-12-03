import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(req, context) {
  const { params } = context;
  const resolvedParams = await params;  
  const bookId = Number(resolvedParams.id);

  if (isNaN(bookId))
    return new Response(JSON.stringify({ error: "Invalid book ID" }), { status: 400 });

  const book = await prisma.book.findUnique({ where: { book_id: bookId } });

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

  const { name, author, price, ISBN, image } = body;

  if (!name || !author || !price || !ISBN)
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });

  try {
    const updatedBook = await prisma.book.update({
      where: { book_id: bookId },
      data: { name, author, price: Number(price), ISBN, image: image || null },
    });

    return new Response(JSON.stringify({ book: updatedBook }), { status: 200 });
  } catch (err) {
    if (err.code === "P2025")
      return new Response(JSON.stringify({ error: "Book not found" }), { status: 404 });
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
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