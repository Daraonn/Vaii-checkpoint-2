import { PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getUserIdFromToken } from '@/app/lib/auth';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;



export async function GET(req) {
  const userId = await getUserIdFromToken();

  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'Not authenticated' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { sender_id: userId },
          { receiver_id: userId }
        ],
        is_deleted: false
      },
      include: {
        sender: {
          select: {
            user_id: true,
            name: true,
            username: true,
            avatar: true
          }
        },
        receiver: {
          select: {
            user_id: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    
    const conversationsMap = new Map();
    
    messages.forEach(msg => {
      const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      const partner = msg.sender_id === userId ? msg.receiver : msg.sender;
      
      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, {
          partner,
          lastMessage: msg,
          unreadCount: 0
        });
      }
    });

    const conversations = Array.from(conversationsMap.values());

    return new Response(
      JSON.stringify({ conversations }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Error fetching conversations:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch conversations' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}