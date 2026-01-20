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
    const { id } = await params;
    
    const favorites = await prisma.favouriteBook.findMany({
      where: { user_id: parseInt(id) },
      include: { book: true },
      orderBy: { addedAt: 'desc' },
    });

    return new Response(
      JSON.stringify({ favorites }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Favorites API error:', err);
    return new Response(
      JSON.stringify({ favorites: [] }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}


export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const userId = await getUserIdFromToken();
    
    if (!userId || userId !== parseInt(id)) {
      return new Response(
        JSON.stringify({ error: 'Not authorized' }), 
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { book_id } = await request.json();
    const bookIdNum = Number(book_id);
    
    if (!bookIdNum || isNaN(bookIdNum)) {
      return new Response(
        JSON.stringify({ error: 'Invalid book_id' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const existing = await prisma.favouriteBook.findUnique({
      where: { user_id_book_id: { user_id: userId, book_id: bookIdNum } },
      include: { book: true },
    });

    if (existing) {
      return new Response(
        JSON.stringify(existing), 
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const favourite = await prisma.favouriteBook.create({
      data: { user_id: userId, book_id: bookIdNum },
      include: { book: true }, 
    });

    return new Response(
      JSON.stringify(favourite), 
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Add favorite error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to add favourite' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}