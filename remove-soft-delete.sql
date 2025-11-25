-- Migration: Remove soft delete from customer_vehicles
-- Date: 2025-11-25
-- Description: Remove deletedAt column and index from customer_vehicles table

-- Remove index first
DROP INDEX IF EXISTS "customer_vehicles_deletedAt_idx";

-- Remove deletedAt column
ALTER TABLE "customer_vehicles"
DROP COLUMN IF EXISTS "deletedAt";

-- Verify the column was removed
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'customer_vehicles'
ORDER BY ordinal_position;
