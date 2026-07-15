// Run once to create the default admin account:
//   node seedAdmin.js
const bcrypt = require('bcryptjs');
const pool = require('./config/db');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    const name = process.env.ADMIN_NAME || 'Administrator';
    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin@123';

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      console.log(`Admin account already exists for ${email}. Skipping.`);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'admin']
    );

    console.log('✅ Admin account created successfully!');
    console.log(`   Email:    ${email}`);
    console.log(`   Password: ${password}`);
    console.log('   (Change this password after first login in a real deployment.)');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed admin:', error);
    process.exit(1);
  }
};

seedAdmin();
