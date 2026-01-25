const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');
const { getTenantDb, closeTenantDb, requireTenant } = require('../middleware/tenant');

const router = express.Router();

// Get all held sales
router.get('/', authenticateToken, requireTenant, getTenantDb, closeTenantDb, async (req, res) => {
  try {
    const heldSales = await req.db.query(
      `SELECT h.*, u.username as user_name, c.name as customer_name 
       FROM held_sales h 
       LEFT JOIN users u ON h.user_id = u.id 
       LEFT JOIN customers c ON h.customer_id = c.id 
       ORDER BY h.created_at DESC`
    );
    res.json(heldSales);
  } catch (error) {
    console.error('Get held sales error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create held sale
router.post('/', authenticateToken, requireTenant, getTenantDb, closeTenantDb, async (req, res) => {
  try {
    const {
      customer_id,
      cart_data,
      subtotal,
      discount_amount,
      discount_type,
      vat_percentage,
      vat_amount,
      total,
      notes
    } = req.body;

    if (!cart_data || cart_data.length === 0) {
      return res.status(400).json({ error: 'Cart cannot be empty' });
    }

    const holdNumber = `HOLD-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;

    const result = await req.db.run(
      `INSERT INTO held_sales (hold_number, customer_id, user_id, cart_data, subtotal, discount_amount, 
       discount_type, vat_percentage, vat_amount, total, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        holdNumber,
        customer_id || null,
        req.user.id,
        JSON.stringify(cart_data),
        parseFloat(subtotal),
        parseFloat(discount_amount) || 0,
        discount_type || 'fixed',
        parseFloat(vat_percentage) || 0,
        parseFloat(vat_amount) || 0,
        parseFloat(total),
        notes || null
      ]
    );

    const heldSale = await req.db.get(
      `SELECT h.*, u.username as user_name, c.name as customer_name 
       FROM held_sales h 
       LEFT JOIN users u ON h.user_id = u.id 
       LEFT JOIN customers c ON h.customer_id = c.id 
       WHERE h.id = ?`,
      [result.id]
    );

    res.status(201).json(heldSale);
  } catch (error) {
    console.error('Create held sale error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Delete held sale
router.delete('/:id', authenticateToken, requireTenant, getTenantDb, closeTenantDb, async (req, res) => {
  try {
    await req.db.run('DELETE FROM held_sales WHERE id = ?', [req.params.id]);
    res.json({ message: 'Held sale deleted successfully' });
  } catch (error) {
    console.error('Delete held sale error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
