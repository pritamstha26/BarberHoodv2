-- Foreign Key Constraint Fix - SQL Commands
-- This file contains SQL queries to diagnose and fix FK constraint violations

-- ============================================================================
-- 1. DIAGNOSTIC QUERIES
-- ============================================================================

-- Check all services
SELECT id, name, price, duration, "createdAt"
FROM "RestaurateurServices"
ORDER BY id;

-- Check all appointments
SELECT 
  id, 
  "serviceId", 
  "clientId", 
  "restaurateurId", 
  status, 
  date,
  "createdAt"
FROM "AppointmentModels"
ORDER BY id;

-- Find orphaned service IDs (appointments with non-existent services)
SELECT DISTINCT 
  "serviceId",
  COUNT(*) as appointment_count
FROM "AppointmentModels"
WHERE "serviceId" NOT IN (SELECT id FROM "RestaurateurServices")
GROUP BY "serviceId";

-- Find orphaned restaurateur IDs
SELECT DISTINCT 
  "restaurateurId",
  COUNT(*) as appointment_count
FROM "AppointmentModels"
WHERE "restaurateurId" IS NOT NULL
  AND "restaurateurId" NOT IN (SELECT id FROM "Users" WHERE role='restaurateurs')
GROUP BY "restaurateurId";

-- Count appointments by status
SELECT status, COUNT(*) as count
FROM "AppointmentModels"
GROUP BY status;

-- ============================================================================
-- 2. FIX OPTION A: DELETE ORPHANED APPOINTMENTS
-- ============================================================================

-- Show which appointments will be deleted
SELECT id, "serviceId", "clientId", "restaurateurId", status, date
FROM "AppointmentModels"
WHERE "serviceId" NOT IN (SELECT id FROM "RestaurateurServices")
   OR ("restaurateurId" IS NOT NULL 
       AND "restaurateurId" NOT IN (SELECT id FROM "Users" WHERE role='restaurateurs'));

-- DELETE orphaned appointments (CAREFUL - PERMANENT!)
DELETE FROM "AppointmentModels"
WHERE "serviceId" NOT IN (SELECT id FROM "RestaurateurServices")
   OR ("restaurateurId" IS NOT NULL 
       AND "restaurateurId" NOT IN (SELECT id FROM "Users" WHERE role='restaurateurs'));

-- ============================================================================
-- 3. FIX OPTION B: CREATE MISSING SERVICES
-- ============================================================================

-- Find which service IDs are needed
SELECT DISTINCT "serviceId"
FROM "AppointmentModels"
WHERE "serviceId" NOT IN (SELECT id FROM "RestaurateurServices")
ORDER BY "serviceId";

-- Create missing services (example)
INSERT INTO "RestaurateurServices" (id, name, price, duration, "createdAt", "updatedAt")
VALUES 
  (1, 'Haircut', 50, 30, NOW(), NOW()),
  (2, 'Beard Trim', 25, 20, NOW(), NOW()),
  (3, 'Hair Styling', 75, 45, NOW(), NOW()),
  (4, 'Color Treatment', 100, 60, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 4. FIX OPTION C: CREATE MISSING RESTAURATEURS
-- ============================================================================

-- Check which restaurateur IDs don't exist
SELECT DISTINCT "restaurateurId"
FROM "AppointmentModels"
WHERE "restaurateurId" IS NOT NULL
  AND "restaurateurId" NOT IN (SELECT id FROM "Users" WHERE role='restaurateurs');

-- Create missing restaurateur users
INSERT INTO "Users" (
  id, first_name, last_name, email, phone_number, role, password, seat_capacity, "createdAt", "updatedAt"
)
VALUES 
  (100, 'Restaurant', 'Owner', 'restaurant@example.com', '+1234567890', 'restaurateurs', 'hashed_password', 10, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 5. VERIFICATION QUERIES
-- ============================================================================

-- Verify no orphaned services after fix
SELECT COUNT(*) as orphaned_services
FROM "AppointmentModels"
WHERE "serviceId" NOT IN (SELECT id FROM "RestaurateurServices");
-- Should return: 0

-- Verify no orphaned restaurateurs after fix
SELECT COUNT(*) as orphaned_restaurateurs
FROM "AppointmentModels"
WHERE "restaurateurId" IS NOT NULL
  AND "restaurateurId" NOT IN (SELECT id FROM "Users" WHERE role='restaurateurs');
-- Should return: 0

-- Check database integrity
SELECT 
  (SELECT COUNT(*) FROM "RestaurateurServices") as total_services,
  (SELECT COUNT(*) FROM "AppointmentModels") as total_appointments,
  (SELECT COUNT(DISTINCT "serviceId") FROM "AppointmentModels") as services_in_use,
  (SELECT COUNT(DISTINCT "restaurateurId") FROM "AppointmentModels") as restaurateurs_in_use;

-- ============================================================================
-- 6. SAMPLE DATA FOR TESTING
-- ============================================================================

-- Clear test data (if needed)
DELETE FROM "AppointmentModels" WHERE "clientId" > 1000;
DELETE FROM "RestaurateurServices" WHERE id > 100;

-- Create test services
INSERT INTO "RestaurateurServices" (name, price, duration, "createdAt", "updatedAt")
VALUES 
  ('Test Haircut', 50, 30, NOW(), NOW()),
  ('Test Beard', 25, 20, NOW(), NOW()),
  ('Test Color', 100, 60, NOW(), NOW());

-- Verify services created
SELECT * FROM "RestaurateurServices" ORDER BY id DESC LIMIT 3;

-- ============================================================================
-- 7. FOREIGN KEY CONSTRAINT INFO
-- ============================================================================

-- Check constraint details
SELECT
  constraint_name,
  table_name,
  column_name,
  referenced_table_name,
  referenced_column_name
FROM information_schema.key_column_usage
WHERE table_name = 'AppointmentModels'
  AND column_name LIKE '%serviceId%';

-- Check all FK constraints on AppointmentModels
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS referenced_table_name,
  ccu.column_name AS referenced_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'AppointmentModels'
ORDER BY tc.constraint_name;

-- ============================================================================
-- 8. TRANSACTION-BASED FIX (SAFE)
-- ============================================================================

BEGIN TRANSACTION;

-- Step 1: Create missing services (if needed)
INSERT INTO "RestaurateurServices" (id, name, price, duration, "createdAt", "updatedAt")
SELECT DISTINCT 
  "serviceId",
  'Service ' || "serviceId",
  50,
  30,
  NOW(),
  NOW()
FROM "AppointmentModels"
WHERE "serviceId" NOT IN (SELECT id FROM "RestaurateurServices")
ON CONFLICT DO NOTHING;

-- Step 2: Delete or fix orphaned appointments
DELETE FROM "AppointmentModels"
WHERE "serviceId" NOT IN (SELECT id FROM "RestaurateurServices")
   OR ("restaurateurId" IS NOT NULL 
       AND "restaurateurId" NOT IN (SELECT id FROM "Users" WHERE role='restaurateurs'));

-- Step 3: Verify
SELECT 
  COUNT(*) as total_remaining_appointments,
  COUNT(DISTINCT "serviceId") as unique_services
FROM "AppointmentModels";

-- Commit or Rollback
COMMIT;
-- ROLLBACK;  -- Use if something looks wrong

-- ============================================================================
-- Notes:
-- - Always backup database before running DELETE queries
-- - Test in development environment first
-- - Use transactions (BEGIN/COMMIT) for safety
-- - Check results with diagnostic queries before committing
-- ============================================================================
