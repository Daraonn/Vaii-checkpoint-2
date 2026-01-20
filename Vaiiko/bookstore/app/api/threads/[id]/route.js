import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getUserFromToken } from '@/app/lib/auth';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;



export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const threadId = parseInt(id);
    if (isNaN(threadId)) {
      return Response.json(
        { error: 'Invalid thread ID' },
        { status: 400 }
      );
    }
    const userId = await getUserFromToken();
    const thread = await prisma.thread.findUnique({
      
      where: { thread_id: threadId },
      include: {
        user: {
          select: {
            user_id: true,
            name: true,
            avatar: true,
          },
        },

        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: {
              select: {
                user_id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        followers: userId ? {
          where: {
            user_id: userId,
          },
        } : false,
      },
    });

    if (!thread) {
      return Response.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    const responseData = {
      ...thread,
      isFollowing: userId ? thread.followers.length > 0 : false,
      followers: undefined,
    };

    return Response.json(responseData);
  } catch (error) {
    console.error('Error fetching thread:', error);
    return Response.json(
      { error: 'Failed to fetch thread' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
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
    const body = await request.json();
    const { title, content } = body;

    const thread = await prisma.thread.findUnique({
      where: { thread_id: threadId },
    });

    if (!thread) {
      return Response.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    if (thread.user_id !== userId) {
      return Response.json(
        { error: 'Forbidden: You can only edit your own threads' },
        { status: 403 }
      );
    }

    const updatedThread = await prisma.thread.update({
      where: { thread_id: threadId },
      data: {
        title: title?.trim() || thread.title,
        content: content?.trim() || thread.content,
      },
      include: {
        user: {
          select: {
            user_id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return Response.json(updatedThread);
  } catch (error) {
    console.error('Error updating thread:', error);
    return Response.json(
      { error: 'Failed to update thread' },
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
    const threadInt = parseInt(id);

    const thread = await prisma.thread.findUnique({
      where: { thread_id: threadInt },
    });

    if (!thread) {
      return Response.json(
        { error: 'Thread not found' },

        { status: 404 }
      );
    }

    if (thread.user_id !== userId) {
      return Response.json(
        { error: 'Forbidden: You can only delete your own threads' },
        { status: 403 }
      );
    }

    await prisma.thread.delete({
      where: { thread_id: threadInt },
    });

    return Response.json({ message: 'Thread deleted successfully' });
  } catch (error) {
    console.error('Error deleting thread:', error);
    return Response.json(
      { error: 'Failed to delete thread' },
      { status: 500 }
    );
  }
}