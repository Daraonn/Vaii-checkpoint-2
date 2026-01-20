import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { getUserIdFromToken } from '@/app/lib/auth';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

export async function PATCH(request, { params }) {
  try {
    const { id, itemId } = await params;
    const userId = await getUserIdFromToken();

    if (!userId || userId !== parseInt(id)) {
      return new Response(
        JSON.stringify({ error: "Not authorized" }), 
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const cartItemId = Number(itemId);
    if (isNaN(cartItemId)) {
      return new Response(
        JSON.stringify({ error: "Invalid cart item ID" }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { quantity } = body;

    if (!quantity || quantity < 1) {
      return new Response(
        JSON.stringify({ error: "Quantity must be at least 1" }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const updated = await prisma.cartItem.updateMany({
      where: { cart_item_id: cartItemId, user_id: userId },
      data: { quantity },
    });

    if (updated.count === 0) {
      return new Response(
        JSON.stringify({ error: "Cart item not found" }), 
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const updatedItem = await prisma.cartItem.findUnique({
      where: { cart_item_id: cartItemId },
      include: { book: true },
    });

    return new Response(
      JSON.stringify(updatedItem), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error("PATCH cart error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to update cart item" }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}


export async function DELETE(request, { params }) {
  try {
    const { id, itemId } = await params;
    const userId = await getUserIdFromToken();

    if (!userId || userId !== parseInt(id)) {
      return new Response(
        JSON.stringify({ error: "Not authorized" }), 
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const cartItemId = Number(itemId);
    if (isNaN(cartItemId)) {
      return new Response(
        JSON.stringify({ error: "Invalid cart item ID" }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const deleted = await prisma.cartItem.deleteMany({
      where: { cart_item_id: cartItemId, user_id: userId },
    });

    if (deleted.count === 0) {
      return new Response(
        JSON.stringify({ error: "Cart item not found" }), 
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(null, { status: 204 });
  } catch (err) {
    console.error("DELETE cart error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to delete cart item" }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}