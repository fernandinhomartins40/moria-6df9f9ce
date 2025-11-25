-- Manual Migration 001: Remove soft delete from customer_vehicles
-- Date: 2025-11-25
-- Description: Remove deletedAt column and index from customer_vehicles table
-- SAFE: Preserves all data, only removes unused column

-- Remove index first (safe if doesn't exist)
DROP INDEX IF EXISTS "customer_vehicles_deletedAt_idx";

-- Remove deletedAt column (safe if doesn't exist)
ALTER TABLE "customer_vehicles"
DROP COLUMN IF EXISTS "deletedAt";
