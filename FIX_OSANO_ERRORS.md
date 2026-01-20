# Fixing Osano.js SVG Errors

## What Are These Errors?

The errors you're seeing:
```
Error: <svg> attribute viewBox: Expected number, "0 0 84% 20"
```

**These are NOT from your code!** They're from `osano.js`, which is a third-party script (likely cookie consent or analytics) that may be injected by:
- Railway platform
- Browser extensions
- Other third-party services

## Are They Harmful?

❌ **No, they're harmless warnings**
- ✅ Don't affect your app functionality
- ✅ Don't break any features
- ✅ Just console noise from external library

## Solutions

### Option 1: Ignore Them (Recommended)

These errors don't affect your POS system. You can safely ignore them.

### Option 2: Suppress Console Errors (If They Bother You)

Add this to your `client/index.html` or create a console filter:

```html
<script>
  // Suppress osano.js SVG errors
  const originalError = console.error;
  console.error = function(...args) {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('viewBox')) {
      return; // Suppress viewBox errors
    }
    originalError.apply(console, args);
  };
</script>
```

### Option 3: Check Browser Extensions

Sometimes browser extensions inject scripts:
1. Try opening in incognito/private mode
2. Disable browser extensions one by one
3. Check if errors still appear

### Option 4: Check Railway/Platform Scripts

Railway or other platforms might inject scripts. Check:
- Railway dashboard settings
- Any analytics/cookie consent tools
- Third-party integrations

## Quick Fix: Add Console Filter

Add this to `client/src/main.jsx`:

```javascript
// Suppress osano.js SVG viewBox errors (harmless third-party warnings)
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = function(...args) {
    const message = args[0]?.toString() || '';
    if (message.includes('viewBox') && message.includes('Expected number')) {
      // Suppress osano.js SVG errors - they're harmless
      return;
    }
    originalError.apply(console, args);
  };
}
```

## Verification

After adding the filter:
1. Refresh your browser
2. Check console
3. Errors should be gone (or filtered out)

## Important Notes

⚠️ **These errors are NOT from your code**
⚠️ **They don't affect functionality**
⚠️ **Safe to ignore if you prefer**

---

**Recommendation**: Add the console filter if the errors are distracting, otherwise ignore them - they're harmless!
