const pool = require('../config/db'); // Import database connection

// Function to record attendance using QR code data
const recordAttendance = async (req, res) => {
  const { qrData } = req.body;
  try {
    const [userId, eventId] = qrData.split(',').map(part => part.split(':')[1]);
    const [eventRows] = await pool.query('SELECT admin_id FROM events WHERE id = ?', [eventId]);
    if (eventRows.length === 0) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }
    if (req.user.role === 'event_admin' && eventRows[0].admin_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to record attendance for this event' });
    }
    const [result] = await pool.query(
      'INSERT INTO attendance (user_id, event_id, time) VALUES (?, ?, NOW())',
      [userId, eventId]
    );
    const [user] = await pool.query('SELECT name FROM users WHERE id = ?', [userId]);
    res.json({ message: 'Attendance recorded', userName: user[0].name });
  } catch (error) {
    res.status(500).json({ message: 'Error recording attendance', error: error.message });
  }
};

// Function to get attendance records
const getAttendance = async (req, res) => {
  const adminId = req.user.id;
  const role = req.user.role;
  try {
    let query = `
      SELECT u.name AS userName, e.purpose AS eventName, a.time
      FROM attendance a
      JOIN users u ON a.user_id = u.id
      JOIN events e ON a.event_id = e.id
    `;
    let params = [];
    if (role === 'event_admin') {
      query += ' WHERE e.admin_id = ?';
      params.push(adminId);
    }
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance', error: error.message });
  }
};

module.exports = { recordAttendance, getAttendance };