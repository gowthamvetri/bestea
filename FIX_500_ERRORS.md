# 🚨 URGENT: Fix 500 Internal Server Errors

## Current Problem
✅ Frontend is connecting to backend correctly
❌ Backend returning 500 errors due to missing environment variables

## Your Console Errors:
```
GET https://bestea.vercel.app/api/categories 500 (Internal Server Error)
GET https://bestea.vercel.app/api/products/featured 500 (Internal Server Error)  
GET https://bestea.vercel.app/api/reviews/featured-testimonials 500 (Internal Server Error)
```

## Root Cause
Backend can't connect to MongoDB because `MONGODB_URI` is not set in Vercel.

## 🎯 IMMEDIATE FIX (5 minutes)

### Step 1: Open Vercel Dashboard
1. Go to: **https://vercel.com/dashboard**
2. Find and click: **"bestea"** (your backend project)

### Step 2: Add Environment Variables
1. Click: **Settings** (top menu)
2. Click: **Environment Variables** (left sidebar)
3. For EACH variable below, click **"Add New"**:

#### Variable 1:
- **Name:** `MONGODB_URI`
- **Value:** `mongodb+srv://gowthamvetriii:gowtham@tea.ojbg4hi.mongodb.net/?retryWrites=true&w=majority&appName=tea`
- **Environment:** ✅ Production

#### Variable 2:
- **Name:** `JWT_SECRET`
- **Value:** `your_super_secret_jwt_key_minimum_32_characters_long`
- **Environment:** ✅ Production

#### Variable 3:
- **Name:** `CLIENT_URL`
- **Value:** `https://bestea-hwja.vercel.app`
- **Environment:** ✅ Production

#### Variable 4:
- **Name:** `NODE_ENV`
- **Value:** `production`
- **Environment:** ✅ Production

#### Variable 5:
- **Name:** `CLOUDINARY_CLOUD_NAME`
- **Value:** `dzilrsn1z`
- **Environment:** ✅ Production

#### Variable 6:
- **Name:** `CLOUDINARY_API_KEY`
- **Value:** `373465214492218`
- **Environment:** ✅ Production

#### Variable 7:
- **Name:** `CLOUDINARY_API_SECRET`
- **Value:** `XMxUvssCE1wcbVfFakNefyoLRtQ`
- **Environment:** ✅ Production

### Step 3: Redeploy Backend
1. Click: **Deployments** (top menu)
2. Find latest deployment (at top)
3. Click: **⋯** (three dots) → **Redeploy**
4. **UNCHECK:** "Use existing Build Cache" ❌
5. Click: **Redeploy**
6. **Wait 2-3 minutes** for "Ready" status

### Step 4: Verify Fix
Open these URLs and verify they return JSON (not 500 errors):

✅ **Categories:**
```
https://bestea.vercel.app/api/categories
```

✅ **Featured Products:**
```
https://bestea.vercel.app/api/products/featured
```

✅ **Reviews:**
```
https://bestea.vercel.app/api/reviews/featured-testimonials
```

### Step 5: Test Frontend
1. Open: **https://bestea-hwja.vercel.app/**
2. Press: **Ctrl + Shift + R** (hard refresh)
3. Check console - should see **NO 500 errors**
4. Should see products and categories loading

## Visual Guide

```
Vercel Dashboard
└─ bestea (click this)
   └─ Settings (top menu)
      └─ Environment Variables (left menu)
         └─ Add New (button)
            ├─ Name: MONGODB_URI
            ├─ Value: mongodb+srv://...
            ├─ Environment: ✅ Production
            └─ Save
```

## Quick Test Command

After adding variables and redeploying, test:

```powershell
curl https://bestea.vercel.app/api/categories
```

Should return JSON array, not 500 error.

## Why This Fixes It

Currently:
- Backend tries to connect to `process.env.MONGODB_URI`
- Variable doesn't exist → Database connection fails
- API endpoints can't access data → 500 error

After fix:
- Backend connects to MongoDB successfully
- API endpoints return real data
- Frontend loads categories/products
- No more 500 errors

## Expected Timeline

- Add variables: **3 minutes**
- Redeploy backend: **2 minutes**
- Test and verify: **1 minute**
- **Total: 6 minutes**

## Success Indicators

✅ Backend APIs return JSON (not 500)
✅ Frontend console shows no errors
✅ Categories display on homepage
✅ Products load correctly
✅ No "Internal Server Error" messages

---

## 🎯 DO THIS NOW:

1. **Open:** https://vercel.com/dashboard
2. **Click:** bestea project
3. **Add:** All 7 environment variables
4. **Redeploy:** Without cache
5. **Test:** Categories endpoint
6. **Verify:** Frontend works

**The 500 errors will disappear once you add the environment variables!**

Your code is perfect - just needs the database connection configured in Vercel.