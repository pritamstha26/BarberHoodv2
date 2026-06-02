# Testing Two Tabs (Restaurant + Client)

## Setup Requirements

### 1. Database Check - Verify Restaurateurs Have Locations

Before testing, check if your restaurateur has location data:

```bash
curl "http://localhost:5000/api/location/debug/restaurateurs"
```

**Expected Response:**

```json
{
  "success": true,
  "total": 2,
  "withLocation": 1,
  "withoutLocation": 1,
  "data": {
    "withLocation": [
      {
        "id": 2,
        "first_name": "John",
        "last_name": "Restaurateur",
        "email": "restaurant@example.com",
        "latitude": 27.7172,
        "longitude": 85.3240,
        "location_name": "Kathmandu"
      }
    ],
    "withoutLocation": [...]
  }
}
```

If your restaurateur shows in `withoutLocation`, they need to set their location first.

---

## Step 1: Set Restaurateur Location

If the restaurateur doesn't have a location, set it using:

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

---

## Step 2: Tab 1 - Restaurant Account

1. **Open first tab:** `http://localhost:5173` (or your Vite port)
2. **Log in** with restaurant/restaurateur credentials
3. **Go to Dashboard** or relevant page
4. **Note the location:** Your restaurant's coordinates should be stored

---

## Step 3: Tab 2 - Client Account

1. **Open second tab:** `http://localhost:5173` (or your Vite port) in a NEW tab
2. **Log in** with a CLIENT account (different from restaurant)
3. **Navigate to:** "Nearby Restaurants" or "Find Restaurants" page
4. **Allow location access** when prompted, OR
5. **Manually enter coordinates** similar to the restaurant's location

---

## Step 4: Verify Results

**Client should see the restaurant** if:

- ✅ Restaurant has latitude & longitude in database
- ✅ Client's location is within the search radius (default 5km)
- ✅ Restaurant's role is "restaurateurs"
- ✅ Distance calculation is working correctly

---

## Debugging - Check Network Requests

### In Browser DevTools (Tab 2 - Client):

1. Open **Console** (F12)
2. Check for the API request:

   ```
   GET /api/location/nearby-restaurateurs?latitude=27.7172&longitude=85.3240&maxDistance=5
   ```

3. **Expected Response:**
   ```json
   {
     "success": true,
     "count": 1,
     "data": [
       {
         "id": 2,
         "first_name": "John",
         "last_name": "Restaurateur",
         "email": "restaurant@example.com",
         "phone_number": "9841234567",
         "latitude": 27.7172,
         "longitude": 85.324,
         "location_name": "Kathmandu",
         "distance": 0.05
       }
     ]
   }
   ```

---

## Common Issues & Solutions

### Issue 1: Client sees no restaurants

**Solution:**

- Check if restaurant has location (`/api/location/debug/restaurateurs`)
- Increase search radius in the UI
- Verify coordinates are within range

### Issue 2: Restaurateur seeing themselves

**Solution:**

- Already fixed! Restaurateurs are now excluded from their own search results

### Issue 3: Different tokens in each tab

**Solution:**

- This is NORMAL! Each tab has separate `sessionStorage`
- Each tab must log in independently
- Tab 1 = Restaurant login, Tab 2 = Client login

### Issue 4: "Latitude and longitude are required"

**Solution:**

- Make sure client is allowing location access
- OR manually enter valid coordinates in the form

---

## Quick Test Commands

### Check all restaurateurs:

```bash
curl "http://localhost:5000/api/location/debug/restaurateurs"
```

### Search nearby (as if client at Kathmandu center):

```bash
curl "http://localhost:5000/api/location/nearby-restaurateurs?latitude=27.7172&longitude=85.3240&maxDistance=10"
```

### Update restaurateur location:

```bash
curl -X PUT "http://localhost:5000/api/location/update" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"latitude": 27.7172, "longitude": 85.3240, "location_name": "Kathmandu"}'
```

---

## Expected Behavior

✅ **Tab 1 (Restaurant)**: Sees dashboard, can manage their services
✅ **Tab 2 (Client)**: Can search for nearby restaurants and see Tab 1's restaurant
✅ **Exclusion Logic**: If Tab 1 restaurant searches for nearby restaurants, they won't see themselves
✅ **Search Results**: Sorted by distance (closest first)
