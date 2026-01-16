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
    return null;
  }
}

export async function DELETE(request, { params }) {
  try {
    const { commentId } = await params;
    const userId = await getUserIdFromToken();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Not authorized' }), 
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const deleted = await prisma.reviewComment.deleteMany({
      where: {
        comment_id: parseInt(commentId),
        user_id: userId,
      },
    });

    if (deleted.count === 0) {
      return new Response(
        JSON.stringify({ error: 'Comment not found or not authorized' }), 
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(null, { status: 204 });
  } catch (err) {
    console.error('Delete comment error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to delete comment' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}