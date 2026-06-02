# Debugging Nearby Restaurants - Complete Guide

## Issue

Client is not seeing nearby restaurants when searching.

## Verification Steps

### Step 1: Confirm Backend API Works

```bash
# Test the API directly
curl "http://localhost:5000/api/location/nearby-restaurateurs?latitude=27.7172&longitude=85.3240&maxDistance=10"
```

**Expected Response:**

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 1,
      "first_name": "restaurateurs",
      "latitude": "27.717200",
      "longitude": "85.324000",
      "location_name": "Kathmandu Center",
      "distance": 0
    }
    // ... more results
  ]
}
```

**Status:** ✅ API is working

---

### Step 2: Check Browser Console

1. Open the browser (Tab with client logged in)
2. Press `F12` to open Developer Tools
3. Go to **Console** tab
4. Navigate to "Nearby Restaurants" page
5. Check for these log messages:

**Expected logs:**

```
🔍 Fetching nearby restaurateurs with params: {...}
✅ API Response: {...}
📍 Raw data from API: [...]
🎯 Normalized data: [...]
```

**If you see ❌ Error logs:**

- Check what the error message says
- Common issues:
  - Network error (server not running)
  - 401 Unauthorized (token issue)
  - 400 Bad Request (invalid coordinates)

---

### Step 3: Verify Client Location Setup

**Option A: Browser Geolocation**

1. Go to Nearby Restaurants page
2. Check "Use my current location" radio button
3. Click "Find Nearby Restaurant" button
4. Browser should prompt for location permission
5. Allow access
6. Check console for logs

**Option B: Manual Coordinates**

1. Select "Enter coordinates manually" radio button
2. Enter these test coordinates:
   - Latitude: `27.7172`
   - Longitude: `85.3240`
3. Leave search radius at default (5 km)
4. Click "Find Nearby Restaurant"
5. Check console for logs

---

### Step 4: Verify Restaurant Locations in DB

```bash
# Check if restaurants have location data
curl "http://localhost:5000/api/location/debug/restaurateurs"
```

**Expected Response:**

```json
{
  "success": true,
  "total": 3,
  "withLocation": 3,
  "withoutLocation": 0,
  "data": {
    "withLocation": [
      {
        "id": 1,
        "latitude": "27.717200",
        "longitude": "85.324000"
      }
      // ... more results
    ],
    "withoutLocation": []
  }
}
```

---

## Most Common Issues & Solutions

### Issue 1: Console shows ❌ "Network Error"

**Cause:** Backend server not running
**Solution:**

```bash
cd /home/xerox/BarberHoodv2/server
npm start
```

### Issue 2: Console shows ❌ "401 Unauthorized"

**Cause:** Client token expired or invalid
**Solution:**

1. Log out and log back in
2. Ensure `sessionStorage` has `access_token`
3. Check browser DevTools → Application → Session Storage

### Issue 3: Console shows ❌ "Bad Request - Latitude and longitude required"

**Cause:** Parameters not being sent correctly
**Solution:**

1. Make sure you enter valid coordinates
2. Check browser DevTools → Network tab → nearby-restaurateurs request
3. Verify query parameters in URL: `?latitude=27.7172&longitude=85.3240&maxDistance=5`

### Issue 4: Console shows ✅ Response but no results showing

**Cause:** React not updating state
**Solution:**

1. Hard refresh browser: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
2. Check if `data` array is empty in console
3. If empty, increase search radius to 50 km and try again

### Issue 5: "No restaurants found" message

**Cause:** All restaurants are outside the search radius
**Solution:**

1. Increase search radius slider to 50 km
2. Use coordinates exactly at one restaurant location:
   - Restaurant 1: 27.7172, 85.3240
   - Restaurant 2: 27.7150, 85.3200
   - Restaurant 3: 27.7200, 85.3300

---

## Network Debugging

### Check Network Tab in DevTools

1. Open DevTools (F12)
2. Go to **Network** tab
3. Reload page or perform search
4. Look for request to `nearby-restaurateurs`
5. Click on it to see details

**Check:**

- ✅ Status: 200 (success) or 304 (cached)
- ✅ Method: GET
- ✅ URL includes query params: `?latitude=...&longitude=...&maxDistance=...`
- ✅ Response shows JSON with restaurant data

**If status is 400 or 401:**

- 400 = Invalid parameters
- 401 = Authentication failed
- See solutions above

---

## Fresh Start Debug Script

If everything is still broken, try this from scratch:

```bash
# Terminal 1: Start backend
cd /home/xerox/BarberHoodv2/server
npm start

# Terminal 2: Start frontend
cd /home/xerox/BarberHoodv2/client
npm run dev

# Terminal 3: Test API
curl "http://localhost:5000/api/location/debug/restaurateurs"
curl "http://localhost:5000/api/location/nearby-restaurateurs?latitude=27.7172&longitude=85.3240&maxDistance=50"
```

Then:

1. Open http://localhost:5173 in browser
2. Login as client
3. Go to Nearby Restaurants
4. Enter coordinates: 27.7172, 85.3240
5. Increase radius to 50 km
6. Click search
7. Check console for logs

---

## Database Reset (If Needed)

If restaurants lost their locations somehow:

```bash
cd /home/xerox/BarberHoodv2/server
node addRestaurantLocations.js
```

Then verify:

```bash
curl "http://localhost:5000/api/location/debug/restaurateurs"
```

Should show all 3 restaurants with locations.

---

## What Should Happen (Happy Path)

1. ✅ Client logs in
2. ✅ Opens Nearby Restaurants page
3. ✅ Sees option to enable location or enter coordinates
4. ✅ Enters or allows location access
5. ✅ API called with coordinates
6. ✅ Server returns 3 nearby restaurants with distances
7. ✅ Results displayed sorted by distance
8. ✅ Can click "View Profile" for each restaurant
