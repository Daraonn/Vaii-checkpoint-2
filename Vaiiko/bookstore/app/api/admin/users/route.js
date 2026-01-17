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
    const { email, password, passwordConfirm, name, isAdmin } = await req.json();

    // Validate required fields
    if (!email || !password || !name) {
      return new Response(
        JSON.stringify({ error: "Email, password, and name are required." }),
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Please provide a valid email address." }),
        { status: 400 }
      );
    }

    // Validate name length
    if (name.trim().length < 3) {
      return new Response(
        JSON.stringify({ error: "Name must be at least 3 characters long." }),
        { status: 400 }
      );
    }

    if (name.trim().length > 25) {
      return new Response(
        JSON.stringify({ error: "Name must not exceed 25 characters." }),
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 8 characters long." }),
        { status: 400 }
      );
    }

    if (password.length > 72) {
      return new Response(
        JSON.stringify({ error: "Password must not exceed 72 characters." }),
        { status: 400 }
      );
    }

    // Validate password confirmation
    if (password !== passwordConfirm) {
      return new Response(
        JSON.stringify({ error: "Passwords do not match." }),
        { status: 400 }
      );
    }

    // Check for existing email
    const existingEmail = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingEmail) {
      return new Response(
        JSON.stringify({ error: "A user with this email already exists." }),
        { status: 400 }
      );
    }

    // Check for existing name
    const existingName = await prisma.user.findFirst({
      where: { name: name.trim() }
    });

    if (existingName) {
      return new Response(
        JSON.stringify({ error: "A user with this name already exists." }),
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        name: name.trim(),
        isAdmin: Boolean(isAdmin)
      }
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return new Response(JSON.stringify(userWithoutPassword), { status: 201 });

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