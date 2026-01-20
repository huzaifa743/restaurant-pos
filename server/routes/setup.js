const express = require('express');
const router = express.Router();

// Auto-setup endpoint (can be called to initialize demo tenant if missing)
router.post('/auto-setup-demo', async (req, res) => {
  try {
    const { setupDemoTenant } = require('../setup-demo-tenant');
    
    // Check if demo tenant already exists
    const { masterDbHelpers } = require('../tenantManager');
    const existing = await masterDbHelpers.get('SELECT * FROM tenants WHERE tenant_code = ?', ['DEMO']);
    
    if (existing) {
      return res.json({ 
        message: 'Demo tenant already exists',
        tenant_code: 'DEMO',
        username: 'demo',
        password: 'demo123'
      });
    }
    
    // Run setup in background (non-blocking)
    const { spawn } = require('child_process');
    const setupProcess = spawn('npm', ['run', 'setup-demo'], {
      cwd: require('path').join(__dirname, '../..'),
      detached: true,
      stdio: 'ignore'
    });
    setupProcess.unref();
    
    res.json({ 
      message: 'Demo tenant setup started. Please wait a moment and try logging in again.',
      tenant_code: 'DEMO',
      username: 'demo',
      password: 'demo123'
    });
  } catch (error) {
    console.error('Auto-setup error:', error);
    res.status(500).json({ 
      error: 'Setup failed. Please run manually: npm run setup-demo',
      details: error.message 
    });
  }
});

module.exports = router;
