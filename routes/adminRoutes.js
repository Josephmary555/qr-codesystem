const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth'); // Import authentication middleware
const {
  registerAdmin,
  loginAdmin,
  getAdmins,
} = require('../controllers/adminController'); // Import controller functions

// Register a new admin (public route, no super admin protection)
router.post('/register', registerAdmin);

// Login an admin (public route)
router.post('/login', loginAdmin);

// Get all admins (Super Admin only)
router.get('/', authMiddleware, roleMiddleware(['super_admin']), getAdmins);

module.exports = router;