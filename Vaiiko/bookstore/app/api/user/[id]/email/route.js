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
    const { email } = body;

    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.user_id !== userId) {
      return new Response(
        JSON.stringify({ error: 'Email already in use' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await prisma.user.update({
      where: { user_id: userId },
      data: { email },
    });

    return new Response(
      JSON.stringify({ message: 'Email updated successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Email update error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to update email' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}