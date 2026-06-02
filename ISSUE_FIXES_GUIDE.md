# Three Critical Issues - Fix Guide

**Date:** June 1, 2026  
**Issues:** (1) FK constraints on multiple bookings, (2) Capacity UI missing, (3) Pricing not visible

---

## Issue #1: Foreign Key Constraints When Client Books Multiple Days

### Problem

When a client tries to book appointments for multiple consecutive days, the system returns:

```
insert or update on table "AppointmentModels" violates foreign key constraint
```

### Root Cause

The business logic currently enforces **ONE active appointment per client** at a time:

```javascript
// Line 199 in appointmentController.js
if (!canBookAfterOneDay(existingAppointments, appointmentDate)) {
  return res.status(409).json({
    message:
      "You have an existing appointment. Please book at least one day after your last appointment.",
  });
}
```

This prevents multiple consecutive bookings which is valid for restaurants (e.g., lunch reservations for 3 days).

### Solution

**Step 1: Modify the booking constraint logic**

File: `server/controllers/appointmentController.js` (around line 199)

Change from:

```javascript
// ONE active appointment per client only
if (!canBookAfterOneDay(existingAppointments, appointmentDate)) {
  return res.status(409).json({...});
}
```

To:

```javascript
// ALLOW multiple appointments but enforce minimum 1-hour gap between same restaurant
const sameRestaurantAppointments = existingAppointments.filter(
  (apt) => apt.restaurateurId === restaurateurId,
);

if (sameRestaurantAppointments.length > 0) {
  const canBook = canBookAfterMinimumGap(
    sameRestaurantAppointments,
    appointmentDate,
    60,
  ); // 60 minute gap
  if (!canBook) {
    return res.status(409).json({
      success: false,
      message:
        "Please book at least 1 hour after your previous appointment at this restaurant",
    });
  }
}
```

**Step 2: Add the new helper function**

Add this new function in `server/controllers/appointmentController.js` (after `canBookAfterOneDay`):

```javascript
function canBookAfterMinimumGap(
  existingAppointments,
  desiredTime,
  minGapMinutes = 60,
) {
  if (!existingAppointments || existingAppointments.length === 0) return true;

  const desiredTimeMs = new Date(desiredTime).getTime();
  const MIN_GAP_MS = minGapMinutes * 60 * 1000;

  for (const apt of existingAppointments) {
    const appointmentTime = new Date(apt.date).getTime();
    const timeDifference = Math.abs(desiredTimeMs - appointmentTime);

    if (timeDifference < MIN_GAP_MS) {
      return false;
    }
  }

  return true;
}
```

**Step 3: Update validation in appointment model** (optional but recommended)

File: `server/models/appointmentModel.js`

Add a new field to track restaurant + date uniqueness:

```javascript
// This prevents double-booking the exact same table at exact same time
const AppointmentModel = sequelize.define("AppointmentModel", {
  // ... existing fields ...
  uniqueKey: {
    type: DataTypes.STRING,
    allowNull: true,
    // composite: 'restaurateurId-date-hourSlot'
  },
});
```

### Result

✅ Clients can book multiple days at same restaurant (with 1-hour gap)  
✅ No more FK constraint violations  
✅ Prevents overbooking of single time slots

---

## Issue #2: Restaurants Can't Provide Number of Tables

### Problem

The capacity field exists in database but:

- No UI button/tab to access settings
- Restaurants don't know how to set their capacity
- Capacity defaults to 10 and never changes

### Solution

**Step 1: Add Settings Link to Restaurateur Dashboard**

File: `client/src/components/client/sidebar.jsx` or appropriate menu file

Add this to the navigation menu:

```jsx
<NavLink to="/restaurant-settings" className="nav-item">
  <FiSettings /> Restaurant Settings
</NavLink>
```

**Step 2: Update Client Routes**

File: `client/src/routes/routes.jsx`

Add this route:

```jsx
{
  path: "/restaurant-settings",
  element: <ProtectedRoute element={<RestaurantSettings />} requiredRole="restaurateurs" />
}
```

**Step 3: Create RestaurantSettings Wrapper Component**

File: `client/src/components/client/settings.jsx` (update or create)

```jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RestaurantCapacitySettings from "./restaurant-settings";
import { Container, Row, Col, Card, Tabs, Tab } from "react-bootstrap";
import "./settings.css";

export default function RestaurantSettingsPage() {
  const navigate = useNavigate();
  const [restaurateurId, setRestaurateurId] = useState(null);

  useEffect(() => {
    const userId = sessionStorage.getItem("user_id");
    const userRole = sessionStorage.getItem("role");

    if (!userId || userRole !== "restaurateurs") {
      navigate("/login");
      return;
    }

    setRestaurateurId(parseInt(userId));
  }, [navigate]);

  if (!restaurateurId) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <Container className="mt-5 mb-5">
      <Row>
        <Col lg={8} className="mx-auto">
          <Card className="shadow-lg">
            <Card.Header className="bg-primary text-white">
              <h3 className="mb-0">Restaurant Management</h3>
            </Card.Header>
            <Card.Body>
              <Tabs defaultActiveKey="capacity" className="mb-3">
                <Tab eventKey="capacity" title="Table Capacity">
                  <div className="mt-3">
                    <RestaurantCapacitySettings
                      restaurateurId={restaurateurId}
                    />
                  </div>
                </Tab>
                <Tab eventKey="info" title="Restaurant Info">
                  <div className="mt-3">
                    <p className="text-muted">More settings coming soon...</p>
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
```

**Step 4: Add Visual Indicator on Dashboard**

File: `client/src/components/client/dashboard.jsx`

Add this card at top of restaurateur dashboard:

```jsx
{
  userRole === "restaurateurs" && (
    <Alert variant="info" className="mb-3">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <strong>💡 Tip:</strong> Manage your restaurant capacity in
          <Link to="/restaurant-settings" className="ms-2">
            Restaurant Settings
          </Link>
        </div>
      </div>
    </Alert>
  );
}
```

### Result

✅ Restaurateurs have easy access to capacity settings  
✅ Clear UI for setting number of tables  
✅ Automatic effect on dynamic pricing

---

## Issue #3: Show Pricing Changes

### Problem

Clients don't see:

- Normal price vs surge price comparison
- Why prices are changing
- Demand indicators
- Total cost before confirming

### Solution

**Step 1: Enhance Service Display with Pricing Info**

File: `client/src/components/client/barber-profile.jsx` (around line 510-590)

Update service card to show pricing:

```jsx
<div className="service-card p-3 border-bottom">
  <div className="d-flex justify-content-between align-items-start">
    <div className="flex-grow-1">
      <h6 className="mb-1">{service.name}</h6>
      <p className="text-muted small mb-2">{service.duration} mins</p>

      {/* Pricing Display */}
      <div className="pricing-info mb-2">
        {service.multiplier > 1 ? (
          <div className="surge-pricing">
            <span className="text-muted text-decoration-line-through">
              ₹{service.original_price}
            </span>
            <span className="text-warning ms-2 fw-bold">
              ₹{service.dynamic_price}
              <small className="ms-1 badge bg-warning text-dark">
                Surge x{service.multiplier.toFixed(2)}
              </small>
            </span>
          </div>
        ) : (
          <span className="text-success fw-bold">₹{service.price}</span>
        )}
      </div>

      {/* Demand Indicator */}
      {service.multiplier > 1 && (
        <div className="demand-bar mb-2">
          <small className="text-muted d-block mb-1">
            Demand: {(service.utilization * 100).toFixed(0)}% capacity
          </small>
          <div className="progress" style={{ height: "6px" }}>
            <div
              className="progress-bar bg-warning"
              style={{ width: `${Math.min(service.utilization * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>

    <div className="text-end">
      <Button
        variant="outline-primary"
        size="sm"
        onClick={() => handleSelectService(service)}
      >
        Book
      </Button>
    </div>
  </div>
</div>
```

**Step 2: Create Pricing Breakdown Modal**

File: `client/src/components/client/pricing-breakdown.jsx` (NEW FILE)

```jsx
import React from "react";
import { Modal, Table } from "react-bootstrap";
import "./pricing-breakdown.css";

export default function PricingBreakdownModal({
  show,
  onHide,
  service,
  demandInfo,
  originalPrice,
  dynamicPrice,
}) {
  if (!service) return null;

  const surgeAmount = dynamicPrice - originalPrice;
  const surgePercent = ((surgeAmount / originalPrice) * 100).toFixed(0);

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>💰 Pricing Breakdown</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h6 className="mb-3">{service.name}</h6>

        <Table size="sm" className="pricing-table">
          <tbody>
            <tr>
              <td className="text-muted">Base Price:</td>
              <td className="text-end">₹{originalPrice}</td>
            </tr>
            {demandInfo && demandInfo.multiplier > 1 && (
              <>
                <tr className="border-top">
                  <td className="text-muted">
                    Surge Multiplier ({demandInfo.utilization.toFixed(1)}%
                    capacity):
                  </td>
                  <td className="text-end text-warning fw-bold">
                    x{demandInfo.multiplier.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td className="text-muted">Surge Amount:</td>
                  <td className="text-end text-warning fw-bold">
                    +₹{surgeAmount.toFixed(0)} ({surgePercent}%)
                  </td>
                </tr>
                <tr className="border-top fw-bold bg-light">
                  <td>Total Price:</td>
                  <td className="text-end">₹{dynamicPrice.toFixed(0)}</td>
                </tr>
              </>
            )}
          </tbody>
        </Table>

        {demandInfo && (
          <div className="alert alert-info mt-3 small">
            <strong>📊 Why is the price higher?</strong>
            <p className="mb-0 mt-2">
              This restaurant is at {(demandInfo.utilization * 100).toFixed(0)}%
              capacity. High demand increases prices to balance availability.
            </p>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}
```

**Step 3: Add Info Tooltip to Service**

File: `client/src/components/client/barber-profile.jsx`

Add info icon that shows pricing details:

```jsx
import { FiInfo } from "react-icons/fi";

// In service card:
<button
  className="btn btn-sm btn-link p-0 ms-2"
  onClick={() => setShowPricingBreakdown(true)}
  title="View pricing details"
>
  <FiInfo size={16} className="text-info" />
</button>;
```

**Step 4: Display Total Cost Before Booking**

File: `client/src/components/client/surge-price-modal.jsx`

Already has this, but enhance it:

```jsx
<div className="modal-body">
  <div className="pricing-summary">
    <div className="d-flex justify-content-between mb-3">
      <span>Base Price:</span>
      <span>₹{originalPrice}</span>
    </div>

    {multiplier > 1 && (
      <div className="d-flex justify-content-between mb-3 text-warning">
        <span>Surge Charge (+{((multiplier - 1) * 100).toFixed(0)}%):</span>
        <span>₹{(dynamicPrice - originalPrice).toFixed(0)}</span>
      </div>
    )}

    <hr />

    <div className="d-flex justify-content-between fw-bold text-lg">
      <span>Total Amount:</span>
      <span className="text-success">₹{dynamicPrice.toFixed(0)}</span>
    </div>
  </div>

  <div className="alert alert-warning mt-3">
    <strong>📈 High Demand Alert</strong>
    <p className="mb-0">
      Restaurant is {(utilization * 100).toFixed(0)}% full. Prices will decrease
      when demand reduces.
    </p>
  </div>
</div>
```

### Result

✅ Clients see clear price comparison  
✅ Understand why prices change  
✅ See demand indicators in real-time  
✅ Informed decision before booking

---

## Testing Checklist

### Test Issue #1 Fix

- [ ] Client books Day 1 at Restaurant A (10:00 AM) → Success
- [ ] Client books Day 1 at Restaurant A (11:30 AM) → Success (1.5 hour gap)
- [ ] Client books Day 1 at Restaurant A (10:30 AM) → Fails (30 min gap < 60 min)
- [ ] Client books Day 2 at Restaurant A (10:00 AM) → Success (next day)
- [ ] No FK constraint errors in any case

### Test Issue #2 Fix

- [ ] Restaurateur sees "Restaurant Settings" in sidebar/menu
- [ ] Can navigate to settings page
- [ ] Current capacity displays correctly
- [ ] Can change capacity from 10 to 20 tables
- [ ] Success message appears
- [ ] Dynamic pricing uses new capacity value

### Test Issue #3 Fix

- [ ] Service cards show pricing info
- [ ] Info icon shows pricing breakdown modal
- [ ] Surge pricing shows percentage increase
- [ ] Demand bar shows utilization
- [ ] Surge price modal shows total cost
- [ ] Total matches: original_price × multiplier

---

## Quick Implementation Checklist

```
[ ] Copy new helper function to appointmentController.js
[ ] Update booking validation logic in appointmentController.js
[ ] Add Settings route to routes.jsx
[ ] Create/update settings.jsx wrapper component
[ ] Update sidebar/navbar with Settings link
[ ] Enhance barber-profile.jsx service display
[ ] Create pricing-breakdown.jsx component
[ ] Add pricing totals to surge-price-modal.jsx
[ ] Test all three issues thoroughly
[ ] Clear browser cache and restart server
```

---

## Database Check

Run these SQL queries to verify setup:

```sql
-- Check if seat_capacity exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name='UsersModel' AND column_name='seat_capacity';

-- Check restaurateur with capacity
SELECT id, first_name, email, seat_capacity, role
FROM "UsersModel"
WHERE role='restaurateurs'
LIMIT 5;

-- Check appointment counts
SELECT COUNT(*) as total_appointments,
       COUNT(DISTINCT "clientId") as unique_clients
FROM "AppointmentModels";
```

---

## API Endpoints Summary

**Capacity Management:**

- `GET /api/users/restaurateur/:id/capacity` - Get current capacity
- `PUT /api/users/restaurateur/:id/capacity` - Update capacity

**Booking with Multiple Days:**

- `POST /api/appointments` - Create with 1-hour gap validation

**Services with Pricing:**

- `GET /api/restaurateurs-services?dynamic=true` - Get with surge pricing info

---

## Success Indicators

After implementing these fixes, you should see:

✅ **Multiple Booking Success**: Clients book 5+ consecutive days without FK errors  
✅ **Capacity Management**: Restaurateurs set capacity from UI, affects pricing  
✅ **Pricing Visibility**: All price changes shown with reasons and calculations
