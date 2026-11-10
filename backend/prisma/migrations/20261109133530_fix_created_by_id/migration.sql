/*
  Warnings:

  - You are about to drop the column `createdId` on the `Ticket` table. All the data in the column will be lost.
  - Added the required column `createdById` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_createdId_fkey";

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "createdId",
ADD COLUMN     "createdById" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
