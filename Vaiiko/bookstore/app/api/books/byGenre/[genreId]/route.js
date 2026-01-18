export async function GET(request, { params }) {
  try {
    const genreName = params.genreName;
    
    const genre = await prisma.genre.findFirst({
      where: { 
        name: { 
          contains: genreName, 
          mode: 'insensitive' 
        } 
      }
    });

    if (!genre) {
      return Response.json({ books: [] });
    }

    const books = await prisma.book.findMany({
      take: 6,
      where: {
        genres: {
          some: {
            genre_id: genre.genre_id
          }
        }
      },
      include: {
        genres: {
          include: {
            genre: true
          }
        }
      }
    });

    return Response.json({ books, genre });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to fetch genre books' }, { status: 500 });
  }
}