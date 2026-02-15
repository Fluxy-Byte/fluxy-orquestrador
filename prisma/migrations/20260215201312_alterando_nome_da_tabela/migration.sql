/*
  Warnings:

  - You are about to drop the `RDSTATIOCRM` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "RDSTATIOCRM";

-- CreateTable
CREATE TABLE "Rdstation" (
    "access_token" TEXT NOT NULL,
    "token_type" TEXT NOT NULL,
    "expires_in" INTEGER NOT NULL,
    "refresh_token" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Rdstation_refresh_token_key" ON "Rdstation"("refresh_token");
