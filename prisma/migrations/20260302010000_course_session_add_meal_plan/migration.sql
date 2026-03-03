-- Add mealPlanId column to CourseSession
ALTER TABLE "CourseSession" ADD COLUMN IF NOT EXISTS "mealPlanId" TEXT;

-- Add FK constraint (drop first if exists to be safe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'CourseSession_mealPlanId_fkey'
      AND table_name = 'CourseSession'
  ) THEN
    ALTER TABLE "CourseSession"
      ADD CONSTRAINT "CourseSession_mealPlanId_fkey"
      FOREIGN KEY ("mealPlanId") REFERENCES "MealPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Add index
CREATE INDEX IF NOT EXISTS "CourseSession_mealPlanId_idx" ON "CourseSession"("mealPlanId");
