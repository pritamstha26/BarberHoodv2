# Two-Tab Testing Setup - Summary

## What's Fixed ✅

### 1. **API Returns Filtered Results**

- ✅ The `/api/location/nearby-restaurateurs` endpoint now returns ONLY nearby restaurants (not all)
- ✅ Filters by distance using Haversine formula
- ✅ Results sorted by distance (closest first)

### 2. **Smart User Exclusion**

- ✅ **Clients** see ALL restaurateurs within radius
- ✅ **Restaurateurs** searching nearby don't see themselves
- ✅ Uses JWT token's role field to determine exclusion logic

### 3. **Location Data in Registration**

- ✅ Registration endpoint now accepts `latitude`, `longitude`, `location_name`
- ✅ Restaurateurs can provide location during signup
- ✅ Or update location later via `/api/location/update`

### 4. **Debug Endpoint**

- ✅ New debug endpoint: `GET /api/location/debug/restaurateurs`
- ✅ Shows which restaurateurs have/don't have location data
- ✅ Helps troubleshoot location issues

---

## How to Test with Two Tabs

### Step 1: Verify Restaurant Has Location

```bash
curl "http://localhost:5000/api/location/debug/restaurateurs"
```

**Look for:** Your restaurant should be in `withLocation` array

### Step 2: If Restaurant Missing Location

```bash
curl -X PUT "http://localhost:5000/api/location/update" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_RESTAURANT_TOKEN" \
  -d '{
    "latitude": 27.7172,
    "longitude": 85.3240,
    "location_name": "Kathmandu"
  }'
```

### Step 3: Tab 1 - Open as Restaurant

1. Go to `http://localhost:5173`
2. Login with **restaurant/restaurateur account**
3. Note: Each tab has separate `sessionStorage`, so you MUST log in separately

### Step 4: Tab 2 - Open as Client

1. Go to `http://localhost:5173` in a **NEW TAB**
2. Login with **client account**
3. Navigate to "Nearby Restaurants" page
4. Allow location OR enter coordinates similar to restaurant's location
5. **Should see the restaurant from Tab 1!**

---

## Data Flow

```
Tab 1 (Restaurant)              Tab 2 (Client)
    |                               |
    |-- Login                       |-- Login
    |-- Token stored in             |-- Token stored in
    |   sessionStorage              |   sessionStorage
    |   (Tab 1 only)                |   (Tab 2 only)
    |                               |
    |                               |-- Navigate to Nearby Restaurants
    |                               |-- Allow Location/Enter Coordinates
    |                               |-- API Request:
    |                               |   GET /location/nearby-restaurateurs
    |                               |   ?latitude=27.7172&longitude=85.3240
    |                               |
    |                               |-- Server Response:
    |                               |   [Restaurant from Tab 1 if within radius]
    |                               |
    |                               |-- Display results
```

---

## Key Features

### For Clients:

- See all nearby restaurateurs within search radius
- Distance calculated and shown
- Results sorted by proximity
- Can increase search radius if needed

### For Restaurateurs:

- Excluded from their own nearby search results
- Can still see OTHER restaurateurs
- Location can be set during registration or via settings

### Security:

- Each tab has independent authentication
- Token-based authentication with role-based exclusion
- JWT includes user role for permission checks

---

## Files Modified

1. **`/server/controllers/locationController.js`**
   - Fixed `getNearbyRestaurateurs()` to return filtered results
   - Added role-based user exclusion logic
   - Added debug endpoint `debugRestaurateurs()`

2. **`/server/controllers/authController.js`**
   - Updated registration to accept location data

3. **`/server/routes/locationRoutes.js`**
   - Added route for debug endpoint

---

## Troubleshooting

| Issue                        | Solution                                                              |
| ---------------------------- | --------------------------------------------------------------------- |
| No restaurants showing       | Check `/api/location/debug/restaurateurs` - restaurant needs location |
| Restaurant seeing themselves | Already fixed! Role-based exclusion works                             |
| Different logins per tab     | This is expected - `sessionStorage` is tab-specific                   |
| Wrong distance calculation   | Check coordinates - verify latitude/longitude format                  |
| API returns 400 error        | Ensure latitude & longitude are valid numbers                         |

---

## Testing the Fix

### Before (Bug):

- Client searches nearby → Gets ALL restaurants (unfiltered)
- Restaurant A searches → Sees themselves in results

### After (Fixed):

- Client searches nearby → Gets only restaurants within radius (e.g., 5km)
- Restaurant A searches → Doesn't see themselves, only OTHER restaurants
- Results include calculated distance for each restaurant
- Results sorted by distance (closest first)
