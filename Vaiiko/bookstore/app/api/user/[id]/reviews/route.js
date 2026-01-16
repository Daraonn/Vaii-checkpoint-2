import { PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { createFollowingReviewAlert } from '../../../../lib/alertHelpers';

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


export async function GET(req, context) {
  const { params } = context;
  const resolvedParams = await params;
  const userId = Number(resolvedParams.id);

  console.log('Fetching reviews for user ID:', userId);

  if (isNaN(userId)) {
    return new Response(
      JSON.stringify({ error: "Invalid user ID" }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const reviews = await prisma.review.findMany({
      where: { user_id: userId },
      include: {
        book: {
          select: {
            book_id: true,
            name: true,
            author: true,
            image: true,
            year: true,
          },
        },
        user: {
          select: {
            user_id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('Found reviews:', reviews.length);

    return new Response(
      JSON.stringify({ reviews }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error("Error fetching reviews:", err);
    return new Response(
      JSON.stringify({ error: "Failed to fetch reviews", details: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}


export async function POST(req, context) {
  try {
    const { params } = context;
    const resolvedParams = await params;
    const urlUserId = Number(resolvedParams.id);
    const authenticatedUserId = await getUserIdFromToken();

    console.log('POST review - URL user:', urlUserId, 'Authenticated user:', authenticatedUserId);

    if (!authenticatedUserId || authenticatedUserId !== urlUserId) {
      return new Response(
        JSON.stringify({ error: 'Not authorized' }), 
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { book_id, content } = body;

    console.log('Review data:', { book_id, content: content?.substring(0, 50) });

    if (!content || content.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Review content is required' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!book_id) {
      return new Response(
        JSON.stringify({ error: 'Book ID is required' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const existing = await prisma.review.findUnique({
      where: { 
        user_id_book_id: { 
          user_id: authenticatedUserId, 
          book_id: parseInt(book_id) 
        } 
      },
    });

    let review;
    if (existing) {
      console.log('Updating existing review:', existing.review_id);
      review = await prisma.review.update({
        where: { review_id: existing.review_id },
        data: { content: content.trim() },
        include: { 
          user: {
            select: {
              user_id: true,
              name: true
            }
          },
          book: {
            select: {
              book_id: true,
              name: true
            }
          }
        },
      });
    } else {
      console.log('Creating new review');
      review = await prisma.review.create({
        data: {
          user_id: authenticatedUserId,
          book_id: parseInt(book_id),
          content: content.trim(),
        },
        include: { 
          user: {
            select: {
              user_id: true,
              name: true
            }
          },
          book: {
            select: {
              book_id: true,
              name: true
            }
          }
        },
      });
      await createFollowingReviewAlert(authenticatedUserId, review.review_id, review.book_id);
    }

    console.log('Review saved successfully:', review.review_id);

    return new Response(
      JSON.stringify(review), 
      { status: existing ? 200 : 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Add/update review error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to save review', details: err.message }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}