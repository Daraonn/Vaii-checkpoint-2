import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

export async function getUserIdFromToken() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("token");
  if (!tokenCookie) return null;
  
  try {
    const payload = jwt.verify(tokenCookie.value, JWT_SECRET);
    if (typeof payload === "object" && payload && "user_id" in payload) {
      return payload.user_id;
    }
  } catch (err) {
    console.error('Token verification error:', err);
  }
  
  return null;
}