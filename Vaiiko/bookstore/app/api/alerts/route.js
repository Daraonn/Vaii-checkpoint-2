import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export async function GET() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');
    const token = tokenCookie?.value;

    if (!token) {
      return Response.json({ alerts: [] }, { status: 200 });
    }

    const payload = jwt.verify(token, JWT_SECRET);
    if (typeof payload !== 'object' || !('user_id' in payload)) {
      return Response.json({ alerts: [] }, { status: 200 });
    }

    const alerts = await prisma.alert.findMany({
      where: { user_id: payload.user_id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        actor: {
          select: {
            user_id: true,
            name: true,
            avatar: true,
          },
        },
        book: {
          select: {
            book_id: true,
            name: true,
            image: true,
          },
        },
        review: {
          select: {
            review_id: true,
            book_id: true,
          },
        },
        comment: {
          select: {
            comment_id: true,
          },
        },
        thread: {                    
          select: {
            thread_id: true,
            title: true,
          },
        },
        threadComment: {             
          select: {
            comment_id: true,
            content: true,
          },
        },
      },
    });

    return Response.json({ alerts });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return Response.json({ alerts: [] }, { status: 500 });
  }
}