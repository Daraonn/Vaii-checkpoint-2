-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_book_id_fkey";

-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_user_id_fkey";

-- DropForeignKey
ALTER TABLE "FavouriteBook" DROP CONSTRAINT "FavouriteBook_book_id_fkey";

-- DropForeignKey
ALTER TABLE "FavouriteBook" DROP CONSTRAINT "FavouriteBook_user_id_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_book_id_fkey";

-- AddForeignKey
ALTER TABLE "FavouriteBook" ADD CONSTRAINT "FavouriteBook_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavouriteBook" ADD CONSTRAINT "FavouriteBook_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Book"("book_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Book"("book_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Book"("book_id") ON DELETE CASCADE ON UPDATE CASCADE;
