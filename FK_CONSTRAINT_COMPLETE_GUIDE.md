# 🔧 Foreign Key Constraint Violation - COMPLETE FIX

## Error

```
insert or update on table "AppointmentModels" violates foreign key constraint "AppointmentModels_serviceId_fkey"
```

---

## 🎯 Quick Fix (Choose One)

### ✅ **Option 1: Run Diagnostic (SAFE - No Changes)**

```bash
node server/diagnostics/check-foreign-keys.js
```

**What it does:**

- Shows all services in the system
- Shows all appointments
- Identifies orphaned service/restaurateur IDs
- Provides recommendations

---

### ✅ **Option 2: Fix via SQL (If You Know What's Wrong)**

```bash
# Open PostgreSQL CLI
psql -U postgres restaurant_db

# Run diagnostic queries first
\i server/SQL_FK_FIX.sql
```

**Key SQL queries:**

```sql
-- See which services exist
SELECT id, name FROM "RestaurateurServices";

-- See which appointments reference invalid services
SELECT DISTINCT "serviceId" FROM "AppointmentModels"
WHERE "serviceId" NOT IN (SELECT id FROM "RestaurateurServices");

-- Delete bad appointments
DELETE FROM "AppointmentModels"
WHERE "serviceId" NOT IN (SELECT id FROM "RestaurateurServices");
```

---

### ✅ **Option 3: Fix via Enhanced Error Messages (NEW)**

The appointment controller now provides detailed error messages:

**Instead of:** `Foreign key constraint violation`

**You'll see:**

```json
{
  "success": false,
  "message": "Foreign key constraint violation - Invalid service or restaurateur ID",
  "details": "...",
  "hint": "Ensure the service_id exists in RestaurateurService table..."
}
```

This tells you exactly what's wrong.

---

## 📊 Root Causes

### 1. **No Services Created Yet**

```
❌ Problem: You're trying to book an appointment but no services exist
✅ Solution: Create services first
```

**Create a service:**

```bash
curl -X POST http://localhost:5000/restaurateurs-services/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Haircut",
    "price": 50,
    "duration": 30
  }'
```

---

### 2. **Wrong Service ID**

```
❌ Problem: Frontend is sending service_id that doesn't exist
✅ Solution: Ensure you're getting the ID from the RestaurateurService table
```

**Frontend checklist:**

- [ ] Fetch services from `/restaurateurs-services/all`
- [ ] Extract the `id` field from response
- [ ] Send that exact `id` in appointment creation
- [ ] Don't send wrong model IDs (ServiceModel vs RestaurateurService)

---

### 3. **Orphaned Data**

```
❌ Problem: Database has appointments with service IDs that don't exist
✅ Solution: Clean up orphaned data
```

**Clean up:**

```sql
-- Delete appointments with missing services
DELETE FROM "AppointmentModels"
WHERE "serviceId" NOT IN (SELECT id FROM "RestaurateurServices");
```

---

## 🔍 How to Diagnose

### Step 1: Run Diagnostic

```bash
node server/diagnostics/check-foreign-keys.js
```

**Output shows:**

```
1️⃣ RESTAURATEUR SERVICES
   Total Services: 0  ⚠️ WARNING: No services found!

3️⃣ ORPHANED REFERENCES (Critical)
   🚨 FOUND ORPHANED SERVICE IDs:
      Service ID: 123 (DOES NOT EXIST)
```

### Step 2: Fix Based on Output

| Diagnostic Shows     | Action                   |
| -------------------- | ------------------------ |
| No services          | Create services first    |
| Orphaned IDs         | Delete bad appointments  |
| Missing restaurateur | Create restaurateur user |

---

## ✅ Complete Solution Process

### 1. **Diagnose**

```bash
node server/diagnostics/check-foreign-keys.js
```

### 2. **Understand Issue**

Read the diagnostic output and identify the problem

### 3. **Fix It**

**If no services:**

```bash
# Create a test service via API
curl -X POST http://localhost:5000/restaurateurs-services/create \
  -H "Content-Type: application/json" \
  -d '{"name": "Haircut", "price": 50, "duration": 30}'
```

**If orphaned references:**

```bash
# Use psql
psql -U postgres restaurant_db

# Delete bad appointments
DELETE FROM "AppointmentModels"
WHERE "serviceId" NOT IN (SELECT id FROM "RestaurateurServices");
```

### 4. **Verify**

```bash
# Run diagnostic again
node server/diagnostics/check-foreign-keys.js

# Should show: ✅ NO ISSUES FOUND
```

### 5. **Test Booking**

```bash
curl -X POST http://localhost:5000/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TOKEN]" \
  -d '{
    "service_id": 1,
    "date": "2024-06-15T14:00:00Z",
    "restaurateur_id": 1
  }'

# Should return: 201 Created ✅
```

---

## 📁 Files Provided

### Documentation

- **FOREIGN_KEY_FIX.md** - Detailed explanation with all solutions
- **FK_CONSTRAINT_COMPLETE_GUIDE.md** - This file

### Tools

- **server/diagnostics/check-foreign-keys.js** - Diagnostic script
- **server/SQL_FK_FIX.sql** - SQL diagnostic and fix queries

### Code Updates

- **server/controllers/appointmentController.js** - Enhanced error handling
  - Better FK constraint error detection
  - Helpful error messages
  - Validation before insertion

---

## 🧪 Testing Workflow

### Test 1: Create Service

```bash
# 1. Create a service
curl -X POST http://localhost:5000/restaurateurs-services/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Service",
    "price": 50,
    "duration": 30
  }'

# Save the ID from response
# Example response:
# {
#   "id": 123,
#   "name": "Test Service",
#   "price": 50,
#   "duration": 30
# }
```

### Test 2: Book Appointment

```bash
# 2. Use that ID to book
curl -X POST http://localhost:5000/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [YOUR_TOKEN]" \
  -d '{
    "service_id": 123,
    "date": "2024-06-15T14:00:00Z",
    "restaurateur_id": 1
  }'

# Should return 201 Created
```

### Test 3: Verify

```bash
# 3. Check appointment was created
curl -X GET "http://localhost:5000/appointments/restaurateurs/1" \
  -H "Authorization: Bearer [YOUR_TOKEN]"

# Should show your new appointment
```

---

## 🛠️ Advanced Debugging

### Enable Database Query Logging

Add to your Node code:

```javascript
const sequelize = require("./config/db");
sequelize.options.logging = console.log; // Log all queries
```

### Check Current Constraints

```sql
SELECT constraint_name, table_name, column_name
FROM information_schema.key_column_usage
WHERE table_name = 'AppointmentModels';
```

### View Table Structure

```sql
\d+ "AppointmentModels"
\d+ "RestaurateurServices"
```

---

## 🚨 Emergency: Remove FK Constraint

**LAST RESORT ONLY - Not recommended!**

```sql
-- Drop the FK constraint
ALTER TABLE "AppointmentModels"
DROP CONSTRAINT "AppointmentModels_serviceId_fkey";

-- Now you can insert without FK validation
-- ⚠️ But this allows invalid data!
```

---

## 📋 Checklist

Before booking an appointment:

- [ ] Services exist (`RestaurateurService` table has data)
- [ ] You have the correct service ID
- [ ] Restaurateur exists with role='restaurateurs'
- [ ] Restaurateur has seat_capacity set
- [ ] Your user account exists with role='clients'
- [ ] You have a valid authentication token
- [ ] Date is in valid ISO format
- [ ] Appointment is > 24 hours from last appointment

---

## 🎓 Understanding the Schema

### RestaurateurService Table

```
id (INTEGER, PRIMARY KEY)
name (STRING)
price (INTEGER)
duration (INTEGER)
createdAt (TIMESTAMP)
updatedAt (TIMESTAMP)
```

### AppointmentModel Table

```
id (INTEGER, PRIMARY KEY)
serviceId (INTEGER, FOREIGN KEY → RestaurateurService.id) ← THIS IS THE ISSUE
clientId (INTEGER, FOREIGN KEY → Users.id)
restaurateurId (INTEGER, FOREIGN KEY → Users.id)
date (TIMESTAMP)
status (ENUM)
```

**The FK constraint means:**

- Every `serviceId` in `AppointmentModels` MUST exist in `RestaurateurServices.id`
- If you insert a `serviceId` that doesn't exist → ERROR ❌

---

## ✨ Summary

### What was wrong:

❌ Trying to insert appointments with non-existent `serviceId` values

### What's fixed:

✅ Better error messages telling you exactly what's wrong
✅ Diagnostic tool to identify issues
✅ SQL scripts to fix data
✅ Enhanced validation before insertion

### Next steps:

1. Run diagnostic to see current state
2. Fix based on findings
3. Test with the workflow above
4. Appointments should now work! 🎉

---

**Version**: 1.0  
**Status**: ✅ Fixed & Enhanced  
**Last Updated**: 2024

Need more help? Check:

- FOREIGN_KEY_FIX.md - Detailed guide
- server/diagnostics/check-foreign-keys.js - Run this!
- server/SQL_FK_FIX.sql - SQL commands
