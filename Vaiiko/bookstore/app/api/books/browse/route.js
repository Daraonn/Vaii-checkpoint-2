import prisma from "../../../lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const genresParam = searchParams.get("genres");

    
    const genreIds = genresParam
      ? genresParam
          .split(",")
          .map((id) => parseInt(id, 10))
          .filter((id) => !isNaN(id))
      : [];

    
    const books = await prisma.book.findMany({
      where: genreIds.length
        ? {
            genres: {
              some: {
                genre_id: {
                  in: genreIds,
                },
              },
            },
          }
        : undefined,
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
      },
    });

    return new Response(JSON.stringify({ books }), { status: 200 });
  } catch (err) {
    console.error("Error fetching books:", err);
    return new Response(
      JSON.stringify({ error: "Failed to browse books" }),
      { status: 500 }
    );
  }
}
