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
  const token = tokenCookie?.value;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (typeof payload === "object" && payload !== null && "user_id" in payload) {
      return payload.user_id;
    }
    return null;
  } catch (err) {
    console.error("JWT verify error:", err);
    return null;
  }
}

// GET - Public, anyone can view
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const ratings = await prisma.rating.findMany({
      where: { user_id: parseInt(id) },
      include: { book: true },
      orderBy: { createdAt: 'desc' },
    });

    return new Response(
      JSON.stringify({ ratings }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Get ratings error:', err);
    return new Response(
      JSON.stringify({ ratings: [] }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// POST - Protected, only the user can create/update their own ratings
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

    const body = await request.json();
    const { book_id, stars, status } = body;

    if (!status) {
      return new Response(
        JSON.stringify({ error: 'Status is required' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const validStatuses = ['COMPLETED', 'WANT_TO_READ', 'CURRENTLY_READING', 'DNF'];
    if (!validStatuses.includes(status)) {
      return new Response(
        JSON.stringify({ error: 'Invalid status' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (stars !== null && stars !== undefined && (stars < 1 || stars > 5)) {
      return new Response(
        JSON.stringify({ error: 'Stars must be between 1 and 5' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const existing = await prisma.rating.findUnique({
      where: { 
        user_id_book_id: { 
          user_id: userId, 
          book_id: parseInt(book_id) 
        } 
      },
    });

    let rating;
    
    const updateData = {
      status: status,
    };
    
    if (stars !== null && stars !== undefined) {
      updateData.stars = parseInt(stars);
    }

    if (existing) {
      rating = await prisma.rating.update({
        where: { rating_id: existing.rating_id },
        data: updateData,
        include: { book: true },
      });
    } else {
      const createData = {
        user_id: userId,
        book_id: parseInt(book_id),
        status: status,
      };
      
      if (stars !== null && stars !== undefined) {
        createData.stars = parseInt(stars);
      }
      
      rating = await prisma.rating.create({
        data: createData,
        include: { book: true },
      });
    }

    return new Response(
      JSON.stringify(rating), 
      { status: existing ? 200 : 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Add/update rating error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to save rating' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}