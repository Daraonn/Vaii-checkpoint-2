import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getUserIdFromToken } from '@/app/lib/auth';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}


export async function GET(request, { params }) {
  try {
    const { id, bookId } = await params;
    const userId = await getUserIdFromToken();

    if (!userId || userId !== parseInt(id)) {
      return new Response(
        JSON.stringify({ error: 'Not authorized' }), 
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const rating = await prisma.rating.findUnique({
      where: {
        user_id_book_id: {
          user_id: userId,
          book_id: parseInt(bookId),
        },
      },
      include: { book: true },
    });

    if (!rating) {
      return new Response(
        JSON.stringify({ rating: null }), 
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(rating), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Get rating error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch rating' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
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

    const deleted = await prisma.rating.deleteMany({
      where: {
        user_id: userId,
        book_id: parseInt(bookId),
      },
    });

    if (deleted.count === 0) {
      return new Response(
        JSON.stringify({ error: 'Rating not found' }), 
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(null, { status: 204 });
  } catch (err) {
    console.error('Delete rating error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to delete rating' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}