-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN IF NOT EXISTS "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'APPROVED';
ALTER TABLE "Exercise" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;
ALTER TABLE "Exercise" ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP(3);
ALTER TABLE "Exercise" ADD COLUMN IF NOT EXISTS "approvedById" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Exercise_approvalStatus_idx" ON "Exercise"("approvalStatus");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Exercise_createdById_idx" ON "Exercise"("createdById");
