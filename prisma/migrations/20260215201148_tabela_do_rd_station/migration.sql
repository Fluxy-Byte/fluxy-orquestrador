-- CreateTable
CREATE TABLE "RDSTATIOCRM" (
    "access_token" TEXT NOT NULL,
    "token_type" TEXT NOT NULL,
    "expires_in" INTEGER NOT NULL,
    "refresh_token" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "RDSTATIOCRM_refresh_token_key" ON "RDSTATIOCRM"("refresh_token");
