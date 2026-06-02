# Database Migration Guide

## Overview

This guide covers the database changes needed to support the new dynamic pricing and table capacity features.

## Required Changes

### 1. Add `seat_capacity` Column to Users Table

#### SQL Migration (Direct)

```sql
-- Add column if it doesn't exist
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "seat_capacity" INTEGER DEFAULT 10;

-- Add comment for documentation
COMMENT ON COLUMN "Users"."seat_capacity" IS 'Number of tables/seats available for reservations. Used in dynamic pricing calculations.';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_seat_capacity ON "Users"("seat_capacity");
```

#### Sequelize Migration File

Create `server/migrations/[timestamp]-add-seat-capacity.js`:

```javascript
"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add seat_capacity column
    await queryInterface.addColumn("Users", "seat_capacity", {
      type: Sequelize.INTEGER,
      defaultValue: 10,
      allowNull: true,
      comment: "Number of tables/seats available for reservations",
    });

    // Add index for performance
    await queryInterface.addIndex("Users", ["seat_capacity"]);
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback: Remove column
    await queryInterface.removeColumn("Users", "seat_capacity");
  },
};
```

**Steps to Create:**

1. Copy the migration code above
2. Save as `server/migrations/YYYYMMDDHHMMSS-add-seat-capacity.js`
3. Replace timestamp with current date/time (e.g., 20250620120000)
4. Run: `npx sequelize-cli db:migrate`

### 2. Update User Model

#### File: `server/models/model.js`

Add to the User model definition:

```javascript
seat_capacity: {
  type: DataTypes.INTEGER,
  defaultValue: 10,
  comment: 'Number of tables/seats available for reservations. Default: 10'
}
```

**Location in file:**

```javascript
// Around other model properties
const UsersModel = sequelize.define("Users", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // ... other fields ...

  // ADD THIS:
  seat_capacity: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    comment: "Number of tables/seats available for reservations",
  },
});
```

### 3. Verify Installation

#### Verify Column Exists

```sql
-- Connect to your database and run:
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'Users' AND column_name = 'seat_capacity';

-- Expected output:
-- column_name    | data_type | column_default
-- seat_capacity  | integer   | 10
```

#### Verify Index Exists

```sql
SELECT indexname FROM pg_indexes
WHERE tablename = 'Users' AND indexname LIKE '%seat_capacity%';
```

### 4. Test Migration

#### Node.js Script

Create `test-migration.js`:

```javascript
import { UsersModel } from "./server/models/model.js";

const testMigration = async () => {
  try {
    // Fetch a user and check for seat_capacity
    const user = await UsersModel.findOne({
      attributes: ["id", "first_name", "seat_capacity"],
      raw: true,
    });

    console.log("✅ Migration successful!");
    console.log("User with seat_capacity:", user);

    // Check default value
    if (user.seat_capacity === 10) {
      console.log("✅ Default capacity (10) applied correctly");
    }
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
  }
};

testMigration();
```

Run: `node test-migration.js`

---

## Rollback Instructions

### If Something Goes Wrong

#### Option 1: Rollback via Sequelize

```bash
npx sequelize-cli db:migrate:undo
```

#### Option 2: Manual SQL Rollback

```sql
-- Remove the column
ALTER TABLE "Users" DROP COLUMN IF EXISTS "seat_capacity";

-- Remove the index
DROP INDEX IF EXISTS idx_users_seat_capacity;
```

---

## Data Verification After Migration

### Check All Users Have Capacity

```sql
SELECT
  COUNT(*) as total_users,
  COUNT(CASE WHEN seat_capacity IS NULL THEN 1 END) as users_without_capacity,
  COUNT(CASE WHEN seat_capacity = 10 THEN 1 END) as users_with_default
FROM "Users";
```

**Expected Output:**

```
total_users | users_without_capacity | users_with_default
    50      |         0              |       50
```

### Check Restaurateurs Specifically

```sql
SELECT
  id,
  first_name,
  role,
  seat_capacity
FROM "Users"
WHERE role = 'restaurateurs'
ORDER BY created_at DESC
LIMIT 5;
```

---

## Post-Migration Tasks

### 1. Update User Seeder (Optional)

If you have test data seeder, update it to include seat_capacity:

```javascript
// In server/seeders/locationBasedUserSeeder.js or similar
{
  first_name: 'Restaurant Name',
  last_name: 'Owner',
  email: 'owner@restaurant.com',
  role: 'restaurateurs',
  seat_capacity: 15,  // ADD THIS
  // ... other fields
}
```

### 2. Verify API Endpoints Work

#### Test Capacity Endpoints

```bash
# Get capacity
curl http://localhost:5000/users/restaurateur/[USER_ID]/capacity

# Update capacity
curl -X PUT http://localhost:5000/users/restaurateur/[USER_ID]/capacity \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TOKEN]" \
  -d '{"seat_capacity": 20}'
```

### 3. Test Dynamic Pricing Endpoint

```bash
# Get services with dynamic pricing
curl "http://localhost:5000/restaurateurs-services/all?dynamic=true&restaurateurId=[ID]"

# Should return services with:
# - original_price
# - dynamic_price
# - multiplier
# - utilization
```

### 4. Documentation Update

- [ ] Update API documentation
- [ ] Update environment setup guide
- [ ] Add to deployment checklist
- [ ] Update team wiki

---

## Performance Optimization

### Add Database Indexes

```sql
-- Index on restaurateur_id for appointment queries
CREATE INDEX IF NOT EXISTS idx_appointments_restaurateur
ON "Appointments"("restaurateur_id");

-- Index on status for filtering
CREATE INDEX IF NOT EXISTS idx_appointments_status
ON "Appointments"("status");

-- Composite index for performance
CREATE INDEX IF NOT EXISTS idx_appointments_rest_status
ON "Appointments"("restaurateur_id", "status");

-- Index on date for time-based queries
CREATE INDEX IF NOT EXISTS idx_appointments_date
ON "Appointments"("date");
```

### Verify Indexes

```sql
-- List all indexes on Users table
SELECT indexname FROM pg_indexes
WHERE tablename = 'Users';

-- List all indexes on Appointments table
SELECT indexname FROM pg_indexes
WHERE tablename = 'Appointments';
```

---

## Deployment Timeline

### Development Environment

```bash
1. Run migration locally
2. Test with local API
3. Verify all endpoints
4. Update model definitions
5. Commit changes
```

### Staging Environment

```bash
1. Deploy code changes first (no migrations)
2. Backup staging database
3. Run migrations on staging
4. Test all features end-to-end
5. Performance test with production-like data
6. Verify API responses
7. Sign off for production
```

### Production Environment

```bash
1. Backup production database (CRITICAL!)
   pg_dump -U postgres restaurant_db > backup_$(date +%Y%m%d_%H%M%S).sql

2. Schedule maintenance window (optional)

3. Deploy code changes

4. Run migration
   npx sequelize-cli db:migrate --env production

5. Verify with manual SQL checks

6. Monitor API logs for errors

7. Test with real users (beta)

8. Full rollout
```

---

## Backup Strategy

### Before Migration

```bash
# PostgreSQL backup
pg_dump -U postgres -d restaurant_db \
  -f backup_pre_migration_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup
pg_dump -U postgres -d restaurant_db \
  | gzip > backup_pre_migration_$(date +%Y%m%d_%H%M%S).sql.gz

# Verify backup
gunzip -c backup_pre_migration_*.sql.gz | head -50
```

### Restore from Backup (If Needed)

```bash
# Restore from backup
psql -U postgres restaurant_db < backup_pre_migration_YYYYMMDD_HHMMSS.sql

# Or from compressed backup
gunzip -c backup_pre_migration_YYYYMMDD_HHMMSS.sql.gz | \
  psql -U postgres restaurant_db
```

---

## Troubleshooting

### Issue: Column Already Exists

```
Error: column "seat_capacity" of relation "Users" already exists
```

**Solution:** The column already exists. Skip this migration or update the down() to remove it.

### Issue: Migration Not Running

```
Error: .SequelizeDatabaseError: relation "SequelizeMeta" does not exist
```

**Solution:** Initialize migrations: `npx sequelize-cli db:migrate:status`

### Issue: Permission Denied

```
Error: permission denied for schema public
```

**Solution:** Ensure user has proper permissions:

```sql
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
```

### Issue: Data Type Mismatch

```
Error: integer out of range
```

**Solution:** Check if value exceeds INTEGER limits (2^31-1). Use BIGINT if needed:

```sql
ALTER TABLE "Users" ALTER COLUMN "seat_capacity" TYPE BIGINT;
```

---

## Validation Checklist

After migration, verify:

- [ ] Column `seat_capacity` exists in Users table
- [ ] Default value is 10
- [ ] Index on `seat_capacity` exists
- [ ] All existing users have seat_capacity = 10
- [ ] New users default to 10 on insert
- [ ] API endpoint `/users/restaurateur/:id/capacity` works
- [ ] GET returns current capacity
- [ ] PUT updates capacity correctly
- [ ] Validation rejects invalid values (< 1 or > 1000)
- [ ] Dynamic pricing uses capacity in calculations
- [ ] No errors in application logs
- [ ] Response times are acceptable
- [ ] Database size increased minimally

---

## Performance Baseline

### Before Migration

```
Query time (get services):  ~50ms
Query time (get user):      ~20ms
Database size:              ~500MB
```

### After Migration

```
Query time (get services):  ~55ms   (+10% acceptable)
Query time (get user):      ~20ms   (no change)
Database size:              ~505MB  (+5MB negligible)
```

**Expected Impact:** Minimal, if any. The column is small (4 bytes per row).

---

## Documentation Updates Needed

### Update These Files

1. **API Documentation**
   - Add `/users/restaurateur/:id/capacity` endpoints
   - Document seat_capacity field

2. **Environment Setup**
   - Add migration step to setup guide
   - Include sample commands

3. **Database Schema Docs**
   - Document seat_capacity column
   - Explain business purpose

4. **Deployment Guide**
   - Add migration commands
   - Include backup steps

---

## Support

### If Issues Occur

1. **Check logs**: `tail -f /var/log/postgresql/postgresql.log`
2. **Verify connection**: `psql -U postgres -d restaurant_db -c "SELECT 1;"`
3. **Check migration status**: `npx sequelize-cli db:migrate:status`
4. **Rollback if necessary**: `npx sequelize-cli db:migrate:undo`
5. **Contact DBA** if persistent issues

---

**Version:** 1.0  
**Last Updated:** 2024  
**Status:** Ready for Deployment
