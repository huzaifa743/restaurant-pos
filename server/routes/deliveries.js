const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getTenantDb, closeTenantDb, requireTenant } = require('../middleware/tenant');

const router = express.Router();
const deliveryMigratedTenants = new Set();

async function ensureDeliveryColumns(db, tenantCode) {
  if (!tenantCode || deliveryMigratedTenants.has(tenantCode)) return;
  try {
    await db.run('ALTER TABLE sales ADD COLUMN delivery_boy_id INTEGER');
    await db.run('ALTER TABLE sales ADD COLUMN delivery_status TEXT DEFAULT "pending"');
    await db.run('ALTER TABLE sales ADD COLUMN delivery_payment_collected INTEGER DEFAULT 0');
    await db.run('ALTER TABLE sales ADD COLUMN delivery_settled_at DATETIME');
    await db.run('ALTER TABLE sales ADD COLUMN delivery_assigned_at DATETIME');
    await db.run('ALTER TABLE sales ADD COLUMN delivery_delivered_at DATETIME');
    await db.run('ALTER TABLE sales ADD COLUMN delivery_settled_amount REAL DEFAULT 0');
  } catch (err) {
    if (!err.message || !err.message.includes('duplicate column')) throw err;
  }
  deliveryMigratedTenants.add(tenantCode);
}

// Get all deliveries (for Pay After Delivery orders)
router.get('/', authenticateToken, requireTenant, getTenantDb, closeTenantDb, async (req, res) => {
  try {
    const tenantCode = req.user?.tenant_code;
    if (tenantCode) {
      await ensureDeliveryColumns(req.db, tenantCode);
    }

    const { status, delivery_boy_id, start_date, end_date } = req.query;
    
    let sql = `SELECT s.*, u.username as user_name, c.name as customer_name, c.phone as customer_phone,
               c.address as customer_address, c.city as customer_city,
               db.name as delivery_boy_name,
               (SELECT COUNT(*) FROM sale_items WHERE sale_id = s.id) as item_count
               FROM sales s 
               LEFT JOIN users u ON s.user_id = u.id 
               LEFT JOIN customers c ON s.customer_id = c.id
               LEFT JOIN delivery_boys db ON s.delivery_boy_id = db.id
               WHERE s.payment_method = 'payAfterDelivery'`;
    const params = [];

    if (status) {
      sql += ' AND s.delivery_status = ?';
      params.push(status);
    }

    if (delivery_boy_id) {
      sql += ' AND s.delivery_boy_id = ?';
      params.push(delivery_boy_id);
    }

    if (start_date) {
      sql += ' AND DATE(s.created_at) >= ?';
      params.push(start_date);
    }

    if (end_date) {
      sql += ' AND DATE(s.created_at) <= ?';
      params.push(end_date);
    }

    sql += ' ORDER BY s.created_at DESC';

    const deliveries = await req.db.query(sql, params);
    res.json(deliveries);
  } catch (error) {
    console.error('Get deliveries error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get delivery boys (from delivery_boys table)
router.get('/delivery-boys', authenticateToken, requireTenant, getTenantDb, closeTenantDb, async (req, res) => {
  try {
    const tenantCode = req.user?.tenant_code;
    if (tenantCode) {
      const { ensureDeliveryBoysTable } = require('./deliveryBoys');
      await ensureDeliveryBoysTable(req.db, tenantCode);
    }

    const deliveryBoys = await req.db.query(
      'SELECT id, name, phone, email, address, status FROM delivery_boys WHERE status = "active" ORDER BY name'
    );
    res.json(deliveryBoys);
  } catch (error) {
    console.error('Get delivery boys error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Assign delivery boy to a sale
router.put('/:id/assign', authenticateToken, requireTenant, getTenantDb, closeTenantDb, async (req, res) => {
  try {
    const tenantCode = req.user?.tenant_code;
    if (tenantCode) {
      await ensureDeliveryColumns(req.db, tenantCode);
    }

    const { delivery_boy_id } = req.body;

    if (!delivery_boy_id) {
      return res.status(400).json({ error: 'Delivery boy ID is required' });
    }

    // Verify sale exists and is Pay After Delivery
    const sale = await req.db.get('SELECT id, payment_method FROM sales WHERE id = ?', [req.params.id]);
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    if (sale.payment_method !== 'payAfterDelivery') {
      return res.status(400).json({ error: 'This sale is not a Pay After Delivery order' });
    }

    // Verify delivery boy exists
    const deliveryBoy = await req.db.get('SELECT id FROM delivery_boys WHERE id = ? AND status = "active"', [delivery_boy_id]);
    if (!deliveryBoy) {
      return res.status(404).json({ error: 'Delivery boy not found or inactive' });
    }

    await req.db.run(
      'UPDATE sales SET delivery_boy_id = ?, delivery_status = ?, delivery_assigned_at = CURRENT_TIMESTAMP WHERE id = ?',
      [delivery_boy_id, 'assigned', req.params.id]
    );

    const updatedSale = await req.db.get(
      `SELECT s.*, u.username as user_name, c.name as customer_name,
       db.name as delivery_boy_name
       FROM sales s 
       LEFT JOIN users u ON s.user_id = u.id 
       LEFT JOIN customers c ON s.customer_id = c.id
       LEFT JOIN delivery_boys db ON s.delivery_boy_id = db.id
       WHERE s.id = ?`,
      [req.params.id]
    );

    res.json(updatedSale);
  } catch (error) {
    console.error('Assign delivery boy error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update delivery status (simple: payment_pending -> payment_received)
router.put('/:id/status', authenticateToken, requireTenant, getTenantDb, closeTenantDb, async (req, res) => {
  try {
    const tenantCode = req.user?.tenant_code;
    if (tenantCode) {
      await ensureDeliveryColumns(req.db, tenantCode);
    }

    const { status } = req.body;

    // Simplified statuses: payment_pending, payment_received
    const validStatuses = ['payment_pending', 'payment_received'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid delivery status' });
    }

    const sale = await req.db.get('SELECT id, payment_method FROM sales WHERE id = ?', [req.params.id]);
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    if (sale.payment_method !== 'payAfterDelivery') {
      return res.status(400).json({ error: 'This sale is not a Pay After Delivery order' });
    }

    let updateSql = 'UPDATE sales SET delivery_status = ?';
    const params = [status];

    if (status === 'payment_received') {
      updateSql += ', delivery_payment_collected = 1, delivery_settled_at = COALESCE(delivery_settled_at, CURRENT_TIMESTAMP)';
    }

    updateSql += ' WHERE id = ?';
    params.push(req.params.id);

    await req.db.run(updateSql, params);

    const updatedSale = await req.db.get(
      `SELECT s.*, u.username as user_name, c.name as customer_name,
       db.name as delivery_boy_name
       FROM sales s 
       LEFT JOIN users u ON s.user_id = u.id 
       LEFT JOIN customers c ON s.customer_id = c.id
       LEFT JOIN delivery_boys db ON s.delivery_boy_id = db.id
       WHERE s.id = ?`,
      [req.params.id]
    );

    res.json(updatedSale);
  } catch (error) {
    console.error('Update delivery status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Note: previous complex settlement endpoints removed to keep flow simple

module.exports = router;
