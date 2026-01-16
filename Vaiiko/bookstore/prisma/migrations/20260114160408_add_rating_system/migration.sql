-- CreateEnum
CREATE TYPE "ReadingStatus" AS ENUM ('COMPLETED', 'WANT_TO_READ', 'CURRENTLY_READING', 'DNF');

-- CreateTable
CREATE TABLE "Rating" (
    "rating_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "book_id" INTEGER NOT NULL,
    "stars" INTEGER,
    "status" "ReadingStatus" NOT NULL,
    "review" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("rating_id")
);

-- CreateIndex
CREATE INDEX "Rating_book_id_idx" ON "Rating"("book_id");

-- CreateIndex
CREATE INDEX "Rating_user_id_idx" ON "Rating"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_user_id_book_id_key" ON "Rating"("user_id", "book_id");

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Book"("book_id") ON DELETE CASCADE ON UPDATE CASCADE;
