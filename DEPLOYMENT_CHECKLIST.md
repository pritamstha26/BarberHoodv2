# Deployment Checklist - Dynamic Pricing System

## Pre-Deployment Review

### Code Quality

- [ ] All files created without errors
- [ ] No syntax errors detected
- [ ] Import statements all correct
- [ ] Unused variables removed
- [ ] Comments are clear and useful
- [ ] Function signatures documented
- [ ] Error handling implemented
- [ ] Edge cases covered

### File Inventory

#### Backend Files (Created/Modified)

- [x] `server/utils/dynamicPricing.js` - NEW: Pricing algorithm utility
- [x] `server/utils/tableCapacity.js` - NEW: Capacity management utility
- [x] `server/controllers/barberServiceController.js` - MODIFIED: Added dynamic pricing integration
- [x] `server/controllers/appointmentController.js` - MODIFIED: Added 24-hour validation
- [x] `server/controllers/clientController.js` - MODIFIED: Added capacity endpoints
- [x] `server/routes/userRoutes.js` - MODIFIED: Added capacity routes

#### Frontend Files (Created/Modified)

- [x] `client/src/components/client/restaurant-settings.jsx` - NEW: Settings component
- [x] `client/src/components/client/surge-price-modal.jsx` - NEW: Confirmation modal
- [x] `client/src/components/client/surge-price-modal.css` - NEW: Modal styles
- [x] `client/src/components/client/settings.css` - NEW: Settings styles
- [x] `client/src/components/client/barber-profile.jsx` - MODIFIED: Booking flow integration

#### Documentation Files

- [x] `DYNAMIC_PRICING_GUIDE.md` - Complete implementation guide
- [x] `QUICK_REFERENCE.md` - Quick setup and reference
- [x] `IMPLEMENTATION_SUMMARY.md` - Architecture overview
- [x] `MIGRATION_GUIDE.md` - Database migration steps
- [x] `DEPLOYMENT_CHECKLIST.md` - This file

---

## Phase 1: Database Preparation

### 1.1 Backup

- [ ] **Production Backup**
  ```bash
  pg_dump -U postgres restaurant_db \
    | gzip > backup_pre_dynamic_pricing_$(date +%Y%m%d_%H%M%S).sql.gz
  ```
- [ ] **Verify backup size** (should be > 1MB)
- [ ] **Store backup securely** (S3, external drive, etc.)
- [ ] **Test restore procedure** (in staging)

### 1.2 Migration

- [ ] **Create migration file**: `server/migrations/[timestamp]-add-seat-capacity.js`
- [ ] **Run migration**: `npx sequelize-cli db:migrate`
- [ ] **Verify column exists**:
  ```sql
  SELECT column_name FROM information_schema.columns
  WHERE table_name = 'Users' AND column_name = 'seat_capacity';
  ```
- [ ] **Check default value**: All users should have `seat_capacity = 10`
- [ ] **Verify index created**: `idx_users_seat_capacity`

### 1.3 Data Validation

- [ ] **All users have capacity**
  ```sql
  SELECT COUNT(*) FROM "Users" WHERE seat_capacity IS NULL;
  -- Should return: 0
  ```
- [ ] **No negative values**:
  ```sql
  SELECT COUNT(*) FROM "Users" WHERE seat_capacity < 1;
  -- Should return: 0
  ```

---

## Phase 2: Backend Deployment

### 2.1 Code Deployment

- [ ] **Copy utility files**
  - `server/utils/dynamicPricing.js`
  - `server/utils/tableCapacity.js`

- [ ] **Update controller files**
  - `server/controllers/barberServiceController.js`
  - `server/controllers/appointmentController.js`
  - `server/controllers/clientController.js`

- [ ] **Update route files**
  - `server/routes/userRoutes.js`

- [ ] **Verify imports** in all files

### 2.2 Build & Test

- [ ] **Install dependencies** (if new packages added)
  ```bash
  cd server && npm install
  ```
- [ ] **Check for build errors**
  ```bash
  npm run build  # if applicable
  ```
- [ ] **Run linter** (if configured)
  ```bash
  npm run lint
  ```
- [ ] **Run existing tests**
  ```bash
  npm test
  ```

### 2.3 Local Testing

- [ ] **Start API server**: `npm start`
- [ ] **Test new endpoints**

  ```bash
  # Get capacity
  curl http://localhost:5000/users/restaurateur/[ID]/capacity

  # Update capacity
  curl -X PUT http://localhost:5000/users/restaurateur/[ID]/capacity \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer [TOKEN]" \
    -d '{"seat_capacity": 20}'

  # Get services with pricing
  curl "http://localhost:5000/restaurateurs-services/all?dynamic=true&restaurateurId=[ID]"
  ```

- [ ] **Check response format** includes new fields
- [ ] **Verify error handling** for invalid inputs
- [ ] **Test authentication** on protected endpoints

---

## Phase 3: Frontend Deployment

### 3.1 Code Deployment

- [ ] **Copy component files**
  - `client/src/components/client/restaurant-settings.jsx`
  - `client/src/components/client/surge-price-modal.jsx`

- [ ] **Copy style files**
  - `client/src/components/client/surge-price-modal.css`
  - `client/src/components/client/settings.css`

- [ ] **Update component**
  - `client/src/components/client/barber-profile.jsx`

- [ ] **Verify imports** in all files

### 3.2 Build & Bundle

- [ ] **Install dependencies** (if new packages added)
  ```bash
  cd client && npm install
  ```
- [ ] **Build for production**
  ```bash
  npm run build
  ```
- [ ] **Check for build warnings**
- [ ] **Verify build size** (should not increase significantly)

### 3.3 Local Testing

- [ ] **Start dev server**: `npm run dev`
- [ ] **Test restaurant settings component**
  - Can restaurateurs set capacity?
  - Validation works for invalid inputs?
  - Success/error messages display?

- [ ] **Test surge price modal**
  - Appears only when multiplier > 1.0?
  - Price comparison is correct?
  - Confirm/Cancel buttons work?

- [ ] **Test booking flow**
  - Can book without surge (multiplier = 1.0)?
  - Modal shows for surge pricing (multiplier > 1.0)?
  - Can confirm surge booking?
  - Can cancel and return to form?

- [ ] **Test responsive design**
  - Mobile views
  - Tablet views
  - Desktop views

---

## Phase 4: Integration Testing

### 4.1 End-to-End Flow

- [ ] **Create test restaurant**
  1. User signs up as restaurateur
  2. Set seat_capacity to 5
  3. Add 3 services
  4. Verify services show in API

- [ ] **Test pricing progression**
  1. Book 1 appointment (20% utilization, no surge)
  2. Book 2 appointments (40% utilization, no surge)
  3. Book 3 appointments (60% utilization, SURGE starts)
  4. Verify multiplier increases
  5. Verify dynamic_price > original_price

- [ ] **Test surge modal flow**
  1. Load restaurant with 3/5 capacity
  2. Select service to book
  3. Modal should appear
  4. Confirm booking at surge price
  5. Verify appointment created

- [ ] **Test capacity update**
  1. Update capacity from 5 to 10
  2. Refresh service list
  3. Pricing should recalculate
  4. Multiplier should be lower

### 4.2 Error Scenarios

- [ ] **Invalid capacity values**
  - Set to 0 → Error shown
  - Set to 1001 → Error shown
  - Set to non-integer → Error shown

- [ ] **Authentication errors**
  - No token → 401 error
  - Wrong user → 403 error
  - Expired token → 401 error

- [ ] **24-hour booking gap**
  - Client books appointment A (tomorrow 2 PM)
  - Try to book appointment B (tomorrow 3 PM)
  - Should get error
  - Try again next day → Should succeed

---

## Phase 5: Staging Environment

### 5.1 Deploy to Staging

- [ ] **Backup staging database**
- [ ] **Deploy backend code**
- [ ] **Deploy frontend code**
- [ ] **Run migrations on staging**
- [ ] **Verify endpoints responding**

### 5.2 Staging Testing

- [ ] **Repeat all integration tests**
- [ ] **Performance test**
  - Load test with 100+ concurrent requests
  - Monitor response times
  - Monitor database CPU/memory
  - Check for bottlenecks

- [ ] **Browser compatibility**
  - Chrome (latest)
  - Firefox (latest)
  - Safari (latest)
  - Edge (latest)

- [ ] **Accessibility testing**
  - Keyboard navigation
  - Screen reader compatibility
  - Color contrast

### 5.3 Staging Sign-Off

- [ ] **Team review completed**
- [ ] **QA approved**
- [ ] **Product owner sign-off**
- [ ] **Security review done**

---

## Phase 6: Production Deployment

### 6.1 Pre-Deployment Communication

- [ ] **Notify users** about maintenance window
- [ ] **Alert support team**
- [ ] **Prepare rollback plan**
- [ ] **Have backup ready**

### 6.2 Deployment Steps

1. [ ] **Schedule maintenance window** (low-traffic time)
2. [ ] **Stop API servers** (if needed for migration)
3. [ ] **Create database backup**
4. [ ] **Run migration**
   ```bash
   npx sequelize-cli db:migrate --env production
   ```
5. [ ] **Deploy backend code**
6. [ ] **Deploy frontend code**
7. [ ] **Clear CDN cache** (if applicable)
8. [ ] **Restart API servers**
9. [ ] **Verify endpoints responding**

### 6.3 Post-Deployment Verification

- [ ] **Health checks pass**
  - API responding
  - Database accessible
  - No error logs

- [ ] **Basic functionality**
  - Can log in
  - Can view services
  - Can book appointment
  - Can update capacity

- [ ] **New features work**
  - Surge modal appears correctly
  - Capacity endpoint responds
  - Dynamic pricing calculated
  - 24-hour gap enforced

- [ ] **Performance acceptable**
  - API response times < 500ms
  - No database timeouts
  - No memory leaks

### 6.4 Monitoring

- [ ] **Error rate** stays low (< 0.1%)
- [ ] **Response times** stable
- [ ] **Database load** normal
- [ ] **User reports** no issues

---

## Phase 7: Post-Deployment

### 7.1 Communication

- [ ] **Announce feature** to users
- [ ] **Send tutorial** to restaurateurs
- [ ] **Update FAQ** with pricing info
- [ ] **Monitor feedback** channels

### 7.2 Documentation

- [ ] **Update API docs**
- [ ] **Update user guides**
- [ ] **Update deployment guide**
- [ ] **Add release notes**

### 7.3 Monitoring (Week 1)

- [ ] **Daily check** error logs
- [ ] **Monitor performance metrics**
- [ ] **Track user adoption** of features
- [ ] **Collect feedback** from users

### 7.4 Monitoring (Ongoing)

- [ ] **Set up alerts** for errors
- [ ] **Weekly review** of metrics
- [ ] **Monthly capacity** review
- [ ] **Quarterly optimization** review

---

## Rollback Plan

### If Critical Issue Found

#### Immediate Actions

1. [ ] **Stop accepting new bookings** (optional, emergency only)
2. [ ] **Alert team** immediately
3. [ ] **Isolate issue**
4. [ ] **Decide: Fix or Rollback**

#### Rollback Steps

1. [ ] **Restore from backup**

   ```bash
   # Stop API server first

   # Restore database
   psql -U postgres restaurant_db < backup_pre_dynamic_pricing_*.sql.gz
   ```

2. [ ] **Revert code**

   ```bash
   git revert [commit-hash]
   npm run build
   npm start
   ```

3. [ ] **Verify system** working
4. [ ] **Communicate** with users
5. [ ] **Root cause analysis**

#### Post-Rollback

- [ ] **Investigate issue**
- [ ] **Fix problem**
- [ ] **Test thoroughly**
- [ ] **Schedule re-deployment**

---

## Success Criteria

### Deployment Successful If

- [ ] No critical errors in logs
- [ ] All endpoints responding (< 500ms)
- [ ] Database performing normally
- [ ] Users can complete bookings
- [ ] Surge pricing working correctly
- [ ] No support tickets about outage
- [ ] Performance metrics acceptable
- [ ] Error rate < 0.1%

### When to Consider Issue

- [ ] Error rate > 1%
- [ ] Response time > 2 seconds
- [ ] Database connection issues
- [ ] Data corruption detected
- [ ] Users cannot complete bookings
- [ ] API crashes frequently

---

## Sign-Off

### Required Approvals

- [ ] **Tech Lead**: Code quality & architecture
- [ ] **QA Lead**: Testing completed
- [ ] **DevOps Lead**: Infrastructure ready
- [ ] **Product Manager**: Feature verified
- [ ] **Security Team**: No vulnerabilities

### Sign-Off Signature

```
Tech Lead: _________________ Date: _______
QA Lead: _________________ Date: _______
DevOps Lead: _________________ Date: _______
Product Manager: _________________ Date: _______
```

---

## Contact & Support

### During Deployment

- **Tech Lead**: [contact info]
- **On-Call DevOps**: [contact info]
- **Database Admin**: [contact info]

### Documentation

- Architecture: `IMPLEMENTATION_SUMMARY.md`
- Quick Start: `QUICK_REFERENCE.md`
- Database: `MIGRATION_GUIDE.md`
- Detailed Guide: `DYNAMIC_PRICING_GUIDE.md`

---

## Timeline Estimate

### Development → Production: ~3 weeks

| Phase            | Duration  | Status       |
| ---------------- | --------- | ------------ |
| Code Review      | 2-3 days  | ✅ Ready     |
| Staging Testing  | 2-3 days  | ⏳ Scheduled |
| Performance Test | 1-2 days  | ⏳ Scheduled |
| Security Review  | 1-2 days  | ⏳ Scheduled |
| Deployment       | 1-2 hours | ⏳ Scheduled |
| Monitoring       | 1 week    | ⏳ Ongoing   |

---

## Final Checklist Before Going Live

```
Code Quality:
  ☐ All linting passed
  ☐ No console errors
  ☐ All imports correct

Testing:
  ☐ Unit tests pass
  ☐ Integration tests pass
  ☐ E2E tests pass
  ☐ Performance tests pass

Database:
  ☐ Migration created
  ☐ Backup taken
  ☐ Data validated

Documentation:
  ☐ API docs updated
  ☐ README updated
  ☐ Guides complete

Team:
  ☐ All approvals obtained
  ☐ Support trained
  ☐ Communication ready

Monitoring:
  ☐ Alerts configured
  ☐ Dashboards ready
  ☐ Rollback plan ready
```

✅ **Ready for Production Deployment**

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Status:** Ready for Implementation  
**Contact:** [Your Name/Team]
