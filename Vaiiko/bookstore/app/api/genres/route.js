import prisma from "../../lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const nameQuery = searchParams.get("name") || "";

    const genres = await prisma.genre.findMany({
      where: nameQuery
        ? { name: { contains: nameQuery, mode: "insensitive" } }
        : undefined,
      select: {
        genre_id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return new Response(JSON.stringify({ genres }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Failed to fetch genres" }),
      { status: 500 }
    );
  }
}
