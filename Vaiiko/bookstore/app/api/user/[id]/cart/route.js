import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { getUserIdFromToken } from '@/app/lib/auth';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const userId = await getUserIdFromToken();


    if (!userId || userId !== parseInt(id)) {
      return new Response(
        JSON.stringify({ error: 'Not authorized' }), 
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { user_id: userId },
      include: { book: true },
      orderBy: { addedAt: 'desc' },
    });

    return new Response(
      JSON.stringify(cartItems), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Get cart error:', err);
    return new Response(
      JSON.stringify({ error: "Failed to fetch cart" }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}


export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const userId = await getUserIdFromToken();

    if (!userId || userId !== parseInt(id)) {
      return new Response(
        JSON.stringify({ error: 'Not authorized' }), 
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const bookIdNum = Number(body.book_id);
    const quantityNum = Number(body.quantity) || 1;

    if (bookIdNum == null || isNaN(bookIdNum)) {
      return new Response(
        JSON.stringify({ error: "Invalid book_id" }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (quantityNum < 1) {
      return new Response(
        JSON.stringify({ error: "Quantity must be at least 1" }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const existing = await prisma.cartItem.findUnique({
      where: { user_id_book_id: { user_id: userId, book_id: bookIdNum } },
      include: { book: true },
    });

    if (existing) {
      const updated = await prisma.cartItem.update({
        where: { cart_item_id: existing.cart_item_id },
        data: { quantity: existing.quantity + quantityNum },
        include: { book: true },
      });
      return new Response(
        JSON.stringify(updated), 
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      const newItem = await prisma.cartItem.create({
        data: { user_id: userId, book_id: bookIdNum, quantity: quantityNum },
        include: { book: true },
      });
      return new Response(
        JSON.stringify(newItem), 
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (err) {
    console.error("Cart POST error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to update cart" }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}