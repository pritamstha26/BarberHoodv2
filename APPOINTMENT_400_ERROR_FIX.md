# 🔧 400 Bad Request When Creating Appointment - FIX GUIDE

## Error

```
POST http://localhost:5000/api/appointments 400 (Bad Request)
```

## 🎯 Root Causes (In Order of Likelihood)

### 1. **Missing or Invalid `service_id`**

```javascript
// ❌ WRONG
const appointmentData = {
  date: "2024-06-15T14:00:00Z",
  restaurateur_id: 1,
  // ❌ service_id is missing!
};

// ✅ CORRECT
const appointmentData = {
  service_id: 1, // ← Must be provided
  date: "2024-06-15T14:00:00Z",
  restaurateur_id: 1,
};
```

### 2. **Missing or Invalid `date`**

```javascript
// ❌ WRONG
const appointmentData = {
  service_id: 1,
  restaurateur_id: 1,
  // ❌ date is missing!
};

// ✅ CORRECT - ISO string format
const appointmentData = {
  service_id: 1,
  date: "2024-06-15T14:00:00Z", // Must be ISO format
  restaurateur_id: 1,
};
```

### 3. **Missing or Invalid `restaurateur_id`**

```javascript
// ❌ WRONG
const appointmentData = {
  service_id: 1,
  date: "2024-06-15T14:00:00Z",
  // ❌ restaurateur_id is missing!
};

// ✅ CORRECT
const appointmentData = {
  service_id: 1,
  date: "2024-06-15T14:00:00Z",
  restaurateur_id: 1, // Must be provided
};
```

### 4. **Service doesn't exist**

```javascript
// ❌ WRONG
const appointmentData = {
  service_id: 999, // This service doesn't exist!
  date: "2024-06-15T14:00:00Z",
  restaurateur_id: 1,
};

// ✅ CORRECT
// 1. First create a service
// 2. Get the returned ID
// 3. Use that ID
const appointmentData = {
  service_id: 1, // Valid service ID
  date: "2024-06-15T14:00:00Z",
  restaurateur_id: 1,
};
```

### 5. **Restaurateur doesn't exist or has wrong role**

```javascript
// ❌ WRONG
const appointmentData = {
  service_id: 1,
  date: "2024-06-15T14:00:00Z",
  restaurateur_id: 999, // User doesn't exist or isn't a restaurateur
};

// ✅ CORRECT
const appointmentData = {
  service_id: 1,
  date: "2024-06-15T14:00:00Z",
  restaurateur_id: 1, // Valid restaurateur ID
};
```

---

## 🔍 How to Debug

### Step 1: Check Browser Console

Open DevTools (F12) and look for the full error response:

```javascript
// In browser console:
// You'll see something like:
// Response {status: 400, statusText: "Bad Request", ...}
// response.data.message = "service_id and date are required"
```

### Step 2: Log the appointment data being sent

Add this to `barber-profile.jsx` before sending:

```javascript
const appointmentData = {
  service_id: selectedService.id,
  date:
    appointmentDate instanceof Date
      ? appointmentDate.toISOString()
      : appointmentDate,
  restaurateurs_id: barber.id,
  restaurateur_id: barber.id,
  clientType: "regular",
};

// ADD THIS FOR DEBUGGING:
console.log("📤 Sending appointment data:", {
  service_id: appointmentData.service_id,
  service_id_type: typeof appointmentData.service_id,
  date: appointmentData.date,
  date_valid: !isNaN(new Date(appointmentData.date).getTime()),
  restaurateur_id: appointmentData.restaurateur_id,
});
```

### Step 3: Check Network Tab

1. Open DevTools → Network tab
2. Make a booking attempt
3. Click on the POST request to `/api/appointments`
4. View the **Request** tab to see what you're sending
5. View the **Response** tab to see the error details

Expected response format on error:

```json
{
  "message": "service_id and date are required",
  "received": {
    "service_id": null,
    "date": null
  }
}
```

---

## ✅ Quick Fixes

### Fix 1: Ensure Service Is Selected

```javascript
const handleBookAppointment = async () => {
  // ✅ ADD THIS CHECK
  if (!selectedService || !selectedService.id) {
    setBookingError("Please select a valid service");
    return;
  }

  if (!appointmentDate) {
    setBookingError("Please select a valid date and time");
    return;
  }

  if (!barber || !barber.id) {
    setBookingError("Unable to determine restaurant");
    return;
  }

  // Now safe to proceed
  const appointmentData = { ... };
};
```

### Fix 2: Ensure Date Is Valid ISO String

```javascript
const appointmentData = {
  service_id: selectedService.id,
  date:
    appointmentDate instanceof Date
      ? appointmentDate.toISOString() // ✅ Correct format
      : appointmentDate,
  restaurateur_id: barber.id,
};

// ✅ VERIFY date format
if (
  typeof appointmentData.date !== "string" ||
  !appointmentData.date.includes("T")
) {
  console.error("❌ Date format invalid:", appointmentData.date);
  return;
}
```

### Fix 3: Ensure Restaurateur ID Exists

```javascript
const appointmentData = {
  service_id: selectedService.id,
  date: appointmentDate.toISOString(),
  restaurateur_id: barber.id, // ✅ Must be the barber ID
};

// ✅ VERIFY
if (!barber || !barber.id) {
  console.error("❌ No barber/restaurateur selected");
  return;
}
```

---

## 🧪 Test the Fix

### Step 1: Verify Backend Is Running

```bash
# Check if backend is listening
curl -X GET http://localhost:5000/api/services

# Should return JSON response (not connection error)
```

### Step 2: Check Services Exist

```bash
# Get all services
curl -X GET http://localhost:5000/api/restaurateurs-services

# Should return array of services with their IDs
# Example: [{ id: 1, name: "Haircut", price: 50, ... }]
```

### Step 3: Create Appointment with Valid Data

```bash
# Replace TOKEN with your actual token
TOKEN="your_bearer_token_here"
SERVICE_ID=1
RESTAURATEUR_ID=1

curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "service_id": '$SERVICE_ID',
    "date": "2024-06-15T14:00:00Z",
    "restaurateur_id": '$RESTAURATEUR_ID',
    "clientType": "regular"
  }'

# Should return 201 Created with appointment data
```

---

## 📋 Validation Checklist

Before attempting to book, verify:

- [ ] **Service Selected**
  - `selectedService` is not null
  - `selectedService.id` is a number
  - Service exists in database

- [ ] **Date Selected**
  - `appointmentDate` is not null
  - `appointmentDate` is a valid Date object
  - Converts to valid ISO string
  - Date is in future (> now)
  - Date is > 24 hours from any existing appointment

- [ ] **Restaurateur Selected**
  - `barber` object exists
  - `barber.id` is a number
  - Restaurateur exists in database with role='restaurateurs'
  - Has available capacity

- [ ] **Authentication**
  - Token exists in sessionStorage
  - Token is valid (not expired)
  - Token is for the correct user

- [ ] **API Connection**
  - Backend running on localhost:5000
  - CORS properly configured
  - Content-Type header is application/json

---

## 🛠️ Code Fix for barber-profile.jsx

If you see the issue in network tab, add this validation:

```javascript
const handleBookAppointment = async () => {
  if (!selectedService || !appointmentDate) return;

  try {
    setBookingInProgress(true);
    setBookingError(null);

    const token = sessionStorage.getItem("access_token");
    if (!token) {
      setBookingError("Please log in before booking an appointment.");
      return;
    }

    if (!barber?.id) {
      setBookingError(
        "Unable to determine the selected restaurant. Please refresh and try again.",
      );
      return;
    }

    // ✅ ADD VALIDATION HERE
    if (!selectedService.id) {
      setBookingError("Service not properly selected. Please try again.");
      console.error("Invalid service:", selectedService);
      return;
    }

    const appointmentData = {
      service_id: selectedService.id,
      date:
        appointmentDate instanceof Date
          ? appointmentDate.toISOString()
          : appointmentDate,
      restaurateurs_id: barber.id,
      restaurateur_id: barber.id,
      clientType: "regular",
    };

    // ✅ DEBUG: Log what we're sending
    console.log("📤 Appointment Request:", {
      service_id: appointmentData.service_id,
      service_id_type: typeof appointmentData.service_id,
      date: appointmentData.date,
      restaurateur_id: appointmentData.restaurateur_id,
      token_exists: !!token,
    });

    if (isFullyBooked) {
      setBookingError(
        "This restaurant is fully booked right now. Please choose a different time or restaurant.",
      );
      return;
    }

    // Check if dynamic pricing is applied (surge pricing)
    if (
      selectedService.dynamic_price &&
      selectedService.dynamic_price > selectedService.original_price
    ) {
      // Store the booking data and show the surge price modal for confirmation
      setPendingBookingData({
        appointmentData,
        service: selectedService,
        restaurantName: barber.first_name,
        originalPrice: selectedService.original_price,
        dynamicPrice: selectedService.dynamic_price,
        multiplier: selectedService.multiplier || 1,
        utilization: selectedService.utilization || 0,
      });
      setShowSurgePriceModal(true);
      setBookingInProgress(false);
      return;
    }

    // No surge pricing, proceed directly with booking
    await submitAppointment(appointmentData);
  } catch (error) {
    console.error("Error preparing appointment:", error);
    setBookingError(
      error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to prepare appointment. Please try again.",
    );
    setBookingInProgress(false);
  }
};
```

---

## 🚨 Common Mistakes

### ❌ Mistake 1: Using wrong key names

```javascript
// ❌ WRONG
{ servic_id: 1, ... }        // Typo!
{ serviceId: 1, ... }        // Wrong name format
{ restaurant_id: 1, ... }    // Wrong key
```

### ❌ Mistake 2: Date not ISO format

```javascript
// ❌ WRONG
{
  date: "2024-06-15";
} // Missing time
{
  date: new Date();
} // Sending Date object
{
  date: "15/06/2024 2:00 PM";
} // Wrong format
```

### ❌ Mistake 3: Missing Authorization header

```javascript
// ❌ WRONG
api.post("/appointments", appointmentData); // No token

// ✅ CORRECT
api.post("/appointments", appointmentData, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

---

## 📞 If Still Failing

1. **Check browser console for exact error message**
2. **Look at Network tab → Response body**
3. **Verify all 3 required fields are present**
4. **Ensure service ID actually exists**
5. **Ensure restaurateur ID actually exists**
6. **Check server logs for backend errors**
7. **Run diagnostic: `node server/diagnostics/check-foreign-keys.js`**

---

**Version**: 1.0  
**Status**: ✅ Diagnostic Guide Complete  
**Time to Fix**: 5-10 minutes
