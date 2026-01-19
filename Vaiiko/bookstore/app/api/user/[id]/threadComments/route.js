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
    const limit = parseInt(searchParams.get('limit') || '20');
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

    const [comments, total] = await Promise.all([
      prisma.threadComment.findMany({
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
          thread: {
            select: {
              thread_id: true,
              title: true,
              user_id: true,
            },
          },
        },
      }),
      prisma.threadComment.count({
        where: { user_id: userId },
      }),
    ]);

    return Response.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching user thread comments:', error);
    return Response.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}