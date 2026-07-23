/**
 * Browser Console Diagnostic Helper for Appointment Booking Auth Issues
 * 
 * Paste this into the browser DevTools console and run it
 */

function diagnoseBookingIssue() {
  console.log("\n🔍 BOOKING DIAGNOSIS REPORT\n" + "=".repeat(60));

  // 1. Check Session Storage
  console.log("\n1️⃣  SESSION STORAGE");
  const token = sessionStorage.getItem("access_token");
  const userId = sessionStorage.getItem("user_id");
  const role = sessionStorage.getItem("role");

  console.log(`   access_token: ${token ? "✅ Present (" + token.substring(0, 20) + "...)" : "❌ MISSING"}`);
  console.log(`   user_id: ${userId || "❌ MISSING"}`);
  console.log(`   role: ${role || "❌ MISSING"}`);

  if (!token) {
    console.log("\n   🚨 CRITICAL: No auth token found!");
    console.log("   💡 Solution: You need to log in first");
    return;
  }

  // 2. Check Token Format
  console.log("\n2️⃣  TOKEN FORMAT");
  const tokenParts = token.split(".");
  console.log(`   Parts: ${tokenParts.length === 3 ? "✅ Valid JWT (3 parts)" : "❌ Invalid format"}`);
  
  // 3. Test API Connectivity
  console.log("\n3️⃣  API CONNECTIVITY TEST");
  console.log("   Testing GET /all (should work without auth)...");
  
  fetch("http://localhost:5000/api/restaurateurs-services/all", {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  })
    .then(r => {
      console.log(`   ✅ GET request: ${r.status}`);
      return r.json();
    })
    .then(data => {
      console.log(`   📊 Services found: ${data?.length || 0}`);
      
      // 4. Test Auth Request
      console.log("\n4️⃣  AUTHENTICATION TEST");
      console.log("   Testing POST /appointments with auth...");
      
      const testData = {
        service_id: 1,
        date: new Date().toISOString(),
        restaurateurs_id: 1,
        clientType: "regular"
      };
      
      return fetch("http://localhost:5000/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(testData)
      });
    })
    .then(r => {
      console.log(`   📤 POST request: ${r.status}`);
      if (r.status === 401) {
        console.log("   ❌ AUTH FAILED: 401 Unauthorized");
        console.log("   💡 Your token may be expired. Try logging out and back in.");
      } else if (r.status === 400) {
        console.log("   ⚠️  Request validation failed (expected if service doesn't exist)");
      } else if (r.status === 201) {
        console.log("   ✅ SUCCESS: Appointment created!");
      }
      return r.json();
    })
    .then(data => {
      console.log("   Response:", data);
    })
    .catch(err => {
      console.error("   ❌ Error:", err.message);
    });

  console.log("\n" + "=".repeat(60));
  console.log("📌 Waiting for async tests...\n");
}

// Run the diagnosis
diagnoseBookingIssue();
