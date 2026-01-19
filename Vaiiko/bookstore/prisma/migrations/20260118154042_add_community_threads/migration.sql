-- CreateTable
CREATE TABLE "Thread" (
    "thread_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Thread_pkey" PRIMARY KEY ("thread_id")
);

-- CreateTable
CREATE TABLE "ThreadComment" (
    "comment_id" SERIAL NOT NULL,
    "thread_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThreadComment_pkey" PRIMARY KEY ("comment_id")
);

-- CreateIndex
CREATE INDEX "Thread_user_id_idx" ON "Thread"("user_id");

-- CreateIndex
CREATE INDEX "Thread_createdAt_idx" ON "Thread"("createdAt");

-- CreateIndex
CREATE INDEX "ThreadComment_thread_id_idx" ON "ThreadComment"("thread_id");

-- CreateIndex
CREATE INDEX "ThreadComment_user_id_idx" ON "ThreadComment"("user_id");

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThreadComment" ADD CONSTRAINT "ThreadComment_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "Thread"("thread_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThreadComment" ADD CONSTRAINT "ThreadComment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
