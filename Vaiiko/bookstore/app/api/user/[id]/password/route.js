import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getUserIdFromToken } from '@/app/lib/auth';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export async function PATCH(req, context) {
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
    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return new Response(
        JSON.stringify({ error: 'All fields are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (newPassword.length < 6) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 6 characters' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return new Response(
        JSON.stringify({ error: 'Current password is incorrect' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { user_id: userId },
      data: { password: hashedPassword },
    });

    return new Response(
      JSON.stringify({ message: 'Password updated successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Password update error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to update password' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}