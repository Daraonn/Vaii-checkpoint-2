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

// PUT - Edit message
export async function PUT(req, context) {
  const userId = await getUserIdFromToken();
  const { params } = context;
  const resolvedParams = await params;
  const messageId = Number(resolvedParams.messageId);

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

    const message = await prisma.message.findUnique({
      where: { message_id: messageId }
    });

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (message.sender_id !== userId) {
      return new Response(
        JSON.stringify({ error: 'Not authorized' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (message.is_deleted) {
      return new Response(
        JSON.stringify({ error: 'Cannot edit deleted message' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const updatedMessage = await prisma.message.update({
      where: { message_id: messageId },
      data: {
        content: content.trim(),
        is_edited: true
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
      JSON.stringify({ message: updatedMessage }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Error editing message:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to edit message' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// DELETE - Soft delete message
export async function DELETE(req, context) {
  const userId = await getUserIdFromToken();
  const { params } = context;
  const resolvedParams = await params;
  const messageId = Number(resolvedParams.messageId);

  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'Not authenticated' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const message = await prisma.message.findUnique({
      where: { message_id: messageId }
    });

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (message.sender_id !== userId) {
      return new Response(
        JSON.stringify({ error: 'Not authorized' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const deletedMessage = await prisma.message.update({
      where: { message_id: messageId },
      data: {
        is_deleted: true,
        content: '[Message deleted]'
      }
    });

    return new Response(
      JSON.stringify({ message: deletedMessage }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Error deleting message:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to delete message' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}