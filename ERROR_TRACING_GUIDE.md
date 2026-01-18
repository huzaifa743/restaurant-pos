# 🔍 How to Trace Errors - Complete Guide

## 📋 Overview

This guide shows you how to find and fix errors in your application, both locally and on the live Render deployment.

---

## 🚀 Quick Error Tracing Steps

### 1. **Check Render Logs** (For Live Website)
### 2. **Check Browser Console** (Frontend Errors)
### 3. **Check Local Server Logs** (Local Development)
### 4. **Check Build Logs** (Deployment Errors)

---

## 1️⃣ Check Render Logs (Live Website Errors)

### Step-by-Step:

1. **Go to Render Dashboard:**
   - Visit: https://dashboard.render.com
   - Sign in with your account

2. **Select Your Service:**
   - Click on `restaurant-pos` (your service name)

3. **View Logs:**
   - Click on **"Logs"** tab at the top
   - Or click **"Events"** tab to see deployment events

4. **What to Look For:**
   - ❌ Error messages (red text)
   - ⚠️ Warning messages (yellow text)
   - 🔴 Stack traces (detailed error information)
   - 📝 Server errors (500, 404, etc.)

### Example Error Patterns:

```
❌ Error: SQLITE_ERROR: no such table: users
❌ TypeError: Cannot read property 'map' of undefined
❌ Error: Cannot find module 'express'
❌ PORT already in use
```

### Live Tail (Real-time Logs):

1. In Render Dashboard → Your Service
2. Click **"Logs"** tab
3. Enable **"Live Tail"** toggle (if available)
4. See errors in real-time!

---

## 2️⃣ Check Browser Console (Frontend Errors)

### How to Open Browser Console:

**Chrome/Edge:**
- Press `F12` or `Ctrl + Shift + I`
- Or Right-click → "Inspect" → "Console" tab

**Firefox:**
- Press `F12` or `Ctrl + Shift + K`
- Or Right-click → "Inspect Element" → "Console" tab

### What to Look For:

1. **Red Error Messages:**
   ```
   ❌ Uncaught TypeError: Cannot read property 'x' of undefined
   ❌ Failed to fetch
   ❌ 404 Not Found
   ❌ CORS error
   ```

2. **Network Errors:**
   - Open **"Network"** tab
   - Look for red/failed requests
   - Check status codes (404, 500, etc.)
   - Check request/response data

3. **JavaScript Errors:**
   - Click on the error to see the stack trace
   - Check which file and line number
   - See the full error details

### Common Frontend Errors:

```
❌ Uncaught TypeError: Cannot read property 'map' of undefined
   → Usually means trying to use .map() on undefined/null

❌ Failed to fetch
   → Usually means API call failed (check server logs)

❌ 404 Not Found
   → File/route doesn't exist

❌ CORS policy error
   → Server CORS configuration issue
```

---

## 3️⃣ Check Local Server Logs (Development)

### Run Development Server:

```powershell
# Navigate to project
cd "C:\Users\Huzaifa Usman\Desktop\Point of sale for Resturant"

# Run development server
npm run dev
```

### Watch the Console:

- **Server logs** appear in the terminal where you ran `npm run dev`
- **Errors** will show in red
- **Warnings** will show in yellow

### Example Server Errors:

```
❌ Error: Cannot find module 'express'
   → Missing dependency, run: npm install

❌ Error: Port 5000 is already in use
   → Another process is using port 5000

❌ Error: SQLITE_ERROR: no such table
   → Database table doesn't exist
```

---

## 4️⃣ Check Build Logs (Deployment Errors)

### In Render Dashboard:

1. Go to your service (`restaurant-pos`)
2. Click **"Events"** tab
3. Find the latest deployment
4. Click on it to see build logs

### Common Build Errors:

```
❌ npm ERR! missing script: build
   → Check package.json scripts

❌ Error: Cannot find module 'vite'
   → devDependencies not installed (we fixed this!)

❌ Build failed: vite: not found
   → Build configuration issue

❌ Error: Module not found
   → Missing dependency or import error
```

---

## 🛠️ Advanced Error Tracing

### 1. Add Console Logging

Add `console.log()` statements to trace execution:

```javascript
// In your code
console.log('Step 1: Starting function');
console.log('Data:', data);
console.log('Step 2: Processing...');

// In server code
console.error('Error occurred:', error);
```

### 2. Use Try-Catch Blocks

Wrap code in try-catch to catch errors:

```javascript
try {
  // Your code here
  const result = await someFunction();
  console.log('Success:', result);
} catch (error) {
  console.error('Error caught:', error);
  console.error('Error stack:', error.stack);
  // Handle error appropriately
}
```

### 3. Check Network Tab

In Browser DevTools:

1. Open **Network** tab
2. Reload the page
3. Look for:
   - Failed requests (red)
   - Status codes (200 = OK, 404 = Not Found, 500 = Server Error)
   - Response data
   - Request headers

### 4. Server-Side Error Logging

In your server code (`server/index.js`):

```javascript
// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  console.error('Stack:', err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});
```

---

## 🔍 Common Error Types & Solutions

### 1. **Database Errors**

**Error:**
```
SQLITE_ERROR: no such table: users
```

**Solution:**
- Check if database initialization ran
- Check server logs for table creation
- Verify `server/database.js` initialization

### 2. **Module Not Found**

**Error:**
```
Error: Cannot find module 'express'
```

**Solution:**
```powershell
# Reinstall dependencies
npm install
cd client && npm install
```

### 3. **Port Already in Use**

**Error:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
```powershell
# Find and kill the process
# Windows PowerShell:
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Or change port in .env or server/index.js
```

### 4. **CORS Errors**

**Error:**
```
Access to fetch at 'http://localhost:5000/api/...' has been blocked by CORS policy
```

**Solution:**
- Check server CORS configuration
- Verify allowed origins in `server/index.js`

### 5. **Build Errors**

**Error:**
```
vite: not found
```

**Solution:**
- Check if devDependencies are installed
- Verify build scripts in `package.json`
- Check `render.yaml` build configuration

---

## 📊 Error Tracing Workflow

### For Live Website Errors:

1. **User reports error** → Note what they were doing
2. **Check Render Logs** → Look for error messages
3. **Reproduce locally** → Try to recreate the error
4. **Check Browser Console** → Look for frontend errors
5. **Fix the issue** → Make code changes
6. **Test locally** → Verify fix works
7. **Push to GitHub** → Auto-deploys
8. **Verify on live site** → Check if fixed

### For Local Development Errors:

1. **See error in terminal** → Read the error message
2. **Check stack trace** → See which file/line
3. **Add console.log()** → Trace execution flow
4. **Check Network tab** → Verify API calls
5. **Fix the issue** → Update code
6. **Test again** → Verify fix works

---

## 🎯 Quick Debugging Checklist

- [ ] Check Render logs for server errors
- [ ] Check browser console for frontend errors
- [ ] Check Network tab for failed requests
- [ ] Check local server logs
- [ ] Check build logs (if deployment failed)
- [ ] Verify environment variables are set
- [ ] Check database connection
- [ ] Verify all dependencies are installed
- [ ] Check file paths and imports
- [ ] Test locally before deploying

---

## 🔧 Debugging Tools

### 1. **Browser DevTools**
- Console: JavaScript errors
- Network: API requests/responses
- Application: Local storage, cookies
- Sources: Debug JavaScript code

### 2. **Render Dashboard**
- Logs: Server logs
- Events: Deployment history
- Metrics: Performance data

### 3. **VS Code Debugger**
- Set breakpoints
- Step through code
- Inspect variables

### 4. **Postman/Thunder Client**
- Test API endpoints
- Check request/response
- Verify authentication

---

## 💡 Pro Tips

1. **Add Error Boundaries:**
   - In React, add error boundaries to catch component errors
   
2. **Log Everything:**
   - Log important steps in your code
   - Log data before processing
   - Log errors with full context

3. **Use Descriptive Error Messages:**
   ```javascript
   // Bad
   throw new Error('Error');
   
   // Good
   throw new Error('Failed to create user: Database connection timeout');
   ```

4. **Check Error Patterns:**
   - If same error appears multiple times, it's a systemic issue
   - Note when errors occur (specific actions, times, etc.)

5. **Keep Logs Organized:**
   - Use different log levels (info, warn, error)
   - Include timestamps
   - Include relevant context

---

## 📝 Example: Tracing a Real Error

### Scenario: User can't login

**Step 1:** Check Render Logs
```
❌ Error: SQLITE_ERROR: no such table: users
```

**Step 2:** Check Browser Console
```
✅ No frontend errors
```

**Step 3:** Reproduce Locally
```powershell
npm run dev
# Try to login
# See same error in terminal
```

**Step 4:** Check Database
```powershell
# Check if database file exists
# Check if tables are created
```

**Step 5:** Fix the Issue
- Update database initialization
- Test locally
- Push to GitHub

**Step 6:** Verify Fix
- Check Render logs (no more errors)
- Test login on live site
- ✅ Fixed!

---

## 🚨 Emergency Error Fixing

### If Website is Down:

1. **Check Render Dashboard:**
   - Is service running?
   - Any failed deployments?
   - Check logs for errors

2. **Quick Fix:**
   ```powershell
   # Fix error locally
   # Test it works
   git add .
   git commit -m "Fix: [describe fix]"
   git push origin main
   ```

3. **Rollback if Needed:**
   - Go to Render Dashboard
   - Click on service
   - Go to "Events"
   - Find last working deployment
   - Click "Redeploy"

---

## 📚 Quick Reference Commands

```powershell
# View local logs
npm run dev

# Check Render logs
# → Go to dashboard.render.com → Your Service → Logs

# Check browser console
# → Press F12 → Console tab

# Test API endpoints
# → Use Postman or browser Network tab

# Check database
# → Check server logs for DB connection

# View build errors
# → Render Dashboard → Events → Latest Deployment
```

---

## 🎓 Summary

**Quick Error Tracing:**
1. **Render Logs** → Server-side errors
2. **Browser Console** → Frontend errors
3. **Network Tab** → API request errors
4. **Build Logs** → Deployment errors

**Always:**
- Read the full error message
- Check the stack trace
- Look at line numbers
- Check recent changes
- Test locally first

**Remember:**
- Most errors are logged somewhere
- Stack traces show exactly where the error occurred
- Test fixes locally before deploying
- Keep Render logs open while debugging

---

🎉 **Now you can trace and fix errors effectively!** 🎉
