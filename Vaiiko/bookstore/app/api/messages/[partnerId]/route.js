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

// GET - Get messages with a specific user
export async function GET(req, context) {
  const userId = await getUserIdFromToken();
  const { params } = context;
  const resolvedParams = await params;
  const partnerId = Number(resolvedParams.partnerId);

  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'Not authenticated' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Check if blocked
    const blocked = await prisma.block.findFirst({
      where: {
        OR: [
          { blocker_id: userId, blocked_id: partnerId },
          { blocker_id: partnerId, blocked_id: userId }
        ]
      }
    });

    if (blocked) {
      return new Response(
        JSON.stringify({ error: 'Cannot message this user', blocked: true }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { sender_id: userId, receiver_id: partnerId },
          { sender_id: partnerId, receiver_id: userId }
        ]
      },
      include: {
        sender: {
          select: {
            user_id: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return new Response(
      JSON.stringify({ messages }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Error fetching messages:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch messages' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// POST - Send a message
export async function POST(req, context) {
  const userId = await getUserIdFromToken();
  const { params } = context;
  const resolvedParams = await params;
  const receiverId = Number(resolvedParams.partnerId);

  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'Not authenticated' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return new Response(
        JSON.stringify({ error: 'Message content is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if blocked
    const blocked = await prisma.block.findFirst({
      where: {
        OR: [
          { blocker_id: userId, blocked_id: receiverId },
          { blocker_id: receiverId, blocked_id: userId }
        ]
      }
    });

    if (blocked) {
      return new Response(
        JSON.stringify({ error: 'Cannot message this user' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const message = await prisma.message.create({
      data: {
        sender_id: userId,
        receiver_id: receiverId,
        content: content.trim()
      },
      include: {
        sender: {
          select: {
            user_id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    return new Response(
      JSON.stringify({ message }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Error sending message:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to send message' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}