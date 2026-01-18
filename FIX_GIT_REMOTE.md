# 🔧 Fix Git Remote Issue

## Problem
Your git remote is pointing to a repository that doesn't exist: `NfM-Servies-Solution-POS.git`

## Solution

Run these commands in your PowerShell terminal:

### Step 1: Remove the old remote
```powershell
git remote remove origin
```

### Step 2: Add the correct remote
```powershell
git remote add origin https://github.com/huzaifa743/restaurant-pos.git
```

### Step 3: Verify the remote
```powershell
git remote -v
```

You should see:
```
origin  https://github.com/huzaifa743/restaurant-pos.git (fetch)
origin  https://github.com/huzaifa743/restaurant-pos.git (push)
```

### Step 4: Push to GitHub

**IMPORTANT:** Make sure the repository `restaurant-pos` exists on GitHub first!

**Option A: If the repository already exists on GitHub:**
```powershell
git push -u origin main
```

**Option B: If the repository doesn't exist yet:**

1. Go to https://github.com
2. Click the "+" icon → "New repository"
3. Name it: `restaurant-pos`
4. **DO NOT** initialize with README, .gitignore, or license (we already have files)
5. Click "Create repository"
6. Then run:
```powershell
git push -u origin main
```

---

## Alternative: Update Existing Remote URL

If you prefer to update instead of removing:

```powershell
git remote set-url origin https://github.com/huzaifa743/restaurant-pos.git
git remote -v
git push -u origin main
```

---

## If You Get Authentication Errors

If you get authentication errors when pushing:

1. **Use GitHub Personal Access Token** instead of password:
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Select scopes: `repo` (full control)
   - Generate and copy the token
   - When pushing, use the token as your password

2. **Or use GitHub CLI:**
   ```powershell
   winget install --id GitHub.cli
   gh auth login
   ```

---

## Quick Fix Commands (Copy & Paste)

```powershell
# Remove old remote
git remote remove origin

# Add correct remote
git remote add origin https://github.com/huzaifa743/restaurant-pos.git

# Verify
git remote -v

# Push (make sure repository exists on GitHub first!)
git push -u origin main
```
