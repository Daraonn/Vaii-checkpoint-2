import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const ratings = await prisma.rating.findMany({
      where: { book_id: parseInt(id) },
      include: { 
        user: {
          select: {
            user_id: true,
            name: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    
    const completedRatings = ratings.filter(r => r.stars !== null);
    const averageRating = completedRatings.length > 0
      ? completedRatings.reduce((sum, r) => sum + r.stars, 0) / completedRatings.length
      : 0;

    
    const statusCounts = {
      COMPLETED: ratings.filter(r => r.status === 'COMPLETED').length,
      WANT_TO_READ: ratings.filter(r => r.status === 'WANT_TO_READ').length,
      CURRENTLY_READING: ratings.filter(r => r.status === 'CURRENTLY_READING').length,
      DNF: ratings.filter(r => r.status === 'DNF').length,
    };

    return new Response(
      JSON.stringify({ 
        ratings,
        averageRating: Math.round(averageRating * 10) / 10,
        totalRatings: completedRatings.length,
        statusCounts,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Get book ratings error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch ratings' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
