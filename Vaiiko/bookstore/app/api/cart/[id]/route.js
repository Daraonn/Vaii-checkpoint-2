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


export async function PATCH(req, context) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId)
      return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });

    const params = await context.params; // unwrap params
    const cartItemId = Number(params.id);

    if (isNaN(cartItemId))
      return new Response(JSON.stringify({ error: "Invalid cart item ID" }), { status: 400 });

    const body = await req.json();
    const { quantity } = body;

    if (!quantity || quantity < 1)
      return new Response(JSON.stringify({ error: "Quantity must be at least 1" }), { status: 400 });

    const updated = await prisma.cartItem.updateMany({
      where: { cart_item_id: cartItemId, user_id: userId },
      data: { quantity },
    });

    if (updated.count === 0)
      return new Response(JSON.stringify({ error: "Cart item not found" }), { status: 404 });

    return new Response(JSON.stringify({ cart_item_id: cartItemId, quantity }), { status: 200 });
  } catch (err) {
    console.error("PATCH error:", err);
    return new Response(JSON.stringify({ error: "Failed to update cart item" }), { status: 500 });
  }
}


export async function DELETE(req, context) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId)
      return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });

    const params = await context.params; 
    const cartItemId = Number(params.id);

    if (isNaN(cartItemId))
      return new Response(JSON.stringify({ error: "Invalid cart item ID" }), { status: 400 });

    const deleted = await prisma.cartItem.deleteMany({
      where: { cart_item_id: cartItemId, user_id: userId },
    });

    if (deleted.count === 0)
      return new Response(JSON.stringify({ error: "Cart item not found" }), { status: 404 });

    return new Response(null, { status: 204 });
  } catch (err) {
    console.error("DELETE error:", err);
    return new Response(JSON.stringify({ error: "Failed to delete cart item" }), { status: 500 });
  }
}
