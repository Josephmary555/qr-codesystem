const pool = require('../config/db'); // Import database connection
const xlsx = require('xlsx'); // Import xlsx for Excel file handling
const { sendRegistrationConfirmation } = require('./notificationController');
const fs = require('fs').promises; // For cleaning up the uploaded file

// User registration and import controller
const registerUser = async (req, res) => {
  const { name, email, eventId } = req.body;

  // 1. Input validation
  if (!name || !email || !eventId) {
    return res.status(400).json({ message: 'Name, email, and event ID are required.' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address.' });
  }

  let connection;
  try {
    // Use a transaction for data integrity
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 2. Check if the event exists
    const [eventRows] = await connection.query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (eventRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Event not found.' });
    }
    const event = eventRows[0];

    // 3. Check if the user is already registered for this event
    const [existingUser] = await connection.query(
      'SELECT id FROM users WHERE email = ? AND event_id = ?',
      [email, eventId]
    );
    if (existingUser.length > 0) {
      await connection.rollback();
      return res.status(409).json({ message: 'This email is already registered for this event.' });
    }

    // 4. Insert the new user
    const [result] = await connection.query(
      'INSERT INTO users (name, email, event_id) VALUES (?, ?, ?)',
      [name, email, eventId]
    );
    const userId = result.insertId;

    // Commit the transaction
    await connection.commit();

    // 5. Send confirmation email asynchronously after successful registration
    const user = { id: userId, name, email };
    sendRegistrationConfirmation(user, event).catch(err => {
      // Log the error but don't make the HTTP request fail, as registration is complete.
      console.error("Failed to send confirmation email in the background:", err);
    });

    res.status(201).json({ message: 'User registered successfully. Please check your email for the QR code.', userId });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('User registration error:', error);
    res.status(500).json({ message: 'An internal error occurred during registration.' });
  } finally {
    if (connection) connection.release();
  }
};

// Import users from CSV/Excel file
const importUsers = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const usersToImport = xlsx.utils.sheet_to_json(sheet);

    if (usersToImport.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'The uploaded file is empty or in an invalid format.' });
    }

    const validationErrors = [];
    const successfulImports = [];

    for (const [index, user] of usersToImport.entries()) {
      const { name, email, eventId } = user;
      const rowNum = index + 2; // For user-friendly error messages (assuming a header row)

      // 1. Validate data from the file
      if (!name || !email || !eventId) {
        validationErrors.push(`Row ${rowNum}: Missing required fields (name, email, eventId).`);
        continue;
      }

      // 2. Check event existence and user duplication
      const [eventRows] = await connection.query('SELECT * FROM events WHERE id = ?', [eventId]);
      if (eventRows.length === 0) {
        validationErrors.push(`Row ${rowNum}: Event with ID ${eventId} not found.`);
        continue;
      }
      const [existingUser] = await connection.query(
        'SELECT id FROM users WHERE email = ? AND event_id = ?',
        [email, eventId]
      );
      if (existingUser.length > 0) {
        validationErrors.push(`Row ${rowNum}: User with email ${email} is already registered for this event.`);
        continue;
      }

      // 3. Insert user within the transaction
      const [result] = await connection.query(
        'INSERT INTO users (name, email, event_id) VALUES (?, ?, ?)',
        [name, email, eventId]
      );
      const newUser = { id: result.insertId, name, email };
      successfulImports.push({ user: newUser, event: eventRows[0] });
    }

    // If any row failed validation, roll back the entire import
    if (validationErrors.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        message: 'Import failed due to validation errors. No users were imported.',
        errors: validationErrors,
      });
    }

    await connection.commit();

    // 4. Send confirmation emails after the transaction is successfully committed
    for (const { user, event } of successfulImports) {
      sendRegistrationConfirmation(user, event).catch(err => {
        console.error(`Failed to send confirmation email to ${user.email} during bulk import:`, err);
      });
    }

    res.status(201).json({ message: `${successfulImports.length} users imported successfully.` });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('User import error:', error);
    res.status(500).json({ message: 'An internal error occurred during user import.' });
  } finally {
    if (connection) connection.release();
    // 5. Clean up the uploaded file
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(err => console.error("Error deleting uploaded file:", err));
    }
  }
};

module.exports = { registerUser, importUsers };