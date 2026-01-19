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
    const commentIdInt = parseInt(id);
    const body = await request.json();
    const { content } = body;

    const comment = await prisma.threadComment.findUnique({
      where: { comment_id: commentIdInt },
    });

    if (!comment) {
      return Response.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    if (comment.user_id !== userId) {
      return Response.json(
        { error: 'Forbidden: You can only edit your own comments' },
        { status: 403 }
      );
    }

    const updatedComment = await prisma.threadComment.update({
      where: { comment_id: commentIdInt },
      data: { content: content.trim() },
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

    return Response.json(updatedComment);
  } catch (error) {
    console.error('Error updating comment:', error);
    return Response.json(
      { error: 'Failed to update comment' },
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
    const commentIdInt = parseInt(id);

    const comment = await prisma.threadComment.findUnique({
      where: { comment_id: commentIdInt },
    });

    if (!comment) {
      return Response.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    if (comment.user_id !== userId) {
      return Response.json(
        { error: 'Forbidden: You can only delete your own comments' },
        { status: 403 }
      );
    }

    await prisma.threadComment.delete({
      where: { comment_id: commentIdInt },
    });

    return Response.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return Response.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}