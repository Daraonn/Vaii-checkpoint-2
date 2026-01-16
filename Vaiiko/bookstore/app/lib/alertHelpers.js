import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function createFollowingReviewAlert(actorId, reviewId, bookId) {
  try {
    
    const followers = await prisma.follow.findMany({
      where: { following_id: actorId },
      select: { follower_id: true }
    });

    
    const alerts = followers.map(follower => ({
      user_id: follower.follower_id,
      actor_id: actorId,
      type: 'FOLLOWING_REVIEWED',
      review_id: reviewId,
      book_id: bookId
    }));

    if (alerts.length > 0) {
      await prisma.alert.createMany({ data: alerts });
    }
  } catch (error) {
    console.error('Error creating following review alerts:', error);
  }
}


export async function createFollowingCommentAlert(actorId, commentId, reviewId) {
  try {
    
    const followers = await prisma.follow.findMany({
      where: { following_id: actorId },
      select: { follower_id: true }
    });


    const alerts = followers.map(follower => ({
      user_id: follower.follower_id,
      actor_id: actorId,
      type: 'FOLLOWING_COMMENTED',
      comment_id: commentId,
      review_id: reviewId
    }));

    if (alerts.length > 0) {
      await prisma.alert.createMany({ data: alerts });
    }
  } catch (error) {
    console.error('Error creating following comment alerts:', error);
  }
}


export async function createCommentOnReviewAlert(actorId, commentId, reviewId, reviewOwnerId) {
  try {
    
    if (actorId === reviewOwnerId) return;

    await prisma.alert.create({
      data: {
        user_id: reviewOwnerId,
        actor_id: actorId,
        type: 'COMMENT_ON_YOUR_REVIEW',
        comment_id: commentId,
        review_id: reviewId
      }
    });
  } catch (error) {
    console.error('Error creating comment on review alert:', error);
  }
}