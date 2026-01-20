const bcrypt = require('bcryptjs');
const { masterDbHelpers, ensureInitialized } = require('./tenantManager');

async function setupSuperAdmin() {
  try {
    // Ensure database tables are initialized first
    console.log('Initializing master database...');
    await ensureInitialized();
    console.log('✅ Master database ready');

    const username = process.env.SUPER_ADMIN_USERNAME || 'superadmin';
    const password = process.env.SUPER_ADMIN_PASSWORD || 'superadmin123';
    const email = process.env.SUPER_ADMIN_EMAIL || 'admin@restaurant-pos.com';
    const fullName = process.env.SUPER_ADMIN_NAME || 'Super Administrator';

    // Check if super admin already exists
    const existing = await masterDbHelpers.get(
      'SELECT * FROM super_admins WHERE username = ?',
      [username]
    );

    if (existing) {
      console.log('Super admin already exists. Updating password...');
      const hashedPassword = await bcrypt.hash(password, 10);
      await masterDbHelpers.run(
        'UPDATE super_admins SET password = ?, email = ?, full_name = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ?',
        [hashedPassword, email, fullName, username]
      );
      console.log('✅ Super admin password updated successfully!');
    } else {
      console.log('Creating new super admin...');
      const hashedPassword = await bcrypt.hash(password, 10);
      await masterDbHelpers.run(
        'INSERT INTO super_admins (username, password, email, full_name) VALUES (?, ?, ?, ?)',
        [username, hashedPassword, email, fullName]
      );
      console.log('✅ Super admin created successfully!');
    }

    console.log('\n📝 Super Admin Login Credentials:');
    console.log('   Username:', username);
    console.log('   Password:', password);
    console.log('   Tenant Code: (leave empty)');
    console.log('\n⚠️  Please change this password after first login for security!');
    console.log('\n💡 To change credentials, set environment variables:');
    console.log('   SUPER_ADMIN_USERNAME=your_username');
    console.log('   SUPER_ADMIN_PASSWORD=your_password');
    console.log('   SUPER_ADMIN_EMAIL=your_email@example.com');
    console.log('   SUPER_ADMIN_NAME=Your Name');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up super admin:', error);
    process.exit(1);
  }
}

setupSuperAdmin();
