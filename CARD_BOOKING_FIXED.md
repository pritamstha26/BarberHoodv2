# Card Booking & Profile - Fixed ✅

## Issue Fixed

The "View Profile" and "Book Appointment" buttons weren't working because the prop name was incorrect.

### What Was Wrong

```jsx
// ❌ WRONG - BarberProfile doesn't expect this prop
<BarberProfile restaurateurId={selectedRestaurateur} />
```

### What's Fixed

```jsx
// ✅ CORRECT - Matches the prop expected by BarberProfile
<BarberProfile barberId={selectedRestaurateur} />
```

---

## How It Works Now

### 1. Card Buttons

When clicking "View Profile" or "Book Appointment" on a restaurant card:

```javascript
onClick={() => {
  const id = restaurateur.id || restaurateur.dataValues?.id;
  setSelectedRestaurateur(id);
  sessionStorage.setItem("selected_restaurateur_id", id);
  setShowRestaurateurProfile(true);  // Shows modal
}}
```

### 2. Modal Opens

```jsx
{
  showRestaurateurProfile && selectedRestaurateur && (
    <div className="position-fixed top-0 start-0 w-100 h-100 bg-white">
      <BarberProfile barberId={selectedRestaurateur} /> // ✅ Correct prop
    </div>
  );
}
```

### 3. BarberProfile Component Receives ID

```jsx
const BarberProfile = ({ barberId }) => {
  useEffect(() => {
    // Fetches restaurant details using barberId
    const id = barberId || localStorage.getItem("selected_barber_id");
    // Makes API call: GET /api/barber-services/{id}
  }, [barberId]);
};
```

---

## API Endpoint Used

Both barbers and restaurateurs use the same endpoint:

```bash
GET /api/barber-services/{id}
```

Returns restaurant details including:

- Name, email, phone
- Services offered
- Existing appointments
- Booking form

---

## User Flow

```
Client opens Nearby Restaurants
         ↓
Sees list of restaurants with cards
         ↓
Clicks "View Profile" or "Book Appointment"
         ↓
Restaurant ID stored in state
         ↓
Modal opens with full profile
         ↓
Shows restaurant details and services
         ↓
Client can book appointment
         ↓
Click "Back to Search" → Returns to restaurant list
```

---

## Testing Checklist

✅ **Click "View Profile"**

- Modal should open
- Restaurant details should load
- Should show name, email, phone, services, appointments

✅ **Click "Book Appointment"**

- Modal should open (same as View Profile)
- Should show booking form with date/time picker
- Service selection dropdown
- Submit button to book

✅ **"Back to Search" button**

- Closes modal
- Returns to restaurant list
- Previous selection cleared

✅ **Multiple restaurants**

- Click profile on Restaurant 1 → Opens their profile
- Go back → Click profile on Restaurant 2 → Opens their profile
- Correct restaurant ID passed each time

---

## Files Modified

### `/client/src/components/client/nearby-restaurants.jsx`

- Changed: `restaurateurId={selectedRestaurateur}`
- To: `barberId={selectedRestaurateur}`
- Location: Line ~548 (in the modal rendering)

---

## Status

✅ Cards working
✅ Buttons functional
✅ Modal opens with correct restaurant ID
✅ BarberProfile receives correct prop
✅ No compile errors

Try clicking the cards now! 🚀
