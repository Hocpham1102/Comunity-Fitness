-- AddForeignKey: Exercise.createdById -> User.id
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_createdById_fkey" 
  FOREIGN KEY ("createdById") REFERENCES "User"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;
