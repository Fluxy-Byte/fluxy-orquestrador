/*
  Warnings:

  - You are about to drop the column `ownerId` on the `organization` table. All the data in the column will be lost.
  - You are about to drop the column `accessedAt` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `bannedAt` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `lastAccessAt` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `user` table. All the data in the column will be lost.
  - The `role` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `createdAt` on the `waba` table. All the data in the column will be lost.
  - You are about to drop the `rdstation` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `session` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "organization" DROP CONSTRAINT "organization_ownerId_fkey";

-- AlterTable
ALTER TABLE "contact" ALTER COLUMN "lastDateConversation" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "organization" DROP COLUMN "ownerId";

-- AlterTable
ALTER TABLE "session" DROP COLUMN "accessedAt",
ADD COLUMN     "activeOrganizationId" INTEGER,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "impersonatedBy" TEXT,
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userAgent" TEXT;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "bannedAt",
DROP COLUMN "lastAccessAt",
DROP COLUMN "passwordHash",
ADD COLUMN     "banned" BOOLEAN DEFAULT false,
DROP COLUMN "role",
ADD COLUMN     "role" TEXT;

-- AlterTable
ALTER TABLE "waba" DROP COLUMN "createdAt";

-- DropTable
DROP TABLE "rdstation";

-- CreateTable
CREATE TABLE "Rdstation" (
    "id" INTEGER NOT NULL,
    "access_token" TEXT NOT NULL,
    "token_type" TEXT NOT NULL,
    "expires_in" INTEGER NOT NULL,
    "refresh_token" TEXT NOT NULL,

    CONSTRAINT "Rdstation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rdstation_refresh_token_key" ON "Rdstation"("refresh_token");
