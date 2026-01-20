import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

async function getUserIdFromToken() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("token");
  if (!tokenCookie) return null;
  try {
    const payload = jwt.verify(tokenCookie.value, JWT_SECRET);
    if (typeof payload === "object" && payload && "user_id" in payload) return payload.user_id;
  } catch (err) {
    console.error(err);
  }
  return null;
}


export async function DELETE(request, { params }) {
  try {
    const { id, bookId } = await params;
    const userId = await getUserIdFromToken();
    
    if (!userId || userId !== parseInt(id)) {
      return new Response(
        JSON.stringify({ error: 'Not authorized' }), 
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const bookIdNum = Number(bookId);
    if (isNaN(bookIdNum)) {
      return new Response(
        JSON.stringify({ error: 'Invalid book ID' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const deleted = await prisma.favouriteBook.deleteMany({
      where: { book_id: bookIdNum, user_id: userId },
    });

    if (deleted.count === 0) {
      return new Response(
        JSON.stringify({ error: 'Favourite not found' }), 
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(null, { status: 204 });
  } catch (err) {
    console.error('Delete favorite error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to delete favourite' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}