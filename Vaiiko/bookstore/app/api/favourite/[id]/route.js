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

export async function DELETE(req, context) {
  const userId = await getUserIdFromToken();
  if (!userId) return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
  const params = await context.params;
  const bookId = Number(params.id);
  if (isNaN(bookId)) return new Response(JSON.stringify({ error: "Invalid book ID" }), { status: 400 });

  try {
    const deleted = await prisma.favouriteBook.deleteMany({
      where: { book_id: bookId, user_id: userId },
    });

    if (deleted.count === 0) return new Response(JSON.stringify({ error: "Favourite not found" }), { status: 404 });

    return new Response(null, { status: 204 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to delete favourite" }), { status: 500 });
  }
}