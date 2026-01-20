import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { createFollowingThreadAlert } from '../../../lib/alertHelpers'; 

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');
    const token = tokenCookie?.value;

    if (!token) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = jwt.verify(token, JWT_SECRET);
    if (typeof payload !== 'object' || !('user_id' in payload)) {
      return Response.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return Response.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    if (title.trim().length < 3) {
      return Response.json(
        { error: 'Title must be at least 3 characters long' },
        { status: 400 }
      );
    }

    if (content.trim().length < 10) {
      return Response.json(
        { error: 'Content must be at least 10 characters long' },
        { status: 400 }
      );
    }

    // Create thread
    const thread = await prisma.thread.create({
      data: {
        user_id: payload.user_id,
        title: title.trim(),
        content: content.trim(),
      },
      include: {
        user: {
          select: {
            user_id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    });


    try {
      await prisma.threadFollow.create({
        data: {
          user_id: payload.user_id,
          thread_id: thread.thread_id,
        },
      });
    } catch (error) {
      console.error('Failed to auto-follow thread:', error);
      
    }

    try {
      await createFollowingThreadAlert(payload.user_id, thread.thread_id);
    } catch (error) {
      console.error('Failed to send thread creation alerts:', error);
    }

    return Response.json(thread, { status: 201 });
  } catch (error) {
    console.error('Error creating thread:', error);
    return Response.json(
      { error: 'Failed to create thread' },
      { status: 500 }
    );
  }
}