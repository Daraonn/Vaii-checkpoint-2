import { PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getUserIdFromToken } from '@/app/lib/auth';
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;


// DELETE - Unblock a user
export async function DELETE(req, context) {
  const userId = await getUserIdFromToken();
  const { params } = context;
  const resolvedParams = await params;
  const blockedId = Number(resolvedParams.blockedId);

  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'Not authenticated' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const block = await prisma.block.findUnique({
      where: {
        blocker_id_blocked_id: {
          blocker_id: userId,
          blocked_id: blockedId
        }
      }
    });

    if (!block) {
      return new Response(
        JSON.stringify({ error: 'Block not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await prisma.block.delete({
      where: { block_id: block.block_id }
    });

    return new Response(
      JSON.stringify({ message: 'User unblocked successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Error unblocking user:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to unblock user' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}