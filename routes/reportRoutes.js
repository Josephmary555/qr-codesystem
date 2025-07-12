const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth'); // Import authentication middleware
const { exportReport } = require('../controllers/reportController'); // Import report controller functions

// Export attendance report (PDF or Excel, Super Admin or Event Admin)
router.get('/export', authMiddleware, roleMiddleware(['super_admin', 'event_admin']), exportReport);

module.exports = router;