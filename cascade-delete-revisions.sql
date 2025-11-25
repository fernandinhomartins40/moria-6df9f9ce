-- Migration: Add CASCADE delete for revisions when vehicle is deleted
-- Date: 2025-11-25
-- Description: Update foreign key constraint to cascade delete revisions when vehicle is deleted

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

-- Verify the constraint was created correctly
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule,
    rc.update_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'revisions'
    AND kcu.column_name = 'vehicleId';
