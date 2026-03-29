-- AlterTable
ALTER TABLE "Guide" ADD COLUMN     "likesCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "lat" DOUBLE PRECISION,
ADD COLUMN     "lon" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "GuideLike" (
    "id" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuideLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GuideLike_guideId_idx" ON "GuideLike"("guideId");

-- CreateIndex
CREATE INDEX "GuideLike_userId_idx" ON "GuideLike"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GuideLike_guideId_userId_key" ON "GuideLike"("guideId", "userId");

-- CreateIndex
CREATE INDEX "Guide_likesCount_idx" ON "Guide"("likesCount");

-- AddForeignKey
ALTER TABLE "GuideLike" ADD CONSTRAINT "GuideLike_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "Guide"("id") ON DELETE CASCADE ON UPDATE CASCADE;
