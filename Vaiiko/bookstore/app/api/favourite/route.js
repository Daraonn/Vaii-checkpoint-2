import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

async function getUserIdFromToken() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("token");
  if (!tokenCookie) return null;
  try {
    const payload = jwt.verify(tokenCookie.value, JWT_SECRET);
    if (typeof payload === "object" && payload && "user_id" in payload) return payload.user_id;
  } catch (err) {
    console.error(err);
  }
  return null;
}

export async function GET() {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) return new Response(JSON.stringify([]), { status: 200 });

    const favourites = await prisma.favouriteBook.findMany({
      where: { user_id: userId },
      include: { book: true },
      orderBy: { addedAt: "desc" },
    });

    return new Response(JSON.stringify(favourites), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to fetch favourites" }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });

    const { book_id } = await req.json();
    const bookIdNum = Number(book_id);
    if (!bookIdNum || isNaN(bookIdNum)) return new Response(JSON.stringify({ error: "Invalid book_id" }), { status: 400 });

    const existing = await prisma.favouriteBook.findUnique({
      where: { user_id_book_id: { user_id: userId, book_id: bookIdNum } },
    });

    if (existing) return new Response(JSON.stringify(existing), { status: 200 });

    const favourite = await prisma.favouriteBook.create({
      data: { user_id: userId, book_id: bookIdNum },
      include: { book: true }, 
    });


    return new Response(JSON.stringify(favourite), { status: 201 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to add favourite" }), { status: 500 });
  }
}