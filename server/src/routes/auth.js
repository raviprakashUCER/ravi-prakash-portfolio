import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/connection.js';
import { config } from '../config.js';

export const authRouter = Router();

// 1. Check if first-admin setup is required
authRouter.get('/setup-status', (req, res) => {
  try {
    const adminCount = db.prepare('SELECT COUNT(*) as count FROM admin_users').get()?.count || 0;
    const needsSetup = adminCount === 0;

    res.json({
      success: true,
      needsSetup,
      adminEmail: config.adminEmail,
      defaultUsername: config.adminDefaultUsername
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. First-Admin Setup (Creates the initial admin account securely)
authRouter.post('/setup', (req, res) => {
  try {
    const adminCount = db.prepare('SELECT COUNT(*) as count FROM admin_users').get()?.count || 0;
    const { password, username, email } = req.body;

    if (adminCount > 0) {
      return res.status(403).json({ error: 'Admin account is already configured. Please log in or reset via terminal.' });
    }

    if (!password || password.trim().length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const finalUsername = (username || config.adminDefaultUsername).trim().toLowerCase();
    const finalEmail = (email || config.adminEmail).trim().toLowerCase();
    const passwordHash = bcrypt.hashSync(password.trim(), 10);

    const result = db.prepare(`
      INSERT INTO admin_users (username, email, password_hash)
      VALUES (?, ?, ?)
    `).run(finalUsername, finalEmail, passwordHash);

    const token = jwt.sign(
      { id: result.lastInsertRowid, username: finalUsername, email: finalEmail, role: 'admin' },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Admin account created successfully! You are now logged in.',
      token,
      user: { id: result.lastInsertRowid, username: finalUsername, email: finalEmail }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to initialize admin: ' + err.message });
  }
});

// 3. Admin Login (Supports both Username and Email)
authRouter.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username/email and password required.' });
    }

    const cleanIdentifier = username.trim().toLowerCase();

    // Look up by username OR email
    const user = db.prepare(`
      SELECT * FROM admin_users
      WHERE LOWER(username) = ? OR LOWER(email) = ?
      LIMIT 1
    `).get(cleanIdentifier, cleanIdentifier);

    if (!user) {
      return res.status(401).json({ error: 'Invalid username/email or password.' });
    }

    const isValid = bcrypt.compareSync(password.trim(), user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid username/email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: 'admin' },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. Development Password Reset Utility
authRouter.post('/dev-reset-password', (req, res) => {
  try {
    const { newPassword, confirmEmail } = req.body;
    if (!newPassword || newPassword.trim().length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const targetEmail = (confirmEmail || config.adminEmail).trim().toLowerCase();
    const targetUsername = config.adminDefaultUsername.toLowerCase();
    const newHash = bcrypt.hashSync(newPassword.trim(), 10);

    const existing = db.prepare('SELECT id FROM admin_users WHERE LOWER(email) = ? OR LOWER(username) = ? LIMIT 1').get(targetEmail, targetUsername);
    if (existing) {
      db.prepare('UPDATE admin_users SET password_hash = ?, email = ? WHERE id = ?').run(newHash, targetEmail, existing.id);
    } else {
      db.prepare('INSERT INTO admin_users (username, email, password_hash) VALUES (?, ?, ?)').run(targetUsername, targetEmail, newHash);
    }

    return res.json({
      success: true,
      message: `Password updated successfully for ${targetEmail} (${targetUsername}). You can now log in.`
    });
  } catch (err) {
    return res.status(500).json({ error: 'Reset failed: ' + err.message });
  }
});

// 5. Middleware to verify JWT for admin routes
export function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please log in as administrator.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired session. Please log in again.' });
  }
}

// 6. Verify current token check
authRouter.get('/me', verifyAdmin, (req, res) => {
  res.json({ success: true, user: req.user });
});

// 7. Change admin password (Authenticated)
authRouter.post('/change-password', verifyAdmin, (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(req.user.id);
    if (!user || !bcrypt.compareSync(currentPassword, user.password_hash)) {
      return res.status(401).json({ error: 'Incorrect current password' });
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?').run(newHash, req.user.id);

    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password change error:', err);
    return res.status(500).json({ error: 'Failed to update password' });
  }
});
