-- CreateEnum
CREATE TYPE "LearningCategory" AS ENUM ('PEOPLE', 'SCHOOL', 'ANIMALS', 'COLORS', 'NUMBERS', 'ARABIC_ALPHABET', 'ENGLISH_ALPHABET', 'CONVERSATION', 'EMOTIONS', 'COMMUNICATION');

-- CreateTable
CREATE TABLE "LearningItem" (
    "id" TEXT NOT NULL,
    "category" "LearningCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT,
    "audioUrl" TEXT,
    "phrases" TEXT[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LearningItem_category_idx" ON "LearningItem"("category");
