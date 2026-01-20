import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { createThreadCommentAlert } from '@/app/lib/alertHelpers';
import { getUserFromToken } from '@/app/lib/auth';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

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
    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length < 1) {
      return Response.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    const thread = await prisma.thread.findUnique({
      where: { thread_id: threadId },
    });

    if (!thread) {
      return Response.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    const comment = await prisma.threadComment.create({
      data: {
        thread_id: threadId,
        user_id: userId,
        content: content.trim(),
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

    try {
      await createThreadCommentAlert(userId, threadId, comment.comment_id);
    } catch (error) {
      console.error('Failed to send thread comment alerts:', error);
    }

    return Response.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return Response.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}