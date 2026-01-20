import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getUserIdFromToken } from '@/app/lib/auth';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;


export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return Response.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

   
    const currentUserId = await getUserIdFromToken();
    if (!currentUserId || currentUserId !== userId) {
      return Response.json(
        { error: 'Unauthorized - You can only view your own followed threads' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [follows, total] = await Promise.all([
      prisma.threadFollow.findMany({
        where: { user_id: userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          thread: {
            include: {
              user: {
                select: {
                  user_id: true,
                  name: true,
                  avatar: true,
                },
              },
              comments: {
                select: {
                  comment_id: true,
                },
              },
            },
          },
        },
      }),
      prisma.threadFollow.count({
        where: { user_id: userId },
      }),
    ]);

    const threads = follows.map(follow => ({
      ...follow.thread,
      commentCount: follow.thread.comments.length,
      comments: undefined,
      followedAt: follow.createdAt,
    }));

    return Response.json({
      threads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching followed threads:', error);
    return Response.json(
      { error: 'Failed to fetch followed threads' },
      { status: 500 }
    );
  }
}