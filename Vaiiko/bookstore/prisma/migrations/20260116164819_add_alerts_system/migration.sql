-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('FOLLOWING_REVIEWED', 'FOLLOWING_COMMENTED', 'COMMENT_ON_YOUR_REVIEW');

-- CreateTable
CREATE TABLE "Alert" (
    "alert_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "actor_id" INTEGER NOT NULL,
    "type" "AlertType" NOT NULL,
    "review_id" INTEGER,
    "comment_id" INTEGER,
    "book_id" INTEGER,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("alert_id")
);

-- CreateIndex
CREATE INDEX "Alert_user_id_is_read_idx" ON "Alert"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "Alert_user_id_createdAt_idx" ON "Alert"("user_id", "createdAt");

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "Review"("review_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "ReviewComment"("comment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Book"("book_id") ON DELETE CASCADE ON UPDATE CASCADE;
