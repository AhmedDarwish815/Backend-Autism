-- CreateEnum
CREATE TYPE "RoutineStatus" AS ENUM ('PENDING', 'COMPLETED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "BadgeType" AS ENUM ('FIRST_STEPS', 'LEARNING_STAR', 'EARLY_BIRD', 'MEMORY_MASTER', 'PUZZLE_PRO', 'ROUTINE_CHAMPION', 'COMMUNICATION_HERO', 'EMOTIONS_EXPERT');

-- CreateTable
CREATE TABLE "LearningLog" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearningLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutineTask" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "iconName" TEXT,
    "scheduledTime" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isDefault" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoutineTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutineLog" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "status" "RoutineStatus" NOT NULL DEFAULT 'PENDING',
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "RoutineLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reward" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "totalStars" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "type" "BadgeType" NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameScore" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "gameType" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "moves" INTEGER,
    "timeSpent" INTEGER,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "playedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LearningLog_childId_idx" ON "LearningLog"("childId");

-- CreateIndex
CREATE INDEX "LearningLog_itemId_idx" ON "LearningLog"("itemId");

-- CreateIndex
CREATE INDEX "RoutineTask_sortOrder_idx" ON "RoutineTask"("sortOrder");

-- CreateIndex
CREATE INDEX "RoutineLog_childId_date_idx" ON "RoutineLog"("childId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "RoutineLog_childId_taskId_date_key" ON "RoutineLog"("childId", "taskId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Reward_childId_key" ON "Reward"("childId");

-- CreateIndex
CREATE INDEX "Badge_childId_idx" ON "Badge"("childId");

-- CreateIndex
CREATE UNIQUE INDEX "Badge_childId_type_key" ON "Badge"("childId", "type");

-- CreateIndex
CREATE INDEX "GameScore_childId_gameType_idx" ON "GameScore"("childId", "gameType");

-- CreateIndex
CREATE INDEX "GameScore_playedAt_idx" ON "GameScore"("playedAt");

-- CreateIndex
CREATE INDEX "LearningItem_sortOrder_idx" ON "LearningItem"("sortOrder");

-- AddForeignKey
ALTER TABLE "LearningLog" ADD CONSTRAINT "LearningLog_childId_fkey" FOREIGN KEY ("childId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningLog" ADD CONSTRAINT "LearningLog_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "LearningItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineLog" ADD CONSTRAINT "RoutineLog_childId_fkey" FOREIGN KEY ("childId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineLog" ADD CONSTRAINT "RoutineLog_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "RoutineTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_childId_fkey" FOREIGN KEY ("childId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Badge" ADD CONSTRAINT "Badge_childId_fkey" FOREIGN KEY ("childId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameScore" ADD CONSTRAINT "GameScore_childId_fkey" FOREIGN KEY ("childId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
