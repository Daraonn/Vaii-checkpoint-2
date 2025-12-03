import prisma from "../../lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const nameQuery = searchParams.get("name") || "";

    const books = await prisma.book.findMany({
      where: nameQuery
        ? { name: { contains: nameQuery, mode: "insensitive" } }
        : undefined,
    });

    return new Response(JSON.stringify({ books }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to fetch books" }), { status: 500 });
  }
}