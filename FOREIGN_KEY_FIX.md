# Foreign Key Constraint Violation Fix

## 🔴 Error

```
insert or update on table "AppointmentModels" violates foreign key constraint "AppointmentModels_serviceId_fkey"
```

## 🔍 Root Cause Analysis

This error occurs when trying to insert an appointment with a `serviceId` that **does not exist** in the `RestaurateurService` table.

### Problem Scenario

```
1. Frontend sends: { service_id: 123, ... }
2. Backend looks for: RestaurateurService with id=123
3. Table is empty or id doesn't exist
4. ❌ Foreign key constraint fails
```

## ✅ Solutions

### Solution 1: Check What Service IDs Actually Exist

Run this SQL query to see all services:

```sql
-- Check RestaurateurService table
SELECT * FROM "RestaurateurServices";

-- Check if any are linked to AppointmentModels
SELECT DISTINCT "serviceId" FROM "AppointmentModels";

-- Find orphaned service IDs (referenced in appointments but not in RestaurateurService)
SELECT DISTINCT "serviceId" FROM "AppointmentModels"
WHERE "serviceId" NOT IN (SELECT id FROM "RestaurateurServices");
```

### Solution 2: Ensure Services Are Created Before Booking

**Make sure you:**

1. ✅ Create RestaurateurService entries via API first
2. ✅ Get the returned `id` from the service creation
3. ✅ Use that `id` when booking appointments

**Example Flow:**

```javascript
// Step 1: Create a service
POST /restaurateurs-services/create
{
  "name": "Haircut",
  "price": 50,
  "duration": 30,
  "restaurateur_id": 1
}
// Response: { id: 123, name: "Haircut", ... }

// Step 2: Use the returned ID to book
POST /appointments
{
  "service_id": 123,  // ← Use the ID from step 1
  "date": "2024-06-01T14:00:00Z",
  "restaurateur_id": 1
}
```

### Solution 3: Fix Existing Data

If you have orphaned services, either:

**Option A: Clean up appointments**

```sql
-- Delete appointments with invalid service IDs
DELETE FROM "AppointmentModels"
WHERE "serviceId" NOT IN (SELECT id FROM "RestaurateurServices");
```

**Option B: Create missing services**

```sql
-- Find which service IDs are referenced
SELECT DISTINCT "serviceId" FROM "AppointmentModels";

-- Create those services in RestaurateurService table
INSERT INTO "RestaurateurServices" (id, name, price, duration, "createdAt", "updatedAt")
VALUES
  (123, 'Service Name', 50, 30, NOW(), NOW()),
  (124, 'Another Service', 75, 45, NOW(), NOW());
```

### Solution 4: Update Model to Allow NULL serviceId (Temporary)

If you want appointments to work without required services:

**Edit `server/models/appointmentModel.js`:**

```javascript
serviceId: {
  type: DataTypes.INTEGER,
  allowNull: true,  // ← Change to true (if services are optional)
  references: {
    model: RestaurateurService,
    key: "id",
  },
}
```

**Then migrate:**

```bash
npx sequelize-cli db:migrate
```

### Solution 5: Check Frontend Service Selection

**In `client/src/components/client/barber-profile.jsx`:**

Ensure the service ID being sent is correct:

```javascript
// ✅ CORRECT: Send the actual service ID
const appointmentData = {
  service_id: selectedService.id, // From RestaurateurService
  date: appointmentDate.toISOString(),
  restaurateur_id: barber.id,
};

// ❌ WRONG: Don't send undefined or invalid IDs
if (!selectedService || !selectedService.id) {
  console.error("Invalid service selected");
  return;
}
```

## 🔧 Diagnostic Script

Create `server/diagnostics/check-fk-constraint.js`:

```javascript
import sequelize from "../config/db.js";
import { RestaurateurService } from "../models/RestaurateurServices.js";
import AppointmentModel from "../models/appointmentModel.js";

async function checkFKConstraint() {
  try {
    console.log("🔍 Checking RestaurateurService and AppointmentModel...\n");

    // Count services
    const serviceCount = await RestaurateurService.count();
    console.log(`📊 Total RestaurateurServices: ${serviceCount}`);

    if (serviceCount === 0) {
      console.log(
        "⚠️  WARNING: No services found! Create services before booking appointments.",
      );
      return;
    }

    // List all services
    const services = await RestaurateurService.findAll({
      attributes: ["id", "name", "price"],
      raw: true,
    });
    console.log("\n📋 Available Services:");
    services.forEach((s) =>
      console.log(`   ID: ${s.id}, Name: ${s.name}, Price: $${s.price}`),
    );

    // Check for orphaned appointments
    const orphanedAppointments = await sequelize.query(`
      SELECT DISTINCT "serviceId" FROM "AppointmentModels"
      WHERE "serviceId" NOT IN (SELECT id FROM "RestaurateurServices")
    `);

    if (orphanedAppointments[0].length > 0) {
      console.log("\n⚠️  ORPHANED SERVICE IDs (referenced but don't exist):");
      orphanedAppointments[0].forEach((row) =>
        console.log(`   Service ID: ${row.serviceId}`),
      );
      console.log("   👉 Run Solution 3 to fix these");
    } else {
      console.log("\n✅ No orphaned service IDs found");
    }
  } catch (error) {
    console.error("Error checking constraint:", error);
  }
}

checkFKConstraint();
```

**Run:**

```bash
node server/diagnostics/check-fk-constraint.js
```

## 📋 Verification Checklist

- [ ] RestaurateurService table has entries
- [ ] Each appointment references valid service IDs
- [ ] Frontend is sending correct `service_id` from RestaurateurService
- [ ] No orphaned appointments with invalid service IDs
- [ ] Database allows NULL for serviceId if services are optional
- [ ] Error handling catches FK violations with helpful messages

## 🧪 Test the Fix

1. **Create a service:**

```bash
curl -X POST http://localhost:5000/restaurateurs-services/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Service",
    "price": 50,
    "duration": 30
  }'
```

2. **Note the returned ID**

3. **Book an appointment:**

```bash
curl -X POST http://localhost:5000/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TOKEN]" \
  -d '{
    "service_id": [ID_FROM_STEP_2],
    "date": "2024-06-15T14:00:00Z",
    "restaurateur_id": 1
  }'
```

4. **Should succeed with 201 status**

## 🚨 If Still Failing

1. Check the error response for which ID is problematic
2. Run diagnostic script to see what services exist
3. Check `FOREIGN_KEY_DEBUG.md` for detailed SQL queries
4. Review recent changes to appointment/service controllers

## 🔗 Related Files

- Appointment Model: `server/models/appointmentModel.js`
- RestaurateurService Model: `server/models/RestaurateurServices.js`
- Appointment Controller: `server/controllers/appointmentController.js`
- Updated with better error messages in version 1.1+

---

**Status**: ✅ Enhanced Error Handling  
**Last Updated**: 2024  
**Version**: 1.0
