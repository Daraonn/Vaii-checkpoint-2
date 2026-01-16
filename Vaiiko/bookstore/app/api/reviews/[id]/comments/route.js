import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { 
  createFollowingCommentAlert, 
  createCommentOnReviewAlert 
} from '../../../../lib/alertHelpers';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

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

export async function POST(request, { params }) {
  try {
    const { id: reviewId } = await params;  
    const userId = await getUserIdFromToken();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Not authorized' }), 
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Comment content is required' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const comment = await prisma.reviewComment.create({
      data: {
        review_id: parseInt(reviewId),
        user_id: userId,
        content: content.trim(),
      },
      include: {
        user: {
          select: {
            user_id: true,
            name: true
          }
        }
      }
    });

    
    const review = await prisma.review.findUnique({
      where: { review_id: parseInt(reviewId) },
      select: { 
        user_id: true,
        book_id: true 
      }
    });

    
    if (review) {
      
      await createFollowingCommentAlert(userId, comment.comment_id, parseInt(reviewId));
      
      
      await createCommentOnReviewAlert(userId, comment.comment_id, parseInt(reviewId), review.user_id);
    }

    return new Response(
      JSON.stringify(comment), 
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Add comment error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to add comment' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}