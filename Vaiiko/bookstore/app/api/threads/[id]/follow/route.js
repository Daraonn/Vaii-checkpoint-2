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
      return payload.user_id;
    }
  } catch (error) {
    return null;
  }
  return null;
}

export async function POST(request, { params }) {
  try {
    const userId = await getUserFromToken();
    if (!userId) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const threadId = parseInt(id);

    const thread = await prisma.thread.findUnique({
      where: { thread_id: threadId },
    });

    if (!thread) {
      return Response.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    const existingFollow = await prisma.threadFollow.findUnique({
      where: {
        user_id_thread_id: {
          user_id: userId,
          thread_id: threadId,
        },
      },
    });

    if (existingFollow) {
      return Response.json(
        { error: 'Already following this thread' },
        { status: 400 }
      );
    }

    const follow = await prisma.threadFollow.create({
      data: {
        user_id: userId,
        thread_id: threadId,
      },
    });

    return Response.json({ message: 'Thread followed successfully', follow }, { status: 201 });
  } catch (error) {
    console.error('Error following thread:', error);
    return Response.json(
      { error: 'Failed to follow thread' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const userId = await getUserFromToken();
    if (!userId) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const threadId = parseInt(id);

    const existingFollow = await prisma.threadFollow.findUnique({
      where: {
        user_id_thread_id: {
          user_id: userId,
          thread_id: threadId,
        },
      },
    });

    if (!existingFollow) {
      return Response.json(
        { error: 'Not following this thread' },
        { status: 400 }
      );
    }

    await prisma.threadFollow.delete({
      where: {
        user_id_thread_id: {
          user_id: userId,
          thread_id: threadId,
        },
      },
    });

    return Response.json({ message: 'Thread unfollowed successfully' });
  } catch (error) {
    console.error('Error unfollowing thread:', error);
    return Response.json(
      { error: 'Failed to unfollow thread' },
      { status: 500 }
    );
  }
}