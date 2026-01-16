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
    const { username, bio, dateOfBirth, title, gender, avatar } = body;

    const updatedUser = await prisma.user.update({
      where: { user_id: userId },
      data: {
        name: username,
        bio: bio || null,
        dateOfBirth: dateOfBirth || null,
        title: title || null,
        gender: gender || null,
        avatar: avatar || null,
      },
      select: {
        user_id: true,
        name: true,
        email: true,
        bio: true,
        dateOfBirth: true,
        title: true,
        gender: true,
        avatar: true,
      },
    });

    return new Response(
      JSON.stringify({ user: updatedUser }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Profile update error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to update profile' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}