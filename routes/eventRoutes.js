const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { createEvent, getEvents, getEventById } = require('../controllers/eventController');

// POST /api/events - Create a new event
router.post('/', authMiddleware, createEvent);

// GET /api/events - Get all events for the logged-in admin
router.get('/', authMiddleware, getEvents);

// GET /api/events/:id - Get a single event by ID
router.get('/:id', authMiddleware, getEventById);

module.exports = router;