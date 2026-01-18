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
        reviews: true,
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

    const popularBooks = books
      .map(book => {
        const avgRating = book.ratings.length > 0
          ? book.ratings.reduce((sum, r) => sum + r.stars, 0) / book.ratings.length
          : 0;
        
        return {
          ...book,
          reviewCount: book.reviews.length,
          avgRating: avgRating,
          ratingCount: book.ratings.length
        };
      })
      .filter(book => book.reviewCount > 0)
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, 8);

    return Response.json({ books: popularBooks });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to fetch popular books' }, { status: 500 });
  }
}