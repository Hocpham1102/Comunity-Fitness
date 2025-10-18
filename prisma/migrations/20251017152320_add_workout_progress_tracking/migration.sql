-- AlterTable
ALTER TABLE "WorkoutLog" ADD COLUMN     "currentExerciseOrder" INTEGER,
ADD COLUMN     "currentSetNumber" INTEGER,
ADD COLUMN     "restUntil" TIMESTAMP(3);
