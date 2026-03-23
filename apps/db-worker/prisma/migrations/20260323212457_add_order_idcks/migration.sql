/*
  Warnings:

  - A unique constraint covering the columns `[orderId]` on the table `Trade` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Trade_orderId_key" ON "Trade"("orderId");
