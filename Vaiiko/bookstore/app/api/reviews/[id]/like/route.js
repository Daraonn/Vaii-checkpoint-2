import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getUserIdFromToken } from '@/app/lib/auth';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
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
    const { is_like } = body;

    const existing = await prisma.reviewLike.findUnique({
      where: {
        review_id_user_id: {
          review_id: parseInt(reviewId),
          user_id: userId
        }
      }
    });

    if (existing) {
      if (existing.is_like === is_like) {
        await prisma.reviewLike.delete({
          where: { like_id: existing.like_id }
        });
        return new Response(
          JSON.stringify({ action: 'removed' }), 
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      } else {
        await prisma.reviewLike.update({
          where: { like_id: existing.like_id },
          data: { is_like }
        });
        return new Response(
          JSON.stringify({ action: 'updated' }), 
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } else {
      await prisma.reviewLike.create({
        data: {
          review_id: parseInt(reviewId),
          user_id: userId,
          is_like
        }
      });
      return new Response(
        JSON.stringify({ action: 'created' }), 
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (err) {
    console.error('Like review error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to like review' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}