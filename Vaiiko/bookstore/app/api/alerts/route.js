
import { PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

async function getUserIdFromToken() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("token");
  const token = tokenCookie?.value;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (typeof payload === "object" && payload !== null && "user_id" in payload) {
      return payload.user_id;
    }
    return null;
  } catch (err) {
    return null;
  }
}

export async function GET() {
  const userId = await getUserIdFromToken();

  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'Not authenticated' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const alerts = await prisma.alert.findMany({
      where: { user_id: userId },
      include: {
        actor: {
          select: {
            user_id: true,
            name: true,
            avatar: true
          }
        },
        review: {
          select: {
            review_id: true,
            book_id: true,
            content: true
          }
        },
        comment: {
          select: {
            comment_id: true,
            content: true
          }
        },
        book: {
          select: {
            book_id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return new Response(
      JSON.stringify({ alerts }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Error fetching alerts:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch alerts' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}