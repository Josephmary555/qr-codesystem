const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const uploadMiddleware = require('../middleware/upload');
const { registerUser, importUsers } = require('../controllers/userController'); //import user controller functions


// Register a user (via link, no authentication required)
router.post('/register', registerUser);

// Import users from CSV/Excel (Super Admin or Event Admin)
router.post('/import', authMiddleware, roleMiddleware(['super_admin', 'event_admin']), uploadMiddleware, importUsers);

// Get all users (Super Admin or Event Admin)
router.get('/', authMiddleware, roleMiddleware(['super_admin', 'event_admin']), async (req, res) => {
  try {
    const [users] = await req.app.get('db').query('SELECT id, name, email, event_id, created_at FROM users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

module.exports = router;