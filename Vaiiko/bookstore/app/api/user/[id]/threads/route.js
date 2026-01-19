import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const user = await prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const [threads, total] = await Promise.all([
      prisma.thread.findMany({
        where: { user_id: userId },
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
      prisma.thread.count({
        where: { user_id: userId },
      }),
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
    console.error('Error fetching user threads:', error);
    return Response.json(
      { error: 'Failed to fetch threads' },
      { status: 500 }
    );
  }
}