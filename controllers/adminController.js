const pool = require('../config/db'); // Import database connection
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('password-validator');

// Create a password schema for validation
const passwordSchema = new validator();
passwordSchema
  .is().min(8)                                    // Minimum length 8
  .is().max(100)                                  // Maximum length 100
  .has().uppercase()                              // Must have uppercase letters
  .has().lowercase()                              // Must have lowercase letters
  .has().digits(1)                                // Must have at least one digit
  .has().not().spaces();                          // Should not have spaces

// Note: require('dotenv').config() should be called once in your application's entry point (e.g., server.js), not in controllers.

// Admin registration, login, and management controller
const registerAdmin = async (req, res) => {
  let { name, email, password, institution, role = 'event_admin' } = req.body;

  // 1. Input validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  // 2. Password strength validation
  if (!passwordSchema.validate(password)) {
    return res.status(400).json({
      message: 'Password is not strong enough. It must be at least 8 characters long, and include uppercase, lowercase, and numbers.',
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO admins (name, email, password, institution, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, institution, role]
    );
    console.log('Registration result:', result);
    // Show all admins after registration
    const [admins] = await pool.query('SELECT id, name, email, institution, role FROM admins');
    console.log('Current admins:', admins);
    res.status(201).json({ message: 'Admin registered successfully', adminId: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      // Use 409 Conflict for duplicate entries
      return res.status(409).json({ message: 'An admin with this email already exists.' });
    }
    console.error('Admin registration error:', error);
    res.status(500).json({ message: 'An internal error occurred during registration.' });
  }
};

// Admin login controller
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  // Input validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    // Select only the necessary fields
    const [rows] = await pool.query('SELECT id, password, role FROM admins WHERE email = ?', [email]);
    if (rows.length === 0) {
      // SECURITY: Use a generic error message to prevent user enumeration attacks.
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const admin = rows[0];
    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      // SECURITY: Use a generic error message.
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const payload = { id: admin.id, role: admin.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h', // Use environment variable for expiration
    });

    res.json({ token, role: admin.role });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'An internal error occurred during login.' });
  }
};

// Function to get all admins (Super Admin only)
const getAdmins = async (req, res) => {
  // The role check is handled by middleware in the route, so it's not needed here.
  try {
    // Good practice: Selecting specific columns and excluding the password.
    const [rows] = await pool.query('SELECT id, name, email, institution, role FROM admins');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ message: 'An internal error occurred while fetching admins.' });
  }
};

module.exports = { registerAdmin, loginAdmin, getAdmins };