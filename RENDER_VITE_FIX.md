# 🔧 Fix: Vite Not Found in Render Build

## Problem
Build failing with: `Cannot find package 'vite'` when loading vite.config.js

## Root Cause
When `NODE_ENV=production` is set, `npm install` skips devDependencies. But we need `vite` (which is in devDependencies) for the build.

## Solution Applied

1. **Updated `package.json` install-all script:**
   - Changed to: `npm install --include=dev && cd client && npm install --include=dev`
   - This explicitly installs devDependencies even when NODE_ENV=production

2. **Updated postinstall script:**
   - Changed to: `cd client && npm install --include=dev`
   - Ensures devDependencies are installed

## Next Steps

1. **Commit and push these changes:**
   ```powershell
   git add .
   git commit -m "Fix: Install devDependencies for Render build"
   git push origin main
   ```

2. **Render will auto-deploy** and the build should succeed!

---

## Why This Works

- `--include=dev` flag tells npm to install devDependencies regardless of NODE_ENV
- This ensures vite and other build tools are available during the build phase
- NODE_ENV=production is still used at runtime (after build) which is correct

---

## Verify Locally

You can test this works locally:

```powershell
# Set NODE_ENV to production (simulating Render)
$env:NODE_ENV="production"

# Run install
npm run install-all

# Check if vite is installed
cd client
ls node_modules | Select-String "vite"

# Build should work now
npm run build
```
