-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AlertType" ADD VALUE 'THREAD_COMMENT';
ALTER TYPE "AlertType" ADD VALUE 'FOLLOWED_USER_THREAD';

-- AlterTable
ALTER TABLE "Alert" ADD COLUMN     "thread_comment_id" INTEGER,
ADD COLUMN     "thread_id" INTEGER;

-- CreateTable
CREATE TABLE "ThreadFollow" (
    "follow_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "thread_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ThreadFollow_pkey" PRIMARY KEY ("follow_id")
);

-- CreateIndex
CREATE INDEX "ThreadFollow_user_id_idx" ON "ThreadFollow"("user_id");

-- CreateIndex
CREATE INDEX "ThreadFollow_thread_id_idx" ON "ThreadFollow"("thread_id");

-- CreateIndex
CREATE UNIQUE INDEX "ThreadFollow_user_id_thread_id_key" ON "ThreadFollow"("user_id", "thread_id");

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "Thread"("thread_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_thread_comment_id_fkey" FOREIGN KEY ("thread_comment_id") REFERENCES "ThreadComment"("comment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThreadFollow" ADD CONSTRAINT "ThreadFollow_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThreadFollow" ADD CONSTRAINT "ThreadFollow_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "Thread"("thread_id") ON DELETE CASCADE ON UPDATE CASCADE;
