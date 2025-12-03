import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: { favouriteBooks: true }
    });
    return new Response(JSON.stringify({ users }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to fetch users" }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { email, password, name, isAdmin } = await req.json();

    
    if (!password || password.length < 8) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 8 characters long." }),
        { status: 400 }
      );
    }

    
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    });

    if (existingEmail) {
      return new Response(
        JSON.stringify({ error: "A user with this email already exists." }),
        { status: 400 }
      );
    }

    
    const existingName = await prisma.user.findFirst({
      where: { name }
    });

    if (existingName) {
      return new Response(
        JSON.stringify({ error: "A user with this name already exists." }),
        { status: 400 }
      );
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        isAdmin: Boolean(isAdmin)
      }
    });

    return new Response(JSON.stringify(user), { status: 201 });

  } catch (err) {
    console.error(err);

    if (err.code === "P2002") {
      return new Response(
        JSON.stringify({ error: "Duplicate user. Email or name already exists." }),
        { status: 400 }
      );
    }

    return new Response(JSON.stringify({ error: "Failed to create user" }), { status: 500 });
  }
}
