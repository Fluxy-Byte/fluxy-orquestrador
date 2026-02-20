/*
  Warnings:

  - The primary key for the `agent` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `agent` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `contact` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `contact` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `waba` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `waba` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Invitation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Member` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Organization` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Rdstation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Verification` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `wabaId` on the `contact` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `agentId` on the `waba` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "Invitation" DROP CONSTRAINT "Invitation_inviterId_fkey";

-- DropForeignKey
ALTER TABLE "Invitation" DROP CONSTRAINT "Invitation_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_userId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "contact" DROP CONSTRAINT "contact_wabaId_fkey";

-- DropForeignKey
ALTER TABLE "waba" DROP CONSTRAINT "waba_agentId_fkey";

-- DropForeignKey
ALTER TABLE "waba" DROP CONSTRAINT "waba_organizationId_fkey";

-- AlterTable
ALTER TABLE "agent" DROP CONSTRAINT "agent_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "agent_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "contact" DROP CONSTRAINT "contact_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "lastDateConversation" DROP DEFAULT,
DROP COLUMN "wabaId",
ADD COLUMN     "wabaId" INTEGER NOT NULL,
ADD CONSTRAINT "contact_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "waba" DROP CONSTRAINT "waba_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "agentId",
ADD COLUMN     "agentId" INTEGER NOT NULL,
ADD CONSTRAINT "waba_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "Invitation";

-- DropTable
DROP TABLE "Member";

-- DropTable
DROP TABLE "Organization";

-- DropTable
DROP TABLE "Rdstation";

-- DropTable
DROP TABLE "Session";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "Verification";

-- CreateTable
CREATE TABLE "rdstation" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "token_type" TEXT NOT NULL,
    "expires_in" INTEGER NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "rdstation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rdstation_name_key" ON "rdstation"("name");

-- CreateIndex
CREATE UNIQUE INDEX "rdstation_refresh_token_key" ON "rdstation"("refresh_token");

-- AddForeignKey
ALTER TABLE "waba" ADD CONSTRAINT "waba_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact" ADD CONSTRAINT "contact_wabaId_fkey" FOREIGN KEY ("wabaId") REFERENCES "waba"("id") ON DELETE CASCADE ON UPDATE CASCADE;
