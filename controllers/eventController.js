
const pool = require('../config/db');
const { generateQRCode } = require('../utils/qrCode');

const createEvent = async (req, res) => {
  const { purpose, date, location } = req.body;
  const adminId = req.user.id; // Injected by authMiddleware

  if (!purpose) {
    return res.status(400).json({ message: 'Event purpose is required.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Insert the event
    const [result] = await connection.query(
      'INSERT INTO events (purpose, date, location, admin_id) VALUES (?, ?, ?, ?)',
      [purpose, date || null, location || null, adminId]
    );
    const eventId = result.insertId;

    // 2. Generate registration link and QR code
    const registrationLink = `${process.env.FRONTEND_URL || 'http://localhost:3002'}/register/${eventId}`;
    const qrCode = await generateQRCode(eventId, 'event');

    // 3. Store registration link and QR code in event_registration_links
    await connection.query(
      'INSERT INTO event_registration_links (event_id, registration_link, qr_code) VALUES (?, ?, ?)',
      [eventId, registrationLink, qrCode]
    );

    await connection.commit();
    console.log('Event registration link:', registrationLink);
    res.status(201).json({ message: 'Event created successfully', eventId, registrationLink, qrCode });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'An internal error occurred while creating the event.' });
  } finally {
    if (connection) connection.release();
  }
};

const getEvents = async (req, res) => {
  const { id: adminId, role } = req.user; // Injected by authMiddleware

  try {
    let query = 'SELECT id, purpose, date, location, admin_id FROM events';
    const queryParams = [];

    // Scope events to the admin unless they are a super_admin
    if (role !== 'super_admin') {
      query += ' WHERE admin_id = ?';
      queryParams.push(adminId);
    }

    query += ' ORDER BY date DESC, id DESC';

    const [events] = await pool.query(query, queryParams);
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'An internal error occurred while fetching events.' });
  }
};

const getEventById = async (req, res) => {
  const { id: eventId } = req.params;
  const { id: adminId, role } = req.user;

  try {
    // 1. Fetch the event and verify ownership
    const [eventRows] = await pool.query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (eventRows.length === 0) {
      return res.status(404).json({ message: 'Event not found.' });
    }
    const event = eventRows[0];

    // Authorization check: only the creating admin or a super_admin can view
    if (event.admin_id !== adminId && role !== 'super_admin') {
      return res.status(403).json({ message: 'You are not authorized to view this event.' });
    }

    // 2. Fetch registered users for this event
    const [users] = await pool.query('SELECT id, name, email FROM users WHERE event_id = ? ORDER BY name ASC', [eventId]);

    // 3. Combine and send the response
    res.json({ ...event, users });
  } catch (error) {
    console.error(`Error fetching event ${eventId}:`, error);
    res.status(500).json({ message: 'An internal error occurred while fetching event details.' });
  }
};

module.exports = { createEvent, getEvents, getEventById };