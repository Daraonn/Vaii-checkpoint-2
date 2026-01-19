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
      const user = await prisma.user.findUnique({
        where: { user_id: payload.user_id },
        select: { user_id: true, isAdmin: true }
      });
      return user;
    }
  } catch (error) {
    return null;
  }
  return null;
}

export async function DELETE(request, { params }) {
  try {
    const user = await getUserFromToken();
    if (!user || !user.isAdmin) {
      return Response.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    const { reviewId } = resolvedParams;
    const reviewIdInt = parseInt(reviewId);

    const review = await prisma.review.findUnique({
      where: { review_id: reviewIdInt },
    });

    if (!review) {
      return Response.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    await prisma.review.delete({
      where: { review_id: reviewIdInt },
    });

    return Response.json({ message: 'Review deleted successfully by admin' });
  } catch (error) {
    console.error('Error deleting review as admin:', error);
    return Response.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}