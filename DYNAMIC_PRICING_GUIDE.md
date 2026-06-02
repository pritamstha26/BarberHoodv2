# Dynamic Pricing & Table Capacity Management

## Overview

This document describes the production-ready dynamic pricing system that adjusts service prices based on real-time demand and restaurant capacity. The system ensures optimal booking distribution and revenue management.

## Features

### 1. **Dynamic Pricing Algorithm**

- Calculates surge multipliers based on utilization ratio
- Triggers when restaurant reaches 60% capacity
- Maximum surge: +50% price increase
- Token-efficient with early returns for non-dynamic requests

### 2. **Restaurant Capacity Management**

- Restaurateurs set table/seat count during setup
- Directly impacts pricing calculations
- Validation: 1-1000 tables per restaurant
- Default: 10 tables if not specified

### 3. **24-Hour Booking Gap Enforcement**

- Clients must wait 24 hours between appointments
- Prevents consecutive/overlapping reservations
- Validated at appointment creation

### 4. **Surge Price Confirmation Modal**

- Client-side confirmation before surge pricing applies
- Shows original vs. dynamic price comparison
- Displays demand rationale to users
- Improves user experience and transparency

## Architecture

### Backend Components

#### 1. **Dynamic Pricing Utility** (`server/utils/dynamicPricing.js`)

```javascript
// Function signature
calculateDynamicPricing({
  basePrice,           // Original service price
  activeAppointments,  // Count of active bookings
  totalCapacity,       // Restaurant's seat capacity
  threshold = 0.6,     // Surge trigger threshold (60%)
  maxSurge = 0.5       // Maximum surge multiplier (50%)
})
```

**Returns:**

```javascript
{
  (originalPrice, // Unchanged base price
    dynamicPrice, // Adjusted price with surge
    multiplier, // Pricing multiplier (1.0 = no surge)
    utilization, // Current capacity utilization ratio
    threshold, // Threshold used for calculation
    maxSurge); // Max surge used for calculation
}
```

**Algorithm:**

```
utilization = activeAppointments / totalCapacity
if utilization >= threshold:
  surge_factor = (utilization - threshold) / (1 - threshold)
  surge_factor = clamp(surge_factor, 0, 1)
  multiplier = 1 + (surge_factor * maxSurge)
else:
  multiplier = 1.0

dynamicPrice = basePrice * multiplier
```

**Example:**

- Base price: $50
- Active appointments: 8
- Total capacity: 10 tables
- Utilization: 80%
- Surge factor: (0.8 - 0.6) / 0.4 = 0.5
- Multiplier: 1 + (0.5 × 0.5) = 1.25
- Dynamic price: $50 × 1.25 = **$62.50** (+25%)

#### 2. **Table Capacity Utility** (`server/utils/tableCapacity.js`)

```javascript
// Update restaurateur's seat capacity
updateRestaurantCapacity(UsersModel, restaurateurId, newCapacity);

// Get restaurateur's current capacity
getRestaurantCapacity(UsersModel, restaurateurId);
```

#### 3. **Service Controller** (`server/controllers/barberServiceController.js`)

**Key Features:**

- `/restaurateurs-services/all?dynamic=true&restaurateurId=<id>` endpoint
- Early return for non-dynamic requests (token optimization)
- Single linear flow for pricing calculations
- Includes utilization and demand metrics in response

**Request Query Parameters:**

- `dynamic=true`: Enable dynamic pricing calculation
- `restaurateurId`: Target restaurant ID (required for dynamic)

**Response with Dynamic Pricing:**

```javascript
{
  id: "uuid",
  title: "Service Name",
  original_price: 50,
  dynamic_price: 62.50,
  multiplier: 1.25,
  utilization: 0.8,
  demandInfo: {
    activeAppointments: 8,
    totalCapacity: 10,
    utilization: 0.8,
    multiplier: 1.25
  }
  // ... other service properties
}
```

#### 4. **Appointment Controller** (`server/controllers/appointmentController.js`)

**24-Hour Booking Gap Validation:**

```javascript
canBookAfterOneDay(existingAppointments, desiredDate);
// Ensures 24 hours between client's appointments
// Throws error if gap violated
```

#### 5. **Client Controller** (`server/controllers/clientController.js`)

**Capacity Management Endpoints:**

```
PUT /users/restaurateur/:id/capacity
GET /users/restaurateur/:id/capacity
```

### Frontend Components

#### 1. **Restaurant Settings** (`client/src/components/client/restaurant-settings.jsx`)

**Features:**

- Restaurateurs configure seat capacity
- Real-time form validation
- Visual feedback (success/error alerts)
- Shows how capacity affects pricing

**Props:**

```javascript
{
  restaurateurId: string,           // Restaurant ID
  onCapacityUpdate: function(num)   // Callback when capacity updated
}
```

#### 2. **Surge Price Confirmation Modal** (`client/src/components/client/surge-price-modal.jsx`)

**Features:**

- Displays price comparison
- Shows demand rationale
- Clear confirmation/cancel buttons
- Responsive design

**Props:**

```javascript
{
  show: boolean,
  onConfirm: function,
  onCancel: function,
  originalPrice: number,
  dynamicPrice: number,
  multiplier: number,
  utilization: number,
  restaurantName: string,
  serviceTitle: string
}
```

#### 3. **Barber Profile** (`client/src/components/client/barber-profile.jsx`)

**Updated Features:**

- Fetches services with dynamic pricing when applicable
- Shows surge price modal when multiplier > 1.0
- Displays demand badges and alerts
- Prevents booking when fully booked

**Flow:**

1. User selects service to book
2. Check if dynamic pricing applies
3. If surge: Show confirmation modal
4. On confirm: Submit appointment with surge price
5. On cancel: Return to booking form

## API Endpoints

### Service Endpoints

```
GET /restaurateurs-services/:id
  - Get single restaurant details

GET /restaurateurs-services/all?dynamic=true&restaurateurId=<id>
  - Get all services with dynamic pricing
  - Query params:
    * dynamic: true/false (enable pricing calculation)
    * restaurateurId: restaurant ID (required if dynamic=true)
```

### Appointment Endpoints

```
POST /appointments
  - Create appointment
  - Validates 24-hour gap
  - Accepts both dynamic and original prices

GET /appointments/restaurateurs/:id
  - Get active appointments for restaurant
  - Used for capacity calculation
```

### User Capacity Endpoints

```
PUT /users/restaurateur/:id/capacity
  - Update restaurant seat capacity
  - Body: { seat_capacity: number }
  - Response includes updated capacity

GET /users/restaurateur/:id/capacity
  - Get current restaurant capacity
  - Used in settings pages
```

## Database Schema

### Users Table (Restaurateurs)

```javascript
{
  id: UUID,
  first_name: String,
  last_name: String,
  email: String,
  phone_number: String,
  role: 'restaurateurs',
  seat_capacity: Integer (default: 10),  // NEW
  // ... other fields
}
```

### Services Table

```javascript
{
  id: UUID,
  restaurateur_id: UUID,
  title: String,
  description: String,
  price: Decimal,  // This becomes original_price in API
  duration: Integer,
  // ... other fields
}
```

### Appointments Table

```javascript
{
  id: UUID,
  service_id: UUID,
  client_id: UUID,
  restaurateur_id: UUID,
  date: DateTime,
  status: 'pending|accepted|completed|cancelled',
  // ... other fields
}
```

## Implementation Guide

### For Restaurateurs

#### Step 1: Set Table Capacity

During registration or in settings:

1. Navigate to Restaurant Settings
2. Enter table capacity (1-1000)
3. Click Save Changes
4. System confirms capacity update

#### Step 2: Monitor Pricing

Once capacity is set:

- Prices automatically adjust when 60%+ tables are booked
- View current utilization in Dashboard
- Monitor demand trends over time

### For Clients

#### Step 1: Browse Services

1. Navigate to restaurant profile
2. View all services with current pricing
3. High-demand badge shows if surge pricing active

#### Step 2: Book Service

1. Select desired service and time
2. If surge pricing applies:
   - Confirmation modal shows price comparison
   - Clear explanation of surge reason
   - Option to confirm or cancel
3. If no surge: Book immediately
4. Receive confirmation

## Token Optimization

### Early Return Pattern

The service controller implements early returns to minimize database queries:

```javascript
// Non-dynamic request: return immediately
if (!needsDynamicPricing) {
  return services; // Skip capacity/appointment queries
}

// Dynamic request: perform full calculation
const activeAppointments = await countActiveAppointments();
const capacity = getRestaurateurCapacity();
// Apply pricing...
```

### Database Query Reduction

**Before:** Every service request hit 3 queries

- Services table
- Appointments table
- Restaurateur table

**After:** Non-dynamic requests hit 1 query

- Services table only
- Others skipped with early return

**Impact:** ~66% reduction in database operations for non-dynamic requests

## Production Deployment Checklist

- [ ] Database migration for `seat_capacity` column added
- [ ] All restaurateurs have default `seat_capacity` set to 10
- [ ] Dynamic pricing utility deployed and tested
- [ ] Service endpoints return pricing data correctly
- [ ] Appointment validation enforces 24-hour gaps
- [ ] Surge modal displays correctly on client-side
- [ ] Restaurant settings component accessible to restaurateurs
- [ ] Error handling covers all edge cases
- [ ] Capacity validation prevents invalid inputs
- [ ] API tests pass for all endpoints
- [ ] Load tests confirm token optimization works

## Error Handling

### Validation Errors

```javascript
// Invalid capacity
400: "Capacity must be at least 1 table"
400: "Capacity cannot exceed 1000 tables"

// Authentication issues
401: "No token provided"
403: "Access denied: Only restaurateurs can update capacity"

// Resource not found
404: "Restaurateur not found"
404: "Service not found"
```

### Booking Errors

```javascript
// 24-hour gap violation
409: "You must wait 24 hours before booking another appointment"

// Fully booked
400: "This restaurant is fully booked. Please choose different time."

// Missing data
400: "seat_capacity must be a number"
```

## Testing Recommendations

### Unit Tests

1. **Dynamic Pricing Utility**
   - Test surge calculation at various utilization levels
   - Test boundary conditions (0%, 60%, 100% capacity)
   - Test clamping behavior for multiplier

2. **Capacity Validation**
   - Test valid inputs (1, 10, 1000)
   - Test invalid inputs (0, -1, 1001)

3. **24-Hour Gap Validation**
   - Test gap calculation accuracy
   - Test with appointments in different timezones

### Integration Tests

1. **Service Booking Flow**
   - Book service without surge pricing
   - Book service with surge pricing
   - Verify confirmation modal appears

2. **Capacity Update Flow**
   - Restaurateur updates capacity
   - Verify pricing recalculates
   - Verify API returns updated values

### Performance Tests

1. **Query Optimization**
   - Measure query count with `dynamic=false`
   - Measure query count with `dynamic=true`
   - Verify early return works

2. **Load Testing**
   - Simulate 100+ concurrent bookings
   - Verify pricing calculations remain accurate
   - Monitor database performance

## Future Enhancements

1. **Caching Layer**
   - Cache demand info for 2-5 minutes
   - Reduce repeated calculations
   - Invalidate on new appointment

2. **Advanced Analytics**
   - Track pricing changes over time
   - Revenue impact analysis
   - Demand forecasting

3. **Time-Based Pricing**
   - Peak hours multiplier
   - Weekend pricing
   - Holiday surcharges

4. **Dynamic Threshold**
   - Restaurateurs customize surge trigger (instead of fixed 60%)
   - Custom max surge multiplier

5. **Loyalty System**
   - Regular customers get discount on surge prices
   - VIP access to low-demand time slots

## Support & Troubleshooting

### Issue: Surge pricing not triggering

**Diagnostics:**

1. Check restaurateur's `seat_capacity` is set (not null)
2. Verify active appointments > 0
3. Confirm utilization >= 60%
4. Check `dynamic=true` query param sent

**Solution:**

```javascript
// Debug endpoint to check capacity
GET /users/restaurateur/:id/capacity
// Should return seat_capacity > 0
```

### Issue: Modal not showing for surge price

**Diagnostics:**

1. Check `dynamic_price > original_price`
2. Verify multiplier > 1.0
3. Check browser console for errors

**Solution:**

```javascript
// Add logging in barber-profile.jsx
console.log({
  original: selectedService.original_price,
  dynamic: selectedService.dynamic_price,
  multiplier: selectedService.multiplier,
});
```

## Conclusion

This production-ready dynamic pricing system provides:

- ✅ Automatic demand-based pricing
- ✅ Restaurant capacity control
- ✅ Booking gap enforcement
- ✅ User-friendly confirmation flow
- ✅ Token-efficient architecture
- ✅ Scalable for future enhancements

For questions or issues, refer to the API documentation or contact the development team.
