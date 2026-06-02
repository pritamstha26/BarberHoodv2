# 🚀 Quick Start: Fix Foreign Key Constraint Error

## The Error

```
insert or update on table "AppointmentModels" violates foreign key constraint
```

## The Problem

You're trying to book an appointment with a `serviceId` that **doesn't exist** in the database.

## The Solution (3 Steps)

### Step 1: Diagnose (Takes 10 seconds)

```bash
cd /home/xerox/BarberHoodv2
node server/diagnostics/check-foreign-keys.js
```

**You'll see:**

- ✅ All services in the system
- ✅ All appointments
- ✅ If something is wrong
- ✅ Exactly what to do

---

### Step 2: Fix (Depends on diagnosis)

#### Scenario A: No Services Found

```bash
# Create a service via API:
curl -X POST http://localhost:5000/restaurateurs-services/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Haircut",
    "price": 50,
    "duration": 30
  }'

# Note the returned ID (e.g., 1)
```

#### Scenario B: Bad Service IDs in Database

```bash
# Delete the bad appointments:
psql -U postgres restaurant_db

# Run this SQL:
DELETE FROM "AppointmentModels"
WHERE "serviceId" NOT IN (SELECT id FROM "RestaurateurServices");

# Exit
\q
```

---

### Step 3: Test (2 API calls)

#### Create a test service

```bash
curl -X POST http://localhost:5000/restaurateurs-services/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Haircut",
    "price": 50,
    "duration": 30
  }'

# Save the ID from the response (e.g., 5)
```

#### Book an appointment with that service

```bash
curl -X POST http://localhost:5000/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "service_id": 5,
    "date": "2024-06-15T14:00:00Z",
    "restaurateur_id": 1
  }'

# Should return 201 Created ✅
```

---

## 📋 Before You Book

Always follow this order:

1. **Create Service** → Get ID
2. **Book Appointment** → Use that ID

### ❌ DON'T:

- Send random service IDs
- Use IDs from the wrong table
- Skip creating services

### ✅ DO:

- Create services first
- Use the returned ID
- Include restaurateur_id
- Use valid date format

---

## 🆘 Still Failing?

1. **Check the error message**
   - It now tells you exactly what's wrong
2. **Run diagnostic again**

   ```bash
   node server/diagnostics/check-foreign-keys.js
   ```

3. **Look at the details**
   - Service IDs that don't exist?
   - Restaurateur IDs invalid?
   - No services at all?

4. **See FOREIGN_KEY_FIX.md** for detailed solutions

---

## 📁 Files That Help

| File                                       | Purpose            | Use When             |
| ------------------------------------------ | ------------------ | -------------------- |
| `server/diagnostics/check-foreign-keys.js` | Diagnose issues    | First thing to run   |
| `server/SQL_FK_FIX.sql`                    | SQL commands       | Need to fix database |
| `FOREIGN_KEY_FIX.md`                       | Detailed guide     | Need more info       |
| `FK_CONSTRAINT_COMPLETE_GUIDE.md`          | Complete reference | Need all details     |

---

## ⚡ TL;DR

```bash
# 1. Diagnose
node server/diagnostics/check-foreign-keys.js

# 2. Create a service if needed
curl -X POST http://localhost:5000/restaurateurs-services/create \
  -H "Content-Type: application/json" \
  -d '{"name": "Service", "price": 50, "duration": 30}'

# 3. Book with that service ID
curl -X POST http://localhost:5000/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"service_id": 1, "date": "2024-06-15T14:00:00Z", "restaurateur_id": 1}'

# Done! ✅
```

---

**Version**: Quick Start 1.0  
**Time to Fix**: 5-10 minutes  
**Difficulty**: Easy ✅
