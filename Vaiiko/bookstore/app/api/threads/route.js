import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [threads, total] = await Promise.all([
      prisma.thread.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      }),
      prisma.thread.count(),
    ]);

    const threadsWithCount = threads.map(thread => ({
      ...thread,
      commentCount: thread.comments.length,
      comments: undefined,
    }));

    return Response.json({
      threads: threadsWithCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching threads:', error);
    return Response.json(
      { error: 'Failed to fetch threads' },
      { status: 500 }
    );
  }
}