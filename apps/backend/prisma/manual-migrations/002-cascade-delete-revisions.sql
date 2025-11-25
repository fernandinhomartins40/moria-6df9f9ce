-- Manual Migration 002: Add CASCADE delete for revisions
-- Date: 2025-11-25
-- Description: Update foreign key constraint to cascade delete revisions when vehicle is deleted
-- SAFE: Does not delete any data, only changes constraint behavior

-- Step 1: Remove existing foreign key constraint
ALTER TABLE "revisions"
DROP CONSTRAINT IF EXISTS "revisions_vehicleId_fkey";

-- Step 2: Add new foreign key constraint with CASCADE
ALTER TABLE "revisions"
ADD CONSTRAINT "revisions_vehicleId_fkey"
FOREIGN KEY ("vehicleId")
REFERENCES "customer_vehicles"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
