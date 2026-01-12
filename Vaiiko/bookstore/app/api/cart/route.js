import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

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
    console.error("JWT verify error:", err);
    return null;
  }
}

export async function GET() {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) return new Response(JSON.stringify([]), { status: 200 });

    const cartItems = await prisma.cartItem.findMany({
      where: { user_id: userId },
      include: { book: true },
    });

    return new Response(JSON.stringify(cartItems), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to fetch cart" }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });

    const body = await req.json();
    const bookIdNum = Number(body.book_id);
    const quantityNum = Number(body.quantity);

    if (bookIdNum == null || quantityNum == null || isNaN(bookIdNum) || isNaN(quantityNum)) {
      return new Response(JSON.stringify({ error: "Invalid book_id or quantity" }), { status: 400 });
    }

    const existing = await prisma.cartItem.findUnique({
      where: { user_id_book_id: { user_id: userId, book_id: bookIdNum } },
    });

    if (existing) {
      const updated = await prisma.cartItem.update({
        where: { cart_item_id: existing.cart_item_id },
        data: { quantity: existing.quantity + quantityNum },
      });
      return new Response(JSON.stringify(updated), { status: 200 });
    } else {
      const newItem = await prisma.cartItem.create({
        data: { user_id: userId, book_id: bookIdNum, quantity: quantityNum },
      });
      return new Response(JSON.stringify(newItem), { status: 201 });
    }
  } catch (err) {
    console.error("Cart POST error:", err);
    return new Response(JSON.stringify({ error: "Failed to update cart" }), { status: 500 });
  }
}
