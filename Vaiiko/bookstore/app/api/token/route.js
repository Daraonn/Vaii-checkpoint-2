import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

// Throw error if no secret is set
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');
    const token = tokenCookie?.value;

    if (!token) {
      return new Response(JSON.stringify({ user: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify token (this will throw if expired or invalid)
    const payload = jwt.verify(token, JWT_SECRET);

    if (typeof payload !== 'object' || payload === null || !('user_id' in payload)) {
      return new Response(JSON.stringify({ user: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ALWAYS fetch fresh user data from DB
    // Never trust data from the token except user_id
    const user = await prisma.user.findUnique({
      where: { user_id: payload.user_id },
      select: {
        user_id: true,
        name: true,
        email: true,
        isAdmin: true,
        avatar: true,  
        bio: true,
        title: true,
        gender: true,
        dateOfBirth: true,
        createdAt: true,
      },
    });

    if (!user) {
      return new Response(JSON.stringify({ user: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        user: {
        user_id: user.user_id,
        id: user.user_id,  
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        avatar: user.avatar,
        bio: user.bio,
        title: user.title,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        createdAt: user.createdAt
    },
  }),
  { status: 200, headers: { 'Content-Type': 'application/json' } }
);

  } catch (err) {
    // Token expired or invalid
    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
      console.log('Invalid or expired token');
      return new Response(JSON.stringify({ user: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.error('Token API error:', err);
    return new Response(JSON.stringify({ user: null }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}