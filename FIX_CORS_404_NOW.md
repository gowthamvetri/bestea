# 🔥 URGENT: Fix CORS & 404 Errors - Complete Guide

## Current Problem

Your site https://bestea-hwja.vercel.app is showing:
- ❌ `Access to XMLHttpRequest blocked by CORS policy`
- ❌ `GET https://bestea-backend.vercel.app/api/categories net::ERR_FAILED 404`
- ❌ No products or categories loading

## Root Cause

Your **backend is deployed WITHOUT environment variables**. Vercel doesn't read `.env` files automatically.

## 🎯 THE FIX (15 Minutes)

### Part 1: Set Environment Variables in Vercel

#### 1. Open Vercel Dashboard
- Go to: https://vercel.com/dashboard
- Find your **backend project** (bestea-backend or similar)
- Click on it

#### 2. Navigate to Environment Variables
- Click **Settings** (top menu)
- Click **Environment Variables** (left menu)

#### 3. Add These 7 Variables

Click "Add New" for each:

**Variable 1:**
- Name: `MONGODB_URI`
- Value: `mongodb+srv://gowthamvetriii:gowtham@tea.ojbg4hi.mongodb.net/?retryWrites=true&w=majority&appName=tea`
- Environment: ✅ Production

**Variable 2:**
- Name: `JWT_SECRET`
- Value: `your_super_secret_jwt_key_minimum_32_characters_long`
- Environment: ✅ Production

**Variable 3:**
- Name: `CLIENT_URL`
- Value: `https://bestea-hwja.vercel.app`
- Environment: ✅ Production

**Variable 4:**
- Name: `NODE_ENV`
- Value: `production`
- Environment: ✅ Production

**Variable 5:**
- Name: `CLOUDINARY_CLOUD_NAME`
- Value: `dzilrsn1z`
- Environment: ✅ Production

**Variable 6:**
- Name: `CLOUDINARY_API_KEY`
- Value: `373465214492218`
- Environment: ✅ Production

**Variable 7:**
- Name: `CLOUDINARY_API_SECRET`
- Value: `XMxUvssCE1wcbVfFakNefyoLRtQ`
- Environment: ✅ Production

### Part 2: Redeploy Backend

1. Click **Deployments** (top menu)
2. Find latest deployment
3. Click **⋯** (three dots) → **Redeploy**
4. **UNCHECK** "Use existing Build Cache"
5. Click **Redeploy**
6. **Wait 2-3 minutes** for "Ready" status

### Part 3: Verify

Test these URLs in browser:

✅ **Health Check:**
```
https://bestea-backend.vercel.app/api/health
```
Should see: `{"success": true, ...}`

✅ **Categories:**
```
https://bestea-backend.vercel.app/api/categories
```
Should see: `[{...}, {...}]` (JSON array)

✅ **Products:**
```
https://bestea-backend.vercel.app/api/products
```
Should see: `{"products": [...], ...}`

### Part 4: Test Frontend

1. Open: https://bestea-hwja.vercel.app
2. Press: `Ctrl + Shift + R` (hard refresh)
3. Press: `F12` (DevTools)
4. Check Console tab
5. Should see **NO errors**
6. Products/categories should load

## Alternative: Use Script

I created `backend/setup-env-vars.bat` for you. Run it to see all values in a window for easy copying.

## If Backend Project Doesn't Exist

Deploy it first:

```powershell
# Install Vercel CLI
npm install -g vercel

# Deploy backend
cd D:\Projects\bestea\backend
vercel login
vercel --prod
```

Then add environment variables as described above.

## Success Checklist

- [ ] Opened Vercel Dashboard
- [ ] Found backend project
- [ ] Added all 7 environment variables
- [ ] Redeployed without cache
- [ ] Waited for "Ready" status
- [ ] Tested /api/health - returns JSON ✅
- [ ] Tested /api/categories - returns JSON array ✅
- [ ] Tested frontend - NO CORS errors ✅
- [ ] Frontend loads products/categories ✅

## Still Not Working?

Share these with me:
1. Screenshot of Vercel environment variables page
2. Screenshot of latest deployment status
3. Result from testing: https://bestea-backend.vercel.app/api/health
4. Console errors from frontend

---

**NEXT STEP:** Go to Vercel Dashboard RIGHT NOW and add those 7 environment variables!

The code is perfect. The deployment just needs the environment variables configured.
