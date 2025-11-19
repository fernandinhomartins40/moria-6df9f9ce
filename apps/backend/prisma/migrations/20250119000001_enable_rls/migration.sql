-- Enable Row-Level Security (RLS) for Revisions
-- ✅ SECURITY ENHANCEMENT: Database-level access control

-- Enable RLS on revisions table
ALTER TABLE revisions ENABLE ROW LEVEL SECURITY;

-- Policy 1: Mechanics (STAFF) can only SELECT their assigned revisions
-- Managers+ can SELECT all revisions
CREATE POLICY mechanic_select_own_revisions ON revisions
  FOR SELECT
  USING (
    -- Allow if assigned to current user OR user is MANAGER/ADMIN/SUPER_ADMIN
    assignedMechanicId = current_setting('app.current_user_id', true)::uuid
    OR current_setting('app.current_role', true) IN ('MANAGER', 'ADMIN', 'SUPER_ADMIN')
  );

-- Policy 2: Mechanics can only UPDATE their assigned revisions
-- Managers+ can UPDATE all revisions
CREATE POLICY mechanic_update_own_revisions ON revisions
  FOR UPDATE
  USING (
    assignedMechanicId = current_setting('app.current_user_id', true)::uuid
    OR current_setting('app.current_role', true) IN ('MANAGER', 'ADMIN', 'SUPER_ADMIN')
  );

-- Policy 3: Only MANAGER+ can INSERT revisions
CREATE POLICY manager_insert_revisions ON revisions
  FOR INSERT
  WITH CHECK (
    current_setting('app.current_role', true) IN ('MANAGER', 'ADMIN', 'SUPER_ADMIN', 'STAFF')
  );

-- Policy 4: Only ADMIN+ can DELETE revisions
CREATE POLICY admin_delete_revisions ON revisions
  FOR DELETE
  USING (
    current_setting('app.current_role', true) IN ('ADMIN', 'SUPER_ADMIN')
  );

-- Comment for documentation
COMMENT ON POLICY mechanic_select_own_revisions ON revisions IS 'STAFF (mechanics) can only view their assigned revisions. Managers and above can view all.';
COMMENT ON POLICY mechanic_update_own_revisions ON revisions IS 'STAFF can only update their assigned revisions. Managers and above can update all.';
COMMENT ON POLICY manager_insert_revisions ON revisions IS 'All authenticated admin staff can create revisions.';
COMMENT ON POLICY admin_delete_revisions ON revisions IS 'Only ADMIN and SUPER_ADMIN can delete revisions.';
