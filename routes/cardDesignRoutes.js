const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth'); // Import authentication middleware
const pool = require('../config/db'); // Import database connection

// Save a card design (Super Admin or Event Admin)
// This route allows admins to save a card design template

router.post('/', authMiddleware, roleMiddleware(['super_admin', 'event_admin']), async (req, res) => {
  const { templateName, designJson } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO card_designs (admin_id, template_name, design_json) VALUES (?, ?, ?)',
      [req.user.id, templateName, designJson]
    );
    res.status(201).json({ message: 'Card design saved', designId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Error saving card design', error: error.message });
  }
});

module.exports = router;