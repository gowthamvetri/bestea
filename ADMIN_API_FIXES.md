# Backend API Field Mismatch Fixes

## Issues
Multiple API endpoints returning 500 Internal Server Error in production:
- Admin Dashboard: `GET /api/admin/dashboard`
- Admin Analytics: `GET /api/admin/analytics`
- Admin Reviews: `GET /api/admin/reviews`
- Categories: `GET /api/categories`
- Products: `GET /api/products`

## Root Cause
Field name mismatches between controller code and actual MongoDB model schemas.

## All Fixes Applied

### 1. Order Model: `totalAmount` → `total`

**File**: `backend/controllers/adminController.js`

#### getDashboardData function (Line 77)
```javascript
// BEFORE: amount: order.totalAmount
// AFTER:  amount: order.total
```

#### getAdminAnalytics function (Lines 385, 403)
```javascript
// BEFORE: totalRevenue: { $sum: '$totalAmount' }
// AFTER:  totalRevenue: { $sum: '$total' }
```

### 2. Review Model: `reports` → `reported`

**Files**: `backend/controllers/adminController.js`, `backend/controllers/reviewController.js`

#### adminController.js - getAdminReviews function (Lines 1137, 1232)
```javascript
// BEFORE: filter['reports.0'] = { $exists: true }
// AFTER:  filter['reported.users.0'] = { $exists: true }

// BEFORE: Review.countDocuments({ 'reports.0': { $exists: true } })
// AFTER:  Review.countDocuments({ 'reported.users.0': { $exists: true } })
```

#### reviewController.js - reportReview function (Lines 276-287)
```javascript
// BEFORE: 
// const existingReport = review.reports.find(...)
// review.reports.push({ user: req.user.id, reason, description })

// AFTER:
// const existingReport = review.reported.users.find(...)
// review.reported.users.push(req.user.id)
// review.reported.count = review.reported.users.length
```

### 3. Category Model: `displayOrder` → `sortOrder`

**File**: `backend/controllers/categoryController.js`

#### getCategories function (Line 9)
```javascript
// BEFORE: .sort({ displayOrder: 1, name: 1 })
// AFTER:  .sort({ sortOrder: 1, name: 1 })
```

### 4. Product Model: `totalSales` → `purchases`

**Files**: `backend/controllers/productController.js`, `backend/controllers/adminController.js`, `backend/controllers/orderController.js`

#### productController.js - getProducts function (Line 70)
```javascript
// BEFORE: sortObj = { totalSales: -1 }
// AFTER:  sortObj = { purchases: -1 }
```

#### productController.js - getBestSellers function (Lines 226, 229)
```javascript
// BEFORE: 
// totalSales: { $gt: 0 }
// .sort({ totalSales: -1 })

// AFTER:
// purchases: { $gt: 0 }
// .sort({ purchases: -1 })
```

#### adminController.js - getDashboardData aggregation (Line 54)
```javascript
// BEFORE: { $sort: { totalSales: -1 } }
// AFTER:  { $sort: { purchases: -1 } }
```

#### adminController.js - topProducts mapping (Lines 84-85)
```javascript
// BEFORE:
// sales: product.totalSales || 0
// revenue: (product.totalSales || 0) * (product.price || 0)

// AFTER:
// sales: product.purchases || 0
// revenue: (product.purchases || 0) * (product.price || 0)
```

#### adminController.js - product listing (Line 599)
```javascript
// BEFORE: sales: product.totalSales || 0
// AFTER:  sales: product.purchases || 0
```

#### orderController.js - createOrder function (Line 63)
```javascript
// BEFORE: product.totalSales = (product.totalSales || 0) + item.quantity
// AFTER:  product.purchases = (product.purchases || 0) + item.quantity
```

#### orderController.js - cancelOrder function (Line 493)
```javascript
// BEFORE: product.totalSales = Math.max((product.totalSales || 0) - item.quantity, 0)
// AFTER:  product.purchases = Math.max((product.purchases || 0) - item.quantity, 0)
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
