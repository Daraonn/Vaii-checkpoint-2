import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const books = await prisma.book.findMany({
      take: 20,
      include: {
        genres: {
          include: {
            genre: true
          }
        },
        ratings: {
          where: {
            stars: {
              not: null
            }
          },
          select: {
            stars: true
          }
        }
      }
    });

    const booksWithRatings = books
      .map(book => ({
        ...book,
        avgRating: book.ratings.length > 0 
          ? book.ratings.reduce((sum, r) => sum + r.stars, 0) / book.ratings.length 
          : 0,
        ratingCount: book.ratings.length
      }))
      .filter(book => book.ratingCount > 0)
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 8);

    return Response.json({ books: booksWithRatings });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to fetch best rated books' }, { status: 500 });
  }
}