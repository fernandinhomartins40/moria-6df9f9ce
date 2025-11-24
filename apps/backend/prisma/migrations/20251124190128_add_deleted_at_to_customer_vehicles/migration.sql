-- AlterTable
ALTER TABLE "customer_vehicles" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "customer_vehicles_deletedAt_idx" ON "customer_vehicles"("deletedAt");
