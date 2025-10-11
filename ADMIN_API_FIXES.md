# Admin Dashboard API Fixes

## Issue
Admin dashboard endpoints returning 500 Internal Server Error in production:
- `GET /api/admin/dashboard`
- `GET /api/admin/analytics`
- `GET /api/admin/reviews`

## Root Cause
Field name mismatches between controller aggregations and actual MongoDB model schemas.

## Fixes Applied

### 1. Order Model Field Mismatch (`totalAmount` → `total`)

**File**: `backend/controllers/adminController.js`

#### Fix 1: getDashboardData function (Line 77)
```javascript
// BEFORE
amount: order.totalAmount

// AFTER
amount: order.total
```

#### Fix 2: getAdminAnalytics function (Line 385)
```javascript
// BEFORE
totalRevenue: { $sum: '$totalAmount' }

// AFTER
totalRevenue: { $sum: '$total' }
```

#### Fix 3: getAdminAnalytics function (Line 403)
```javascript
// BEFORE
totalRevenue: { $sum: '$totalAmount' }

// AFTER
totalRevenue: { $sum: '$total' }
```

**Reason**: Order model schema uses `total` field, not `totalAmount`:
```javascript
// backend/models/Order.js
{
  subtotal: Number,
  shippingCharges: Number,
  tax: Number,
  total: Number  // ← Correct field name
}
```

### 2. Review Model Field Mismatch (`reports` → `reported`)

**File**: `backend/controllers/adminController.js`

#### Fix 4: getAdminReviews function (Line 1137)
```javascript
// BEFORE
filter['reports.0'] = { $exists: true }

// AFTER
filter['reported.users.0'] = { $exists: true }
```

#### Fix 5: getAdminReviews statistics (Line 1232)
```javascript
// BEFORE
Review.countDocuments({ 'reports.0': { $exists: true } })

// AFTER
Review.countDocuments({ 'reported.users.0': { $exists: true } })
```

**Reason**: Review model schema uses `reported` field structure, not `reports`:
```javascript
// backend/models/Review.js
{
  reported: {
    count: Number,
    users: [ObjectId]  // ← Correct field structure
  }
}
```

## Model Schemas Reference

### Order Model
```javascript
{
  orderNumber: String,
  user: ObjectId,
  items: [{
    product: ObjectId,
    name: String,
    quantity: Number,
    price: Number
  }],
  subtotal: Number,
  shippingCharges: Number,
  tax: Number,
  total: Number,  // ← Use this field
  status: String,
  shippingAddress: Object
}
```

### Review Model
```javascript
{
  product: ObjectId,
  user: ObjectId,
  order: ObjectId,
  rating: Number,
  title: String,
  comment: String,
  reported: {  // ← Use this field
    count: Number,
    users: [ObjectId]
  },
  helpful: {
    count: Number,
    users: [ObjectId]
  },
  isFeatured: Boolean,
  status: String
}
```

## Testing Checklist
- [ ] Deploy changes to Vercel
- [ ] Test `/api/admin/dashboard` endpoint
- [ ] Test `/api/admin/analytics` endpoint
- [ ] Test `/api/admin/reviews` endpoint
- [ ] Verify all aggregations return correct data
- [ ] Check production logs for any remaining errors

## Prevention
To prevent similar issues in the future:
1. Add TypeScript for type safety
2. Create unit tests for all admin endpoints
3. Add schema validation middleware
4. Document all model schemas in a central location
5. Use constants for field names instead of magic strings
