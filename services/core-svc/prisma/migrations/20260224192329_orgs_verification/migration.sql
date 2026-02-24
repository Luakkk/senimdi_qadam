/*
  Warnings:

  - Added the required column `updatedAt` to the `Organization` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrgStatus" AS ENUM ('DRAFT', 'PENDING', 'VERIFIED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "accessLift" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "accessRamp" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "address" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "lat" DOUBLE PRECISION,
ADD COLUMN     "lon" DOUBLE PRECISION,
ADD COLUMN     "onlineConsult" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "status" "OrgStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "telegram" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedBy" TEXT,
ADD COLUMN     "website" TEXT,
ADD COLUMN     "whatsapp" TEXT,
ADD COLUMN     "wheelchair" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "city" SET DEFAULT 'Almaty';

-- CreateTable
CREATE TABLE "VerificationLog" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "statusFrom" "OrgStatus" NOT NULL,
    "statusTo" "OrgStatus" NOT NULL,
    "method" TEXT NOT NULL,
    "moderatorId" TEXT,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VerificationLog_organizationId_idx" ON "VerificationLog"("organizationId");

-- AddForeignKey
ALTER TABLE "VerificationLog" ADD CONSTRAINT "VerificationLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
