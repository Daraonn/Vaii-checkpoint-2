import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

async function getUserFromToken() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('token');
  const token = tokenCookie?.value;

  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (typeof payload === 'object' && 'user_id' in payload) {
      const user = await prisma.user.findUnique({
        where: { user_id: payload.user_id },
        select: { user_id: true, isAdmin: true }
      });
      return user;
    }
  } catch (error) {
    return null;
  }
  return null;
}

export async function DELETE(request, { params }) {
  try {
    const user = await getUserFromToken();
    if (!user || !user.isAdmin) {
      return Response.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const threadIdInt = Number(id);

    const thread = await prisma.thread.findUnique({
      where: { thread_id: threadIdInt },
    });

    if (!thread) {
      return Response.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    await prisma.thread.delete({
      where: { thread_id: threadIdInt },
    });

    return Response.json({ message: 'Thread deleted successfully by admin' });
  } catch (error) {
    console.error('Error deleting thread as admin:', error);
    return Response.json(
      { error: 'Failed to delete thread' },
      { status: 500 }
    );
  }
}