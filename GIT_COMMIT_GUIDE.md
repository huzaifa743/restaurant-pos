# Complete Git Commit Guide - Multi-Tenant System

## Step-by-Step Instructions

### Step 1: Check Current Status

First, let's see what files have been changed:

```powershell
cd "c:\Users\Huzaifa Usman\Desktop\Point of sale for Resturant"
git status
```

This will show you:
- Modified files (files you changed)
- New files (files you created)
- Deleted files (files you removed)

### Step 2: Review Changes (Optional)

If you want to see what changed in a specific file:

```powershell
git diff <filename>
```

For example:
```powershell
git diff server/tenantManager.js
```

### Step 3: Stage All Changes

Add all modified, new, and deleted files to staging:

```powershell
git add .
```

This prepares all changes to be committed.

**Alternative**: If you want to add files one by one:
```powershell
git add server/tenantManager.js
git add server/routes/tenants.js
# etc...
```

### Step 4: Commit Changes

Create a commit with a descriptive message:

```powershell
git commit -m "Implement multi-tenant system with separate databases per restaurant"
```

**Good commit messages**:
- ✅ "Implement multi-tenant system with separate databases per restaurant"
- ✅ "Add tenant management: separate DB per restaurant, tenant isolation"
- ❌ "fix" (too vague)
- ❌ "changes" (not descriptive)

### Step 5: Push to GitHub

Push your commits to GitHub (this triggers Railway auto-deploy):

```powershell
git push origin main
```

If you're on a different branch:
```powershell
git push origin <branch-name>
```

### Step 6: Verify Push

Check that your push was successful:

```powershell
git log --oneline -5
```

This shows your last 5 commits.

---

## Complete Command Sequence (Copy & Paste)

Run these commands one by one in PowerShell:

```powershell
# 1. Navigate to project directory
cd "c:\Users\Huzaifa Usman\Desktop\Point of sale for Resturant"

# 2. Check status
git status

# 3. Stage all changes
git add .

# 4. Commit with message
git commit -m "Implement multi-tenant system: separate databases per restaurant, tenant management UI, updated authentication"

# 5. Push to GitHub
git push origin main

# 6. Verify (optional)
git log --oneline -3
```

---

## What Happens After Push

### Railway Auto-Deployment

1. ✅ Railway detects the push to GitHub
2. ✅ Starts building your app (~3-5 minutes)
3. ✅ Deploys automatically
4. ✅ Your app goes live with multi-tenant system

**Monitor Deployment**:
- Go to https://railway.app
- Open your project
- Check "Deployments" tab
- Watch build logs

---

## Troubleshooting

### If `git add .` Shows Errors

**Error**: "fatal: not a git repository"
**Solution**: Make sure you're in the project directory
```powershell
cd "c:\Users\Huzaifa Usman\Desktop\Point of sale for Resturant"
```

### If Push Fails

**Error**: "Updates were rejected"
**Solution**: Pull latest changes first
```powershell
git pull origin main
git push origin main
```

**Error**: "Authentication failed"
**Solution**: You may need to authenticate
- Use GitHub Personal Access Token
- Or use GitHub Desktop app

### If You Want to Undo Changes

**Before committing** (undo changes to a file):
```powershell
git restore <filename>
```

**After committing** (undo last commit, keep changes):
```powershell
git reset --soft HEAD~1
```

**After pushing** (be careful!):
```powershell
git revert HEAD
git push origin main
```

---

## Files That Will Be Committed

Based on the multi-tenant implementation, these files will be included:

### New Files:
- `server/tenantManager.js`
- `server/middleware/tenant.js`
- `server/routes/tenants.js`
- `client/src/pages/Tenants.jsx`
- `MULTI_TENANT_SYSTEM.md`
- `MULTI_TENANT_COMPLETE.md`
- `MULTI_TENANT_IMPLEMENTATION_STATUS.md`
- `ROUTES_UPDATE_PATTERN.md`

### Modified Files:
- `server/index.js`
- `server/routes/auth.js`
- `server/routes/products.js`
- `server/routes/categories.js`
- `server/routes/sales.js`
- `server/routes/customers.js`
- `server/routes/users.js`
- `server/routes/dashboard.js`
- `server/routes/reports.js`
- `server/routes/settings.js`
- `server/middleware/auth.js`
- `client/src/pages/Login.jsx`
- `client/src/contexts/AuthContext.jsx`
- `client/src/contexts/SettingsContext.jsx`
- `client/src/components/Sidebar.jsx`
- `client/src/App.jsx`

---

## Quick Reference

### Common Git Commands

```powershell
# Check status
git status

# See changes
git diff

# Stage all files
git add .

# Stage specific file
git add <filename>

# Commit
git commit -m "Your message"

# Push
git push origin main

# Pull latest
git pull origin main

# View commit history
git log --oneline -10

# See what branch you're on
git branch
```

---

## Best Practices

1. ✅ **Write descriptive commit messages**
   - Good: "Add tenant management system with separate databases"
   - Bad: "fix" or "update"

2. ✅ **Commit related changes together**
   - All multi-tenant changes in one commit is fine

3. ✅ **Test before pushing** (if possible)
   - But Railway will also test during deployment

4. ✅ **Check status before committing**
   - `git status` shows what will be committed

5. ✅ **Push regularly**
   - Don't let too many changes accumulate

---

## After Deployment

Once Railway finishes deploying:

1. ✅ **Test Super Admin Login**
   - Username: `superadmin`
   - Password: `superadmin123`
   - Tenant Code: (leave empty)

2. ✅ **Create Test Tenant**
   - Go to Tenants page
   - Create a test restaurant

3. ✅ **Test Tenant Login**
   - Use credentials from tenant creation
   - Verify data isolation

4. ✅ **Change Super Admin Password**
   - Update in `server/routes/auth.js`
   - Commit and push again

---

## Summary

**Quick Commands** (run in order):
```powershell
cd "c:\Users\Huzaifa Usman\Desktop\Point of sale for Resturant"
git add .
git commit -m "Implement multi-tenant system with separate databases per restaurant"
git push origin main
```

**That's it!** Railway will automatically deploy your changes.

---

**Need Help?** Check Railway logs if deployment fails, or review the error messages.
