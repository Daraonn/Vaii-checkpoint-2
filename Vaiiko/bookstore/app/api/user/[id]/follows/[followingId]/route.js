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


export async function DELETE(req, context) {
  const { params } = context;
  const resolvedParams = await params;
  const userId = Number(resolvedParams.id); 
  const followingId = Number(resolvedParams.followingId);
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
    const follow = await prisma.follow.findFirst({
      where: {
        follower_id: userId,
        following_id: followingId
      }
    });

    if (!follow) {
      return new Response(
        JSON.stringify({ error: 'Not following this user' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await prisma.follow.delete({
      where: {
        follow_id: follow.follow_id
      }
    });

    return new Response(
      JSON.stringify({ message: 'Unfollowed successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Unfollow error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to unfollow user' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}