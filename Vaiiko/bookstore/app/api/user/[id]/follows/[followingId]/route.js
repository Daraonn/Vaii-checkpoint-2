import { PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getUserIdFromToken } from '@/app/lib/auth';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;



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