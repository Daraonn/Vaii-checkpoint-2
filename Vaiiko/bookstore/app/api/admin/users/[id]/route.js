import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();


export async function GET(req, context) {
  const { params } = context;
  const resolvedParams = await params;
  const userId = Number(resolvedParams.id);

  if (isNaN(userId))
    return new Response(JSON.stringify({ error: "Invalid user ID" }), { status: 400 });

  const user = await prisma.user.findUnique({
    where: { user_id: userId },
    include: { favouriteBooks: true } 
  });

  if (!user)
    return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });

  return new Response(JSON.stringify({ user }), { status: 200 });
}


export async function PATCH(req, context) {
  const { params } = context;
  const resolvedParams = await params;
  const userId = Number(resolvedParams.id);

  if (isNaN(userId))
    return new Response(JSON.stringify({ error: "Invalid user ID" }), { status: 400 });

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const { email, password, name, isAdmin } = body;

  if (!email && !password && !name && isAdmin === undefined)
    return new Response(JSON.stringify({ error: "No fields to update" }), { status: 400 });

  try {
    const dataToUpdate = {
      email: email || undefined,
      name: name || undefined,
      isAdmin: isAdmin !== undefined ? Boolean(isAdmin) : undefined
    };

    
    if (password) {
      if (password.length < 8) {
        return new Response(
          JSON.stringify({ error: "Password must be at least 8 characters long." }),
          { status: 400 }
        );
      }
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { user_id: userId },
      data: dataToUpdate
    });

    return new Response(JSON.stringify({ user: updatedUser }), { status: 200 });
  } catch (err) {
    if (err.code === "P2025")
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}


export async function DELETE(req, context) {
  const { params } = context;
  const resolvedParams = await params;
  const userId = Number(resolvedParams.id);

  if (isNaN(userId))
    return new Response(JSON.stringify({ error: "Invalid user ID" }), { status: 400 });

  try {
    await prisma.user.delete({ where: { user_id: userId } });
    return new Response(JSON.stringify({ message: "User deleted successfully" }), { status: 200 });
  } catch (err) {
    if (err.code === "P2025")
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
