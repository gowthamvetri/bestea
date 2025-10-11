# CRITICAL: Set Backend Environment Variables in Vercel

## The Problem

Your backend is deployed but **missing environment variables**, causing:
- ❌ 404 errors (routes not working)
- ❌ CORS errors (no Access-Control-Allow-Origin header)
- ❌ Database connection failures

## IMMEDIATE FIX - Set Environment Variables

### Step 1: Go to Vercel Dashboard

1. Open: https://vercel.com/dashboard
2. Find and click your **backend project** (should be named "bestea-backend" or similar)
3. Click **Settings** (top menu)
4. Click **Environment Variables** (left sidebar)

### Step 2: Add These Variables

Click **Add New** for each variable below and set the environment to **Production** and **Preview**:

#### Required Variables:

| Name | Value |
|------|-------|
| `MONGODB_URI` | `mongodb+srv://gowthamvetriii:gowtham@tea.ojbg4hi.mongodb.net/?retryWrites=true&w=majority&appName=tea` |
| `JWT_SECRET` | `your_super_secret_jwt_key_minimum_32_characters_long` |
| `CLIENT_URL` | `https://bestea-hwja.vercel.app` |
| `NODE_ENV` | `production` |
| `CLOUDINARY_CLOUD_NAME` | `dzilrsn1z` |
| `CLOUDINARY_API_KEY` | `373465214492218` |
| `CLOUDINARY_API_SECRET` | `XMxUvssCE1wcbVfFakNefyoLRtQ` |

**Important:** 
- Select **Production** environment for each
- Also select **Preview** if you want staging to work
- Click **Save** after each one

### Step 3: Redeploy Backend

After adding ALL variables:

1. Still in your backend project on Vercel
2. Click **Deployments** (top menu)
3. Find the latest deployment
4. Click the **3 dots** (...) on the right
5. Click **Redeploy**
6. **IMPORTANT:** Uncheck "Use existing Build Cache"
7. Click **Redeploy** button

### Step 4: Wait 2-3 Minutes

Vercel will rebuild and deploy with the environment variables.

### Step 5: Verify It Works

After deployment completes, test these URLs in your browser:

**Test 1 - Health Check:**
```
https://bestea-backend.vercel.app/api/health
```
Should return:
```json
{
  "success": true,
  "message": "BESTEA API is running successfully!",
  "timestamp": "...",
  "environment": "production"
}
```

**Test 2 - Categories:**
```
https://bestea-backend.vercel.app/api/categories
```
Should return JSON array (not 404, not HTML)

**Test 3 - Products:**
```
https://bestea-backend.vercel.app/api/products
```
Should return JSON with products

## Alternative: Use Vercel CLI (If Installed)

If you have Vercel CLI installed:

```powershell
# Install Vercel CLI globally
npm install -g vercel

# Login
vercel login

# Set environment variables (run from backend folder)
cd D:\Projects\bestea\backend

vercel env add MONGODB_URI production
# Paste: mongodb+srv://gowthamvetriii:gowtham@tea.ojbg4hi.mongodb.net/?retryWrites=true&w=majority&appName=tea

vercel env add JWT_SECRET production
# Paste: your_super_secret_jwt_key_minimum_32_characters_long

vercel env add CLIENT_URL production
# Paste: https://bestea-hwja.vercel.app

vercel env add NODE_ENV production
# Paste: production

vercel env add CLOUDINARY_CLOUD_NAME production
# Paste: dzilrsn1z

vercel env add CLOUDINARY_API_KEY production
# Paste: 373465214492218

vercel env add CLOUDINARY_API_SECRET production
# Paste: XMxUvssCE1wcbVfFakNefyoLRtQ

# Then redeploy
vercel --prod
```

## After Environment Variables Are Set

### Frontend Will Work Automatically

Once backend is redeployed with env vars:
- ✅ CORS headers will be sent
- ✅ API endpoints will return JSON
- ✅ Database will be connected
- ✅ Frontend will load data

### Test Frontend

1. Open: https://bestea-hwja.vercel.app
2. Hard refresh: `Ctrl + Shift + R`
3. Open DevTools (F12) → Console
4. Should see NO CORS errors
5. Should see NO 404 errors
6. Categories and products should load

## Common Issues

### Issue: "Still getting 404"

**Cause:** Environment variables not set or deployment cached

**Solution:**
1. Double-check all env vars are added
2. Redeploy WITHOUT cache
3. Wait full 3 minutes
4. Clear browser cache and refresh

### Issue: "Still getting CORS error"

**Cause:** Old deployment still active

**Solution:**
1. Verify `CLIENT_URL=https://bestea-hwja.vercel.app` is set
2. Check deployment logs for errors
3. Redeploy again without cache
4. Test backend API directly first

### Issue: "Internal Server Error"

**Cause:** MongoDB connection failed

**Solution:**
1. Verify `MONGODB_URI` is correct
2. Check MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
3. Check deployment logs for specific error

## Verifying Environment Variables Are Set

In Vercel Dashboard → Backend Project → Settings → Environment Variables:

You should see 7 variables listed:
- ✅ MONGODB_URI
- ✅ JWT_SECRET  
- ✅ CLIENT_URL
- ✅ NODE_ENV
- ✅ CLOUDINARY_CLOUD_NAME
- ✅ CLOUDINARY_API_KEY
- ✅ CLOUDINARY_API_SECRET

## Security Note

⚠️ **IMPORTANT:** These credentials are now in this file. After fixing:

1. Consider rotating JWT_SECRET to a new random string
2. Consider rotating Cloudinary credentials
3. This file is in .gitignore so won't be committed
4. Delete this file after you've set everything in Vercel

## Quick Checklist

- [ ] Open Vercel Dashboard
- [ ] Find backend project
- [ ] Go to Settings → Environment Variables
- [ ] Add all 7 variables listed above
- [ ] Set each to Production environment
- [ ] Save all variables
- [ ] Go to Deployments tab
- [ ] Redeploy latest deployment WITHOUT cache
- [ ] Wait 2-3 minutes
- [ ] Test: https://bestea-backend.vercel.app/api/health
- [ ] Test: https://bestea-backend.vercel.app/api/categories
- [ ] Test frontend: https://bestea-hwja.vercel.app
- [ ] Verify no CORS errors in console
- [ ] Verify categories/products load

---

**Next Step:** Go to Vercel Dashboard NOW and add the environment variables!
