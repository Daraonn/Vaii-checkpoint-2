import { PrismaClient } from '@prisma/client';
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

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const userId = await getUserIdFromToken();

    const reviews = await prisma.review.findMany({
      where: { book_id: parseInt(id) },
      include: { 
        user: {
          select: {
            user_id: true,
            name: true,
            avatar: true,
          }
        },
        comments: {
          include: {
            user: {
              select: {
                user_id: true,
                name: true,
                avatar: true,
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        likes: true,
        _count: {
          select: {
            comments: true,
            likes: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    const reviewsWithStats = reviews.map(review => {
      const likesCount = review.likes.filter(l => l.is_like).length;
      const dislikesCount = review.likes.filter(l => !l.is_like).length;
      const userLike = userId ? review.likes.find(l => l.user_id === userId) : null;

      return {
        ...review,
        likesCount,
        dislikesCount,
        userLiked: userLike?.is_like === true,
        userDisliked: userLike?.is_like === false,
        likes: undefined
      };
    });

    return new Response(
      JSON.stringify({ reviews: reviewsWithStats, totalReviews: reviews.length }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Get book reviews error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch reviews' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}