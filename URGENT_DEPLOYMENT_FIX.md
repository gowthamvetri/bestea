# 🚨 IMMEDIATE ACTION REQUIRED - API Deployment Fix

## Problem Summary
Your production site is returning **HTML instead of JSON** because:
- Frontend at `https://bestea-hwja.vercel.app` 
- Backend URL is **UNKNOWN** (need to find it!)
- Frontend `.env.production` had wrong API URL

## ✅ What I Fixed

1. **manifest.json** - Changed favicon.svg → favicon.ico ✅
2. **frontend/vercel.json** - Fixed routing configuration ✅
3. **backend/index.js** - Added frontend URL to CORS ✅
4. **frontend/.env.production** - Set placeholder backend URL ⚠️

## 🔴 CRITICAL: What YOU Need to Do

### Step 1: Find Your Backend Vercel URL

**Option A: Check Vercel Dashboard**
1. Go to https://vercel.com/dashboard
2. Look for your backend project (might be named "bestea-backend" or "bestea-api")
3. Copy the deployment URL (e.g., `https://bestea-backend.vercel.app`)

**Option B: Deploy Backend Now (If Not Deployed)**
```powershell
cd D:\Projects\bestea\backend
vercel
```
Follow prompts and copy the URL it gives you.

### Step 2: Update Frontend Environment Variable

Edit `frontend/.env.production` and replace the placeholder:

```bash
# REPLACE THIS with your actual backend URL
VITE_API_URL=https://YOUR-ACTUAL-BACKEND-URL.vercel.app/api
```

**Example:**
```bash
VITE_API_URL=https://bestea-backend-abc123.vercel.app/api
```

### Step 3: Set Backend Environment Variables

In Vercel Dashboard → Your Backend Project → Settings → Environment Variables:

Add these:
```
CLIENT_URL=https://bestea-hwja.vercel.app
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
CLOUDINARY_CLOUD_NAME=<if using cloudinary>
CLOUDINARY_API_KEY=<if using cloudinary>
CLOUDINARY_API_SECRET=<if using cloudinary>
```

### Step 4: Commit and Deploy

```powershell
# From project root
git add .
git commit -m "Fix API routing and CORS configuration"
git push

# If Vercel doesn't auto-deploy, manually deploy:
cd frontend
vercel --prod

cd ../backend  
vercel --prod
```

### Step 5: Verify It Works

1. **Open browser to:** https://bestea-hwja.vercel.app
2. **Open DevTools** (F12) → Network tab
3. **Refresh page**
4. **Look for API calls** like:
   - `/api/categories`
   - `/api/products/bestsellers`
   - `/api/products/featured`

5. **Click on each request** and verify:
   - ✅ Response is **JSON** (not HTML)
   - ✅ Status is **200 OK**
   - ✅ URL goes to your backend domain

## Alternative: Monorepo Deployment (Recommended)

If you want ONE deployment instead of two:

### 1. Create `vercel.json` in PROJECT ROOT

```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/dist/$1"
    }
  ]
}
```

### 2. Update `frontend/.env.production`

```bash
VITE_API_URL=/api
```

### 3. Deploy from Root

```powershell
# From D:\Projects\bestea
vercel --prod
```

This will deploy BOTH frontend and backend to the same domain!

## Quick Checklist

- [ ] Find backend Vercel URL (or deploy it)
- [ ] Update `frontend/.env.production` with real backend URL  
- [ ] Add environment variables to backend Vercel project
- [ ] Commit changes
- [ ] Push to GitHub (or manually deploy with `vercel --prod`)
- [ ] Test site - verify API returns JSON not HTML
- [ ] Check browser console for errors

## Expected Result

**Before Fix:**
```
Categories API Response: <!DOCTYPE html>...
```

**After Fix:**
```json
[
  {
    "_id": "...",
    "name": "Strong Tea",
    "slug": "strong-tea",
    ...
  }
]
```

## Need Help?

If you're stuck, tell me:
1. Your backend Vercel URL (or if you haven't deployed it)
2. Whether you want separate deployments or monorepo
3. Any error messages you see

I can then give you exact commands to run!
