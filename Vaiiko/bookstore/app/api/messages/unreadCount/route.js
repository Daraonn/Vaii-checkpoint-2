import { PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getUserIdFromToken } from '@/app/lib/auth';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;




export async function GET(req) {
  const userId = await getUserIdFromToken();

  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'Not authenticated' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    
    const count = await prisma.message.count({
      where: {
        receiver_id: userId,
        is_read: false,
        is_deleted: false
      }
    });

    return new Response(
      JSON.stringify({ count }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Error fetching unread count:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch unread count' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}