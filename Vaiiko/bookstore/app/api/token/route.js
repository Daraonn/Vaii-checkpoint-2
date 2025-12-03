import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export async function GET() {
  try {

    const cookieStore = await cookies();  

    const tokenCookie = cookieStore.get('token');
    const token = tokenCookie?.value;

    if (!token) {
      return new Response(JSON.stringify({ user: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const payload = jwt.verify(token, JWT_SECRET);

    if (typeof payload !== 'object' || payload === null || !('user_id' in payload)) {
        return new Response(JSON.stringify({ user: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

  const user = await prisma.user.findUnique({
  where: { user_id: payload.user_id },
  });

  return new Response(
    JSON.stringify({
    user: user ? { id: user.user_id, name: user.name, email: user.email, isAdmin: user.isAdmin } : null,
    }),
  { status: 200, headers: { 'Content-Type': 'application/json' } }
  );

  } catch (err) {
    console.error('Token API error:', err);
    return new Response(JSON.stringify({ user: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
