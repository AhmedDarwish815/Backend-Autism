-- Delete old data first
DELETE FROM "RoutineLog";
DELETE FROM "RoutineTask";

-- AlterTable
ALTER TABLE "RoutineTask" DROP COLUMN "isDefault",
ADD COLUMN     "childId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "RoutineTask_childId_idx" ON "RoutineTask"("childId");

-- AddForeignKey
ALTER TABLE "RoutineTask" ADD CONSTRAINT "RoutineTask_childId_fkey" FOREIGN KEY ("childId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;