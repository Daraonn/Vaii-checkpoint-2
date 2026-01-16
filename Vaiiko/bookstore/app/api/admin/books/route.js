import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const books = await prisma.book.findMany({
      include: {
        genres: {
          include: { genre: true },
        },
      },
    });
    return new Response(JSON.stringify({ books }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Failed to fetch books" }),
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const {
      name,
      author,
      price,
      ISBN,
      image,
      about,
      language,
      year,
      genres, // Array of genre IDs
    } = await req.json();

    if (!name || !author || !ISBN || !about || !language || !year) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    const existing = await prisma.book.findUnique({
      where: { ISBN },
    });

    if (existing) {
      return new Response(
        JSON.stringify({ error: "A book with this ISBN already exists." }),
        { status: 400 }
      );
    }

    // Create the book and link genres
    const book = await prisma.book.create({
      data: {
        name,
        author,
        price: Number(price),
        ISBN,
        image: image || null,
        about,
        language,
        year: Number(year),
        genres: genres && genres.length > 0
          ? {
              create: genres.map((genreId) => ({ genre_id: Number(genreId) })),
            }
          : undefined,
      },
      include: {
        genres: {
          include: { genre: true },
        },
      },
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
