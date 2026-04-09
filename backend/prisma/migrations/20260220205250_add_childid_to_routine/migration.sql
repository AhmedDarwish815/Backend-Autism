-- AlterTable
ALTER TABLE "RoutineTask" ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "childId" DROP NOT NULL;
