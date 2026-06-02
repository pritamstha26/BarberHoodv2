/**
 * Browser Console Debugging Script for 400 Bad Request Error
 * Copy and paste this into browser DevTools console when booking fails
 */

console.log(
  "%c🔍 APPOINTMENT BOOKING DEBUGGER",
  "font-size: 14px; font-weight: bold; color: blue;",
);
console.log(
  "%c================================================",
  "color: blue;",
);

// Check 1: Verify API Endpoint
console.log("\n%c1. API Endpoint Check", "font-weight: bold; color: #333;");
const apiBaseURL = "http://localhost:5000/api";
const appointmentEndpoint = `${apiBaseURL}/appointments`;
console.log(`   Base URL: ${apiBaseURL}`);
console.log(`   Appointments URL: ${appointmentEndpoint}`);

// Check 2: Verify Token
console.log("\n%c2. Authentication Check", "font-weight: bold; color: #333;");
const token = sessionStorage.getItem("access_token");
if (token) {
  console.log(`   ✅ Token exists (${token.length} characters)`);
  console.log(`   🔑 First 20 chars: ${token.substring(0, 20)}...`);
} else {
  console.log(`   ❌ Token NOT FOUND in sessionStorage`);
}

// Check 3: Verify localStorage alternatives
console.log(
  "\n%c3. Alternative Token Locations",
  "font-weight: bold; color: #333;",
);
const localToken = localStorage.getItem("access_token");
const localBearer = localStorage.getItem("Bearer");
console.log(
  `   localStorage.access_token: ${localToken ? "✅ Found" : "❌ Not found"}`,
);
console.log(
  `   localStorage.Bearer: ${localBearer ? "✅ Found" : "❌ Not found"}`,
);

// Check 4: Test API Connection
console.log("\n%c4. API Connection Test", "font-weight: bold; color: #333;");
console.log("   Testing GET /api/restaurateurs-services...");

fetch(`${apiBaseURL}/restaurateurs-services`)
  .then((res) => {
    console.log(`   ✅ API Response Status: ${res.status}`);
    return res.json();
  })
  .then((data) => {
    console.log(
      `   ✅ Got ${Array.isArray(data) ? data.length : "?"} services`,
    );
    if (Array.isArray(data) && data.length > 0) {
      console.log(`   📋 First service:`, data[0]);
    }
  })
  .catch((err) => {
    console.log(`   ❌ API Error: ${err.message}`);
  });

// Check 5: Form Data Collection
console.log(
  "\n%c5. Current Form Data Collection",
  "font-weight: bold; color: #333;",
);
console.log("   Looking for React state...");

// This will help identify what's being sent
console.log(`
   📝 To capture what's being sent, add this to barber-profile.jsx:

   const appointmentData = { ... };
   console.log('📤 Appointment Data:', appointmentData);
   console.table(appointmentData);
`);

// Check 6: Network Request Template
console.log("\n%c6. Manual Test Request", "font-weight: bold; color: #333;");
console.log(`
   Copy and paste this to test manually:

   fetch('${appointmentEndpoint}', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': 'Bearer ' + sessionStorage.getItem('access_token')
     },
     body: JSON.stringify({
       service_id: 1,  // ← Change to valid service ID
       date: '2024-06-15T14:00:00Z',
       restaurateur_id: 1,  // ← Change to valid restaurateur ID
       clientType: 'regular'
     })
   })
   .then(res => res.json())
   .then(data => {
     console.log('Response:', data);
     if (data.message) console.error('Error:', data.message);
   })
   .catch(err => console.error('Request error:', err));
`);

// Check 7: Required Fields Validator
console.log(
  "\n%c7. Required Fields Validator",
  "font-weight: bold; color: #333;",
);
const requiredFields = [
  { name: "service_id", type: "number", required: true },
  { name: "date", type: "string (ISO)", required: true },
  { name: "restaurateur_id", type: "number", required: true },
  { name: "clientType", type: "string", required: false },
];

console.table(requiredFields);

// Check 8: Example Responses
console.log("\n%c8. Expected Responses", "font-weight: bold; color: #333;");
console.log(`
   ✅ 201 Created (Success):
   {
     "success": true,
     "message": "Appointment created successfully",
     "appointment": { id: 1, service_id: 1, date: "...", ... }
   }

   ❌ 400 Bad Request:
   {
     "message": "service_id and date are required",
     "received": { "service_id": null, "date": null }
   }

   ❌ 404 Not Found:
   {
     "success": false,
     "message": "Service with ID 999 not found"
   }

   ❌ 409 Conflict:
   {
     "success": false,
     "message": "Restaurant is fully booked"
   }
`);

// Check 9: Log Summary
console.log(
  "\n%c================================================",
  "color: blue;",
);
console.log("%c✅ NEXT STEPS:", "font-weight: bold; color: green;");
console.log(`
1. Check if token exists (Check #2)
2. Verify services exist (Check #4)
3. Get valid service_id from services list
4. Get valid restaurateur_id
5. Use manual test request (Check #6) with real IDs
6. Copy response here: console.log("Check #6 result")
`);

console.log(
  "%c================================================\n",
  "color: blue;",
);

// Helper function to easily resend requests
window.debugAppointmentPost = async (
  serviceId,
  restaurateurId,
  dateStr = null,
) => {
  const date =
    dateStr || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const token = sessionStorage.getItem("access_token");

  if (!token) {
    console.error("❌ No token found!");
    return;
  }

  console.log(`📤 Sending POST to create appointment...`);
  console.log(`   service_id: ${serviceId}`);
  console.log(`   date: ${date}`);
  console.log(`   restaurateur_id: ${restaurateurId}`);

  try {
    const response = await fetch(`${apiBaseURL}/appointments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        service_id: serviceId,
        date: date,
        restaurateur_id: restaurateurId,
        clientType: "regular",
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ SUCCESS (201):");
      console.table(data.appointment);
    } else {
      console.log(`❌ ERROR (${response.status}):`);
      console.error(data.message || data);
    }

    return data;
  } catch (error) {
    console.error("❌ Request failed:", error);
  }
};

console.log(
  "\n💡 Pro Tip: Use window.debugAppointmentPost(serviceId, restaurateurId) to test!",
);
console.log("   Example: window.debugAppointmentPost(1, 1)\n");
