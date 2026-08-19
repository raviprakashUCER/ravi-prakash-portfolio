import bcrypt from 'bcryptjs';
import { db } from '../db/connection.js';
import { initSchema } from '../db/schema.js';
import { config } from '../config.js';

initSchema();

const newPassword = process.argv[2] || process.env.ADMIN_PASSWORD;

if (!newPassword || newPassword.trim().length < 6) {
  console.log('Usage: node src/scripts/setupAdmin.js <new_password>');
  console.log('Example: node src/scripts/setupAdmin.js MySecretPass2026!');
  process.exit(1);
}

const email = config.adminEmail;
const username = config.adminDefaultUsername;
const hash = bcrypt.hashSync(newPassword.trim(), 10);

const existing = db.prepare('SELECT id FROM admin_users WHERE LOWER(username) = ? OR LOWER(email) = ?').get(username.toLowerCase(), email.toLowerCase());

if (existing) {
  db.prepare('UPDATE admin_users SET password_hash = ?, email = ? WHERE id = ?').run(hash, email, existing.id);
  console.log(`✔ Admin password updated for ${email} (username: ${username})`);
} else {
  db.prepare('INSERT INTO admin_users (username, email, password_hash) VALUES (?, ?, ?)').run(username, email, hash);
  console.log(`✔ Admin account created for ${email} (username: ${username})`);
}

console.log('You can now log in using either your username or email.');
