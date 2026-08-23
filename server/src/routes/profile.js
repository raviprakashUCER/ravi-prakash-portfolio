import express from 'express';
import { db } from '../db.js';
import { requireAdminAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper to safely parse JSON
function safeParseJson(str, defaultValue) {
  if (!str) return defaultValue;
  try {
    return JSON.parse(str);
  } catch (e) {
    return defaultValue;
  }
}

// Format profile row
function formatProfile(row) {
  if (!row) return null;
  return {
    ...row,
    social_links: safeParseJson(row.social_links, {}),
    skills: safeParseJson(row.skills, [])
  };
}

// Public Get Profile
router.get('/', (req, res) => {
  try {
    const profile = db.prepare('SELECT * FROM profile WHERE id = 1').get();
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(formatProfile(profile));
  } catch (err) {
    console.error('[Profile Get Error]', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Admin Update Profile
router.put('/', requireAdminAuth, (req, res) => {
  try {
    const {
      name,
      headline,
      bio,
      profile_photo,
      location,
      email,
      phone,
      social_links,
      skills
    } = req.body;

    const socialLinksStr = typeof social_links === 'object' ? JSON.stringify(social_links) : (social_links || '{}');
    const skillsStr = typeof skills === 'object' ? JSON.stringify(skills) : (skills || '[]');

    const stmt = db.prepare(`
      INSERT INTO profile (id, name, headline, bio, profile_photo, location, email, phone, social_links, skills, updated_at)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        headline = excluded.headline,
        bio = excluded.bio,
        profile_photo = excluded.profile_photo,
        location = excluded.location,
        email = excluded.email,
        phone = excluded.phone,
        social_links = excluded.social_links,
        skills = excluded.skills,
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(
      name || 'Ravi Prakash',
      headline || '',
      bio || '',
      profile_photo || '',
      location || '',
      email || '',
      phone || '',
      socialLinksStr,
      skillsStr
    );

    const updated = db.prepare('SELECT * FROM profile WHERE id = 1').get();
    res.json({
      success: true,
      profile: formatProfile(updated)
    });
  } catch (err) {
    console.error('[Profile Update Error]', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
