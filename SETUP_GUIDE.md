# Setup Guide - Restaurant POS System

## Initial Setup

### 1. Setup Super Admin

To create or update the super admin account:

```bash
npm run setup-super-admin
```

**Default Credentials:**
- Username: `superadmin`
- Password: `superadmin123`
- Tenant Code: (leave empty)

**To customize super admin credentials**, set environment variables before running:
```bash
SUPER_ADMIN_USERNAME=your_username \
SUPER_ADMIN_PASSWORD=your_password \
SUPER_ADMIN_EMAIL=your_email@example.com \
SUPER_ADMIN_NAME=Your Name \
npm run setup-super-admin
```

### 2. Setup Demo Tenant (Recommended for Testing)

To create a demo tenant with pre-populated data:

```bash
npm run setup-demo
```

**Demo Credentials:**
- Tenant Code: `DEMO`
- Username: `demo`
- Password: `demo123`

**Cashier Account:**
- Tenant Code: `DEMO`
- Username: `cashier`
- Password: `cashier123`

**Demo Data Includes:**
- ✅ 5 Categories (Beverages, Appetizers, Main Course, Desserts, Salads)
- ✅ 20 Products (with prices and stock)
- ✅ 5 Customers
- ✅ 5 Sample Sales Transactions
- ✅ 1 Cashier User Account
- ✅ Restaurant Settings (name, address, contact info)

### 3. Setup Both (Super Admin + Demo)

To setup both super admin and demo tenant:

```bash
npm run setup-all
```

---

## After Setup

### Login Options

1. **Super Admin Login:**
   - Leave Tenant Code empty
   - Use super admin credentials
   - Can manage all tenants and the system

2. **Demo Account Login:**
   - Tenant Code: `DEMO`
   - Username: `demo`
   - Password: `demo123`
   - Full access to demo restaurant with sample data

3. **Demo Cashier Login:**
   - Tenant Code: `DEMO`
   - Username: `cashier`
   - Password: `cashier123`
   - Limited access (cashier role)

---

## Production Deployment

### Railway / Render Setup

1. **Set Environment Variables** (optional, for custom super admin):
   ```
   SUPER_ADMIN_USERNAME=your_secure_username
   SUPER_ADMIN_PASSWORD=your_secure_password
   SUPER_ADMIN_EMAIL=admin@yourdomain.com
   SUPER_ADMIN_NAME=Your Name
   ```

2. **Run Setup Scripts** (via Railway CLI or in deployment):
   ```bash
   npm run setup-all
   ```

3. **Or use Railway's Deploy Command:**
   Add to your `package.json` or Railway config:
   ```json
   {
     "scripts": {
       "postdeploy": "npm run setup-all"
     }
   }
   ```

---

## Security Notes

⚠️ **Important Security Recommendations:**

1. **Change Default Passwords:**
   - Change super admin password immediately after first login
   - Change demo account passwords if using in production

2. **Super Admin Credentials:**
   - Never commit super admin credentials to Git
   - Use environment variables for production
   - Keep super admin credentials secure

3. **Demo Account:**
   - Demo account is for testing only
   - Remove or secure demo account in production
   - Demo data will be visible to anyone with demo credentials

---

## Troubleshooting

### Super Admin Not Working

If super admin login fails:

1. Run setup script again:
   ```bash
   npm run setup-super-admin
   ```

2. Check master database exists:
   - File: `server/master.db`

3. Verify super_admins table exists:
   ```bash
   sqlite3 server/master.db "SELECT * FROM super_admins;"
   ```

### Demo Tenant Not Working

If demo tenant login fails:

1. Run setup script again:
   ```bash
   npm run setup-demo
   ```

2. Check tenant database exists:
   - File: `server/tenants/DEMO.db`

3. Verify tenant in master database:
   ```bash
   sqlite3 server/master.db "SELECT * FROM tenants WHERE tenant_code='DEMO';"
   ```

---

## Demo Data Details

### Categories
- Beverages
- Appetizers
- Main Course
- Desserts
- Salads

### Sample Products (20 items)
- Various beverages (Coffee, Tea, Soft Drinks, etc.)
- Appetizers (Wings, Spring Rolls, Nachos, etc.)
- Main dishes (Chicken, Steak, Pasta, Pizza, Burger)
- Salads (Caesar, Garden, Greek)
- Desserts (Cake, Ice Cream, Cheesecake, Brownie)

### Sample Customers (5)
- John Doe
- Jane Smith
- Bob Wilson
- Alice Brown
- Charlie Davis

### Sample Sales (5 transactions)
- Various payment methods (cash/card)
- Different order types (dine-in/takeaway)
- Includes discounts and VAT calculations

---

## Need Help?

- Check server logs for errors
- Verify database files exist in `server/` directory
- Ensure all npm dependencies are installed
- Check environment variables are set correctly

---

**Remember:** Demo account is for testing only! Remove or secure it before production use.
