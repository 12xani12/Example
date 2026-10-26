/*
  Warnings:

  - You are about to drop the column `accessExpiresAt` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `accessTokenHash` on the `Order` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Order_accessTokenHash_key";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "accessExpiresAt",
DROP COLUMN "accessTokenHash";
