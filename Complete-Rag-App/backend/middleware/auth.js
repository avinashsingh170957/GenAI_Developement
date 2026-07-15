const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

// Verify JWT token from Authorization header, and reject blacklisted (logged-out) tokens
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Check if token has been blacklisted (user logged out)
    const [rows] = await pool.query(
      'SELECT id FROM token_blacklist WHERE token = ?',
      [token]
    );
    if (rows.length > 0) {
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token.' });
      }
      req.user = decoded; // { id, name, email, role }
      req.token = token;
      next();
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error during authentication.' });
  }
};

// Only allow admins
const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

module.exports = { authenticateToken, authorizeAdmin };
