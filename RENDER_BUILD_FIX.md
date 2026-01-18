# 🔧 Fix Render.com Build Error

## Problem
Build failing with: `sh: 1: vite: not found`

## Solution Applied

I've updated the build scripts to use `npx vite build` instead of `vite build` to ensure vite is found correctly.

## What Changed

1. **Updated `client/package.json`:**
   - Changed `"build": "vite build"` to `"build": "npx vite build"`

2. **Updated root `package.json`:**
   - Changed build command to explicitly use `npx vite build`

## Next Steps

1. **Commit and push these changes:**
   ```powershell
   cd "C:\Users\Huzaifa Usman\Desktop\Point of sale for Resturant"
   git add .
   git commit -m "Fix vite build command for Render deployment"
   git push origin main
   ```

2. **Render will auto-deploy** (if auto-deploy is enabled) or manually trigger a new deployment

3. **Wait for build to complete** (5-10 minutes)

4. **Your app will be live at:** `https://restaurant-pos.onrender.com`

---

## Alternative: Update Render Build Command

If the above doesn't work, you can also update the build command directly in Render dashboard:

1. Go to your Render dashboard
2. Click on your service
3. Go to "Settings"
4. Update **Build Command** to:
   ```
   npm run install-all && cd client && npx vite build
   ```
5. Save and trigger a new deploy

---

## Verify Build Works Locally

Test the build locally before pushing:

```powershell
cd "C:\Users\Huzaifa Usman\Desktop\Point of sale for Resturant"
npm run build
```

If this works locally, it should work on Render too!
