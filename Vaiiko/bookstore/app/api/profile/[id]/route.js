import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req, context) {
  const { params } = context;
  const resolvedParams = await params;
  const userId = Number(resolvedParams.id);

  if (isNaN(userId)) {
    return new Response(
      JSON.stringify({ error: 'Invalid user ID' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        createdAt: true,
      }
    });

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ user }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Error fetching user:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch user' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}