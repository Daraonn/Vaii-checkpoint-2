import { PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

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
    return null;
  }
}

// GET - Get user's follows list
export async function GET(req, context) {
  const { params } = context;
  const resolvedParams = await params;
  const userId = Number(resolvedParams.id); // CHANGED from userId to id

  if (isNaN(userId)) {
    return new Response(
      JSON.stringify({ error: 'Invalid user ID' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const follows = await prisma.follow.findMany({
      where: { 
        follower_id: userId
      },
      include: {
        following: {
          select: {
            user_id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return new Response(
      JSON.stringify({ follows }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Error fetching follows:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch follows' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// POST - Follow a user
export async function POST(req, context) {
  const { params } = context;
  const resolvedParams = await params;
  const userId = Number(resolvedParams.id); // CHANGED from userId to id
  const authenticatedUserId = await getUserIdFromToken();

  if (!authenticatedUserId) {
    return new Response(
      JSON.stringify({ error: 'Not authenticated' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (Number(authenticatedUserId) !== Number(userId)) {
    return new Response(
      JSON.stringify({ error: 'Not authorized' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.json();
    const { following_id } = body;

    if (!following_id) {
      return new Response(
        JSON.stringify({ error: 'following_id is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (userId === following_id) {
      return new Response(
        JSON.stringify({ error: 'Cannot follow yourself' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const existingFollow = await prisma.follow.findFirst({
      where: {
        follower_id: userId,
        following_id: following_id
      }
    });

    if (existingFollow) {
      return new Response(
        JSON.stringify({ error: 'Already following this user' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const follow = await prisma.follow.create({
      data: {
        follower_id: userId,
        following_id: following_id
      },
      include: {
        following: {
          select: {
            user_id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    return new Response(
      JSON.stringify({ follow }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Follow error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to follow user' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}