
import { PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getUserIdFromToken } from '@/app/lib/auth';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;


export async function POST() {
  const userId = await getUserIdFromToken();

  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'Not authenticated' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    await prisma.alert.updateMany({
      where: {
        user_id: userId,
        is_read: false
      },
      data: {
        is_read: true
      }
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Error marking all alerts as read:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to mark all alerts as read' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}