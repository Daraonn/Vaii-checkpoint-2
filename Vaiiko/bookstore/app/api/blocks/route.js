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

// GET - Get blocked users
export async function GET(req) {
  const userId = await getUserIdFromToken();

  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'Not authenticated' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const blocks = await prisma.block.findMany({
      where: { blocker_id: userId },
      include: {
        blocked: {
          select: {
            user_id: true,
            name: true,
            avatar: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return new Response(
      JSON.stringify({ blocks }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Error fetching blocks:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch blocks' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// POST - Block a user
export async function POST(req) {
  const userId = await getUserIdFromToken();

  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'Not authenticated' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.json();
    const { blocked_id } = body;

    if (!blocked_id) {
      return new Response(
        JSON.stringify({ error: 'blocked_id is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (userId === blocked_id) {
      return new Response(
        JSON.stringify({ error: 'Cannot block yourself' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const existingBlock = await prisma.block.findUnique({
      where: {
        blocker_id_blocked_id: {
          blocker_id: userId,
          blocked_id: blocked_id
        }
      }
    });

    if (existingBlock) {
      return new Response(
        JSON.stringify({ error: 'User already blocked' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const block = await prisma.block.create({
      data: {
        blocker_id: userId,
        blocked_id: blocked_id
      },
      include: {
        blocked: {
          select: {
            user_id: true,
            name: true,
            avatar: true,
            email: true
          }
        }
      }
    });

    return new Response(
      JSON.stringify({ block }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Error blocking user:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to block user' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}