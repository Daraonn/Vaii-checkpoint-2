-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "is_read" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Message_receiver_id_is_read_idx" ON "Message"("receiver_id", "is_read");
