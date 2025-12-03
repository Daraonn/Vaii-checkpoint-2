import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


export async function GET() {
  try {
    const books = await prisma.book.findMany();
    return new Response(JSON.stringify({ books }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to fetch books" }), { status: 500 });
  }
}


export async function POST(req) {
  try {
    const { name, author, price, ISBN } = await req.json();

    
    const existing = await prisma.book.findUnique({
      where: { ISBN }
    });

    if (existing) {
      return new Response(
        JSON.stringify({ error: "A book with this ISBN already exists." }),
        { status: 400 }
      );
    }

    
    const book = await prisma.book.create({
      data: { name, author, price: Number(price), ISBN }
    });

    return new Response(JSON.stringify(book), { status: 201 });

  } catch (err) {
    console.error(err);

    
    if (err.code === "P2002") {
      return new Response(
        JSON.stringify({ error: "Duplicate ISBN. Book already exists." }), 
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({ error: "Failed to add book" }),
      { status: 500 }
    );
  }
}
