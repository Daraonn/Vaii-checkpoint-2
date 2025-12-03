import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export async function POST(req) {
  try {
    const { emailOrName, password } = await req.json();

    if (!emailOrName || !password) {
      return new Response(JSON.stringify({ error: 'Email/username and password are required.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const user = await prisma.user.findFirst({
      where: { OR: [{ email: emailOrName }, { name: emailOrName }] },
    });

    if (!user) return new Response(JSON.stringify({ error: 'User not found.' }), { status: 404, headers: { 'Content-Type': 'application/json' } });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return new Response(JSON.stringify({ error: 'Invalid password.' }), { status: 401, headers: { 'Content-Type': 'application/json' } });


    const token = jwt.sign(
      { user_id: user.user_id, name: user.name, email: user.email, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}`, // 7 days
      },
    });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Server error.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}