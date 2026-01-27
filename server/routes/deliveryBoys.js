const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getTenantDb, closeTenantDb, requireTenant } = require('../middleware/tenant');
const { preventDemoModifications } = require('../middleware/demoRestriction');

const router = express.Router();
const deliveryBoysMigratedTenants = new Set();

async function ensureDeliveryBoysTable(db, tenantCode) {
  // Always ensure table exists, regardless of tenantCode
  // The migration check is just an optimization to avoid repeated CREATE TABLE calls
  const cacheKey = tenantCode || 'default';
  if (deliveryBoysMigratedTenants.has(cacheKey)) return;
  
  try {
    await db.run(`CREATE TABLE IF NOT EXISTS delivery_boys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      address TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    deliveryBoysMigratedTenants.add(cacheKey);
  } catch (err) {
    // If table already exists, that's fine - just mark as migrated
    if (err.message && err.message.includes('already exists')) {
      deliveryBoysMigratedTenants.add(cacheKey);
      return;
    }
    // Re-throw other errors
    throw err;
  }
}

// Get all delivery boys
router.get('/', authenticateToken, requireTenant, getTenantDb, closeTenantDb, async (req, res) => {
  try {
    const tenantCode = req.user?.tenant_code;
    await ensureDeliveryBoysTable(req.db, tenantCode);

    const { status } = req.query;
    let sql = 'SELECT * FROM delivery_boys WHERE 1=1';
    const params = [];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC';

    const deliveryBoys = await req.db.query(sql, params);
    res.json(deliveryBoys);
  } catch (error) {
    console.error('Get delivery boys error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single delivery boy
router.get('/:id', authenticateToken, requireTenant, getTenantDb, closeTenantDb, async (req, res) => {
  try {
    const tenantCode = req.user?.tenant_code;
    await ensureDeliveryBoysTable(req.db, tenantCode);

    const deliveryBoy = await req.db.get('SELECT * FROM delivery_boys WHERE id = ?', [req.params.id]);
    if (!deliveryBoy) {
      return res.status(404).json({ error: 'Delivery boy not found' });
    }
    res.json(deliveryBoy);
  } catch (error) {
    console.error('Get delivery boy error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create delivery boy
router.post('/', authenticateToken, requireRole('admin'), preventDemoModifications, requireTenant, getTenantDb, closeTenantDb, async (req, res) => {
  try {
    const tenantCode = req.user?.tenant_code;
    await ensureDeliveryBoysTable(req.db, tenantCode);

    const { name, phone, email, address, status } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Delivery boy name is required' });
    }

    const result = await req.db.run(
      'INSERT INTO delivery_boys (name, phone, email, address, status) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), phone || null, email || null, address || null, status || 'active']
    );

    const deliveryBoy = await req.db.get('SELECT * FROM delivery_boys WHERE id = ?', [result.id]);
    res.status(201).json(deliveryBoy);
  } catch (error) {
    console.error('Create delivery boy error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update delivery boy
router.put('/:id', authenticateToken, requireRole('admin'), preventDemoModifications, requireTenant, getTenantDb, closeTenantDb, async (req, res) => {
  try {
    const tenantCode = req.user?.tenant_code;
    await ensureDeliveryBoysTable(req.db, tenantCode);

    const { name, phone, email, address, status } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Delivery boy name is required' });
    }

    await req.db.run(
      'UPDATE delivery_boys SET name = ?, phone = ?, email = ?, address = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name.trim(), phone || null, email || null, address || null, status || 'active', req.params.id]
    );

    const deliveryBoy = await req.db.get('SELECT * FROM delivery_boys WHERE id = ?', [req.params.id]);
    res.json(deliveryBoy);
  } catch (error) {
    console.error('Update delivery boy error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete delivery boy
router.delete('/:id', authenticateToken, requireRole('admin'), preventDemoModifications, requireTenant, getTenantDb, closeTenantDb, async (req, res) => {
  try {
    const tenantCode = req.user?.tenant_code;
    await ensureDeliveryBoysTable(req.db, tenantCode);

    // Check if delivery boy is assigned to any active deliveries
    const activeDeliveries = await req.db.query(
      'SELECT COUNT(*) as count FROM sales WHERE delivery_boy_id = ? AND delivery_status NOT IN ("settled", "cancelled")',
      [req.params.id]
    );

    if (activeDeliveries[0]?.count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete delivery boy with active deliveries. Please settle or cancel all deliveries first.' 
      });
    }

    await req.db.run('DELETE FROM delivery_boys WHERE id = ?', [req.params.id]);
    res.json({ message: 'Delivery boy deleted successfully' });
  } catch (error) {
    console.error('Delete delivery boy error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = { router, ensureDeliveryBoysTable };
