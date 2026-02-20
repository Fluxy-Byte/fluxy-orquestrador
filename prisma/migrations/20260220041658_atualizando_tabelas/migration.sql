/*
  Warnings:

  - You are about to drop the column `wabaId` on the `contact` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "contact" DROP CONSTRAINT "contact_wabaId_fkey";

-- AlterTable
ALTER TABLE "contact" DROP COLUMN "wabaId";

-- CreateTable
CREATE TABLE "contact_waba" (
    "id" SERIAL NOT NULL,
    "contactId" INTEGER NOT NULL,
    "wabaId" INTEGER NOT NULL,

    CONSTRAINT "contact_waba_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "contact_waba" ADD CONSTRAINT "contact_waba_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_waba" ADD CONSTRAINT "contact_waba_wabaId_fkey" FOREIGN KEY ("wabaId") REFERENCES "waba"("id") ON DELETE CASCADE ON UPDATE CASCADE;
