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

    const review = await prisma.review.findUnique({
      where: {
        user_id_book_id: {
          user_id: userId,
          book_id: parseInt(bookId),
        },
      },
      include: { 
        book: true,
        comments: {
          include: {
            user: {
              select: {
                user_id: true,
                name: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
    });

    if (!review) {
      return new Response(
        JSON.stringify({ review: null }), 
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(review), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Get review error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch review' }), 
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

    const deleted = await prisma.review.deleteMany({
      where: {
        user_id: userId,
        book_id: parseInt(bookId),
      },
    });

    if (deleted.count === 0) {
      return new Response(
        JSON.stringify({ error: 'Review not found' }), 
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(null, { status: 204 });
  } catch (err) {
    console.error('Delete review error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to delete review' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}