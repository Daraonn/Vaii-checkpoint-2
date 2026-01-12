/*
  Warnings:

  - The primary key for the `FavouriteBook` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[user_id,book_id]` on the table `FavouriteBook` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "FavouriteBook" DROP CONSTRAINT "FavouriteBook_pkey",
ADD COLUMN     "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "favourite_id" SERIAL NOT NULL,
ADD CONSTRAINT "FavouriteBook_pkey" PRIMARY KEY ("favourite_id");

-- CreateIndex
CREATE UNIQUE INDEX "FavouriteBook_user_id_book_id_key" ON "FavouriteBook"("user_id", "book_id");
