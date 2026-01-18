# 🔧 Fix: ERR_CONNECTION_REFUSED Error

## Problem
```
Failed to load resource: net::ERR_CONNECTION_REFUSED
localhost:5000/api/settings
localhost:5000/api/products
localhost:5000/api/categories
```

## Root Cause
The frontend was hardcoded to use `localhost:5000` for API calls and image URLs, which doesn't work in production. In production, the frontend and backend are served from the same domain.

## Solution Applied

### 1. Fixed API Base URL (`client/src/api/api.js`)
- **Before:** Always used `http://localhost:5000/api`
- **After:** Uses `/api` (relative URL) in production, `http://localhost:5000/api` in development

### 2. Fixed Image URLs
- Created helper function `getImageURL()` in `client/src/utils/api.js`
- Replaced all hardcoded `localhost:5000` image URLs with the helper function
- Now uses relative URLs in production

### 3. Files Updated:
- ✅ `client/src/api/api.js` - API base URL
- ✅ `client/src/utils/api.js` - Helper function for image URLs (new file)
- ✅ `client/src/pages/Settings.jsx` - Logo URLs
- ✅ `client/src/components/Header.jsx` - Logo URL
- ✅ `client/src/components/LoadingScreen.jsx` - Logo URL
- ✅ `client/src/pages/Inventory.jsx` - Product image URLs
- ✅ `client/src/pages/Billing.jsx` - Product image URLs
- ✅ `client/src/components/ReceiptPrint.jsx` - Logo URL

## Next Steps

1. **Commit and push these changes:**
   ```powershell
   cd "C:\Users\Huzaifa Usman\Desktop\Point of sale for Resturant"
   git add .
   git commit -m "Fix: Use relative URLs in production to fix connection errors"
   git push origin main
   ```

2. **Render will auto-deploy** and the errors should be fixed!

## How It Works Now

### Development (Local):
- API URL: `http://localhost:5000/api`
- Image URLs: `http://localhost:5000/uploads/...`

### Production (Render):
- API URL: `/api` (relative - uses same domain)
- Image URLs: `/uploads/...` (relative - uses same domain)

## Testing

After deployment:
1. Check your live website
2. Open browser console (F12)
3. You should **NOT** see `ERR_CONNECTION_REFUSED` errors
4. API calls should work
5. Images should load correctly

---

🎉 **The connection errors should be fixed after deployment!** 🎉
