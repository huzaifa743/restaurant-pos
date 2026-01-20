# Complete Git Commit Guide - Multi-Tenant System

## Step-by-Step Instructions

### Step 1: Check Current Status

Open terminal/PowerShell in your project directory and run:
```bash
git status
```

This shows:
- ✅ Modified files (files you changed)
- ✅ New files (files you created)
- ✅ Deleted files (files you removed)

### Step 2: Review Changes (Optional)

To see what changed in a specific file:
```bash
git diff filename.js
```

To see all changes:
```bash
git diff
```

### Step 3: Stage All Changes

Add all modified, new, and deleted files to staging:
```bash
git add .
```

**What this does**: Prepares all changes to be committed

**Alternative**: Stage specific files only:
```bash
git add server/tenantManager.js
git add client/src/pages/Tenants.jsx
```

### Step 4: Verify Staged Changes

Check what's staged for commit:
```bash
git status
```

You should see files listed under "Changes to be committed"

### Step 5: Commit Changes

Create a commit with a descriptive message:
```bash
git commit -m "Add multi-tenant system: separate databases per restaurant, tenant management UI, updated authentication"
```

**Good commit messages**:
- ✅ Clear and descriptive
- ✅ Explain what was added/changed
- ✅ Keep it concise but informative

**Examples**:
```bash
git commit -m "Implement multi-tenant system with separate databases"
git commit -m "Add tenant management: create, edit, delete tenants with isolated databases"
git commit -m "Multi-tenant POS: separate database per restaurant owner"
```

### Step 6: Push to GitHub

Push your commits to GitHub:
```bash
git push origin main
```

**What this does**:
- Uploads your commits to GitHub
- Triggers Railway auto-deployment
- Makes changes available to your team

### Step 7: Verify Push

Check if push was successful:
```bash
git log --oneline -5
```

This shows your last 5 commits.

## Complete Command Sequence

Copy and paste these commands one by one:

```bash
# 1. Navigate to project directory
cd "c:\Users\Huzaifa Usman\Desktop\Point of sale for Resturant"

# 2. Check status
git status

# 3. Stage all changes
git add .

# 4. Commit with message
git commit -m "Add multi-tenant system: separate databases per restaurant, tenant management UI, updated authentication"

# 5. Push to GitHub
git push origin main
```

## Troubleshooting

### If "git add ." fails:
```bash
# Try adding files individually
git add server/
git add client/
git add *.md
```

### If commit fails:
- Make sure you're in the project directory
- Check if files are already committed: `git status`
- Try: `git commit -m "Your message" --allow-empty` (if needed)

### If push fails:

**Error: "Updates were rejected"**
```bash
# Pull latest changes first
git pull origin main

# Resolve any conflicts, then:
git add .
git commit -m "Your message"
git push origin main
```

**Error: "Authentication failed"**
- Check your GitHub credentials
- May need to set up SSH keys or use GitHub token

### If you want to undo changes:

**Before committing** (undo all changes):
```bash
git restore .
```

**After committing** (undo last commit, keep changes):
```bash
git reset --soft HEAD~1
```

**After pushing** (be careful!):
```bash
git revert HEAD
git push origin main
```

## What Happens After Push

1. ✅ **GitHub**: Your code is uploaded
2. ✅ **Railway**: Detects the push automatically
3. ✅ **Railway**: Starts building your app (~3-5 minutes)
4. ✅ **Railway**: Deploys new version automatically
5. ✅ **Your App**: Goes live with multi-tenant system!

## Monitor Deployment

After pushing, check Railway dashboard:
1. Go to https://railway.app
2. Open your project
3. Check "Deployments" tab
4. Watch build logs

## Quick Reference

| Command | Purpose |
|---------|---------|
| `git status` | Check what files changed |
| `git add .` | Stage all changes |
| `git commit -m "message"` | Commit changes |
| `git push origin main` | Push to GitHub |
| `git log --oneline -5` | View recent commits |
| `git diff` | See what changed |

## Best Practices

✅ **Commit Often**: Commit logical groups of changes
✅ **Clear Messages**: Write descriptive commit messages
✅ **Test First**: Test locally before pushing
✅ **Review Changes**: Check `git status` before committing
✅ **One Feature Per Commit**: Don't mix unrelated changes

## Example Workflow

```bash
# 1. Check what changed
git status

# 2. Review changes (optional)
git diff server/tenantManager.js

# 3. Stage changes
git add .

# 4. Commit
git commit -m "Add multi-tenant system with separate databases"

# 5. Push
git push origin main

# 6. Verify
git log --oneline -1
```

---

**Ready to commit? Follow the steps above!** 🚀
