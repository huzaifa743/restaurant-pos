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

// Update delivery status
router.put('/:id/status', authenticateToken, requireTenant, getTenantDb, closeTenantDb, async (req, res) => {
  try {
    const tenantCode = req.user?.tenant_code;
    if (tenantCode) {
      await ensureDeliveryColumns(req.db, tenantCode);
    }

    const { status } = req.body;

    const validStatuses = ['pending', 'assigned', 'out_for_delivery', 'delivered', 'payment_collected', 'settled'];
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

    if (status === 'out_for_delivery') {
      updateSql += ', delivery_assigned_at = COALESCE(delivery_assigned_at, CURRENT_TIMESTAMP)';
    } else if (status === 'delivered') {
      updateSql += ', delivery_delivered_at = CURRENT_TIMESTAMP';
    } else if (status === 'payment_collected') {
      updateSql += ', delivery_payment_collected = 1';
    } else if (status === 'settled') {
      updateSql += ', delivery_settled_at = CURRENT_TIMESTAMP';
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

// Get delivery settlement summary (for end of day)
router.get('/settlement', authenticateToken, requireRole('admin'), requireTenant, getTenantDb, closeTenantDb, async (req, res) => {
  try {
    const tenantCode = req.user?.tenant_code;
    if (tenantCode) {
      await ensureDeliveryColumns(req.db, tenantCode);
    }

    const { delivery_boy_id, date } = req.query;
    
    let sql = `SELECT 
               db.id as delivery_boy_id,
               db.name as delivery_boy_name,
               COUNT(s.id) as total_deliveries,
               -- Total amount collected by delivery boy from customers
               SUM(CASE WHEN s.delivery_status IN ('payment_collected', 'settled') THEN s.total ELSE 0 END) as total_collected,
               -- Total amount already settled with delivery boy
               SUM(COALESCE(s.delivery_settled_amount, 0)) as total_settled,
               -- Pending amount that should be received from delivery boy
               SUM(
                 CASE 
                   WHEN s.delivery_status IN ('payment_collected', 'settled') 
                   THEN (s.total - COALESCE(s.delivery_settled_amount, 0))
                   ELSE 0
                 END
               ) as pending_settlement
               FROM sales s
               LEFT JOIN delivery_boys db ON s.delivery_boy_id = db.id
               WHERE s.payment_method = 'payAfterDelivery' 
               AND s.delivery_boy_id IS NOT NULL`;
    
    const params = [];

    if (delivery_boy_id) {
      sql += ' AND s.delivery_boy_id = ?';
      params.push(delivery_boy_id);
    }

    if (date) {
      sql += ' AND DATE(s.created_at) = ?';
      params.push(date);
    } else {
      sql += ' AND DATE(s.created_at) = DATE("now")';
    }

    sql += ' GROUP BY db.id, db.name';

    const settlements = await req.db.query(sql, params);

    res.json(settlements);
  } catch (error) {
    console.error('Get settlement error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Settle payments with delivery boy (mark all collected payments as settled)
router.post('/settle', authenticateToken, requireRole('admin'), requireTenant, getTenantDb, closeTenantDb, async (req, res) => {
  try {
    const tenantCode = req.user?.tenant_code;
    if (tenantCode) {
      await ensureDeliveryColumns(req.db, tenantCode);
    }

    const { delivery_boy_id, date } = req.body;

    let sql = `UPDATE sales 
               SET delivery_status = 'settled', 
                   delivery_settled_at = CURRENT_TIMESTAMP,
                   delivery_settled_amount = total
               WHERE payment_method = 'payAfterDelivery' 
               AND delivery_status = 'payment_collected'
               AND (delivery_settled_amount IS NULL OR delivery_settled_amount < total)`;
    
    const params = [];

    if (delivery_boy_id) {
      sql += ' AND delivery_boy_id = ?';
      params.push(delivery_boy_id);
    }

    if (date) {
      sql += ' AND DATE(created_at) = ?';
      params.push(date);
    } else {
      sql += ' AND DATE(created_at) = DATE("now")';
    }

    const result = await req.db.run(sql, params);

    res.json({ 
      message: `Settled ${result.changes} delivery payment(s)`,
      settled_count: result.changes
    });
  } catch (error) {
    console.error('Settle payments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Partially settle payments with a delivery boy (collect a specific amount)
router.post('/settle-partial', authenticateToken, requireRole('admin'), requireTenant, getTenantDb, closeTenantDb, async (req, res) => {
  try {
    const tenantCode = req.user?.tenant_code;
    if (tenantCode) {
      await ensureDeliveryColumns(req.db, tenantCode);
    }

    const { delivery_boy_id, date, amount } = req.body;

    if (!delivery_boy_id) {
      return res.status(400).json({ error: 'Delivery boy ID is required' });
    }

    const settleAmount = parseFloat(amount);
    if (!settleAmount || settleAmount <= 0) {
      return res.status(400).json({ error: 'Settlement amount must be greater than zero' });
    }

    // Get all deliveries for this boy and date that still have pending amount
    const params = [delivery_boy_id];
    let sql = `
      SELECT 
        id,
        total,
        COALESCE(delivery_settled_amount, 0) as settled_amount
      FROM sales
      WHERE payment_method = 'payAfterDelivery'
        AND delivery_boy_id = ?
        AND delivery_status IN ('payment_collected', 'settled')
        AND (total - COALESCE(delivery_settled_amount, 0)) > 0
    `;

    if (date) {
      sql += ' AND DATE(created_at) = ?';
      params.push(date);
    } else {
      sql += ' AND DATE(created_at) = DATE("now")';
    }

    sql += ' ORDER BY created_at ASC';

    const deliveries = await req.db.query(sql, params);

    if (!deliveries || deliveries.length === 0) {
      return res.status(400).json({ error: 'No pending deliveries found for this delivery boy and date' });
    }

    let remaining = settleAmount;
    let affectedCount = 0;
    let appliedTotal = 0;

    for (const delivery of deliveries) {
      if (remaining <= 0) break;

      const pending = delivery.total - delivery.settled_amount;
      if (pending <= 0) continue;

      const apply = Math.min(pending, remaining);
      const newSettledAmount = delivery.settled_amount + apply;
      const fullySettled = newSettledAmount >= delivery.total - 0.000001; // handle float precision

      let updateSql = `
        UPDATE sales
        SET delivery_settled_amount = ?,
            delivery_settled_at = CASE 
              WHEN ? >= total THEN COALESCE(delivery_settled_at, CURRENT_TIMESTAMP)
              ELSE delivery_settled_at
            END,
            delivery_status = CASE 
              WHEN ? >= total THEN 'settled'
              ELSE delivery_status
            END
        WHERE id = ?
      `;

      await req.db.run(updateSql, [
        newSettledAmount,
        newSettledAmount,
        newSettledAmount,
        delivery.id
      ]);

      remaining -= apply;
      appliedTotal += apply;
      affectedCount += 1;

      if (fullySettled && remaining <= 0) {
        break;
      }
    }

    if (appliedTotal === 0) {
      return res.status(400).json({ error: 'No pending amount could be settled with the provided value' });
    }

    res.json({
      message: `Partially settled ${affectedCount} delivery(ies) for a total of ${appliedTotal.toFixed(2)}`,
      settled_amount: appliedTotal,
      affected_deliveries: affectedCount
    });
  } catch (error) {
    console.error('Partial settle payments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
