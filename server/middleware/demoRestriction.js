// Middleware to prevent modifications in demo tenant
// Demo accounts (demo and cashier in DEMO tenant) should only be able to view data
const preventDemoModifications = (req, res, next) => {
  // Check if user is in DEMO tenant
  if (req.user && req.user.tenant_code === 'DEMO') {
    // Allow demo owner to make modifications, but restrict demo and cashier users
    const restrictedUsers = ['demo', 'cashier'];
    if (restrictedUsers.includes(req.user.username.toLowerCase())) {
      return res.status(403).json({ 
        error: 'Demo account restrictions: This is a read-only demo account. You cannot add, edit, or delete data.',
        demo_restriction: true
      });
    }
  }
  next();
};

module.exports = { preventDemoModifications };
