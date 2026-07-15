const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
};

// @route  POST /api/auth/register
// @desc   Register a new normal user (role is always forced to 'user' here;
//         admins are created via seed script, not public registration)
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'user']
    );

    const user = { id: result.insertId, name, email, role: 'user' };
    const token = generateToken(user);

    res.status(201).json({ message: 'Registration successful.', token, user });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// @route  POST /api/auth/login
// @desc   Login for both admin and normal users
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const userRecord = rows[0];
    const isMatch = await bcrypt.compare(password, userRecord.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      role: userRecord.role
    };
    const token = generateToken(user);

    res.status(200).json({ message: 'Login successful.', token, user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// @route  POST /api/auth/logout
// @desc   Blacklist the current token so it can no longer be used
const logout = async (req, res) => {
  try {
    const token = req.token;
    const decoded = jwt.decode(token);
    const expiresAt = new Date(decoded.exp * 1000);

    await pool.query(
      'INSERT INTO token_blacklist (token, expires_at) VALUES (?, ?)',
      [token, expiresAt]
    );

    res.status(200).json({ message: 'Logged out successfully.' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout.' });
  }
};

// @route  GET /api/auth/me
// @desc   Get the currently authenticated user
const getMe = async (req, res) => {
  res.status(200).json({ user: req.user });
};

module.exports = { register, login, logout, getMe };
