import { PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getUserIdFromToken } from '@/app/lib/auth';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;



export async function GET(req, context) {
  const { params } = context;
  const resolvedParams = await params;
  const userId = Number(resolvedParams.id);

  if (isNaN(userId)) {
    return new Response(
      JSON.stringify({ error: 'Invalid user ID' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        createdAt: true,

      }
    });

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ user }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Error fetching user:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch user' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}


export async function DELETE(req, context) {
  const { params } = context;
  const resolvedParams = await params;
  const userId = Number(resolvedParams.id);
  const authenticatedUserId = await getUserIdFromToken();

  if (!authenticatedUserId || authenticatedUserId !== userId) {
    return new Response(
      JSON.stringify({ error: 'Not authorized' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    await prisma.user.delete({
      where: { user_id: userId },
    });

    return new Response(
      JSON.stringify({ message: 'Account deleted successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Account deletion error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to delete account' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}