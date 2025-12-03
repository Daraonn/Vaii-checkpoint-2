-- CreateTable
CREATE TABLE "Book" (
    "book_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "author" TEXT NOT NULL,
    "ISBN" TEXT NOT NULL,
    "image" TEXT NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("book_id")
);

-- CreateTable
CREATE TABLE "FavouriteBook" (
    "book_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "FavouriteBook_pkey" PRIMARY KEY ("user_id","book_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Book_ISBN_key" ON "Book"("ISBN");

-- AddForeignKey
ALTER TABLE "FavouriteBook" ADD CONSTRAINT "FavouriteBook_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavouriteBook" ADD CONSTRAINT "FavouriteBook_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Book"("book_id") ON DELETE RESTRICT ON UPDATE CASCADE;
