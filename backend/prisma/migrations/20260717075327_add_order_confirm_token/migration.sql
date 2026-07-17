/*
  Warnings:

  - A unique constraint covering the columns `[confirmToken]` on the table `orders` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "confirmExpiredAt" TIMESTAMP(3),
ADD COLUMN     "confirmToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "orders_confirmToken_key" ON "orders"("confirmToken");
