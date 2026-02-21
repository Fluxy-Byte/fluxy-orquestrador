/*
  Warnings:

  - Added the required column `organizationId` to the `agent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "agent" ADD COLUMN     "organizationId" TEXT NOT NULL;
