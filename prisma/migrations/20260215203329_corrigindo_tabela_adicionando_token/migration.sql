-- AlterTable
ALTER TABLE "Rdstation" ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Rdstation_pkey" PRIMARY KEY ("id");
