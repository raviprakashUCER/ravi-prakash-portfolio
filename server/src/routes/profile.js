import express from 'express';
import { supabase } from '../supabase.js';
import { requireAdminAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper to safely parse JSON if it comes as a string (from SQLite legacy) or pass through if object
function safeParseJson(data, defaultValue) {
  if (!data) return defaultValue;
  if (typeof data === 'object') return data;
  try {
    return JSON.parse(data);
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
router.get('/', async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('profile')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error) {
      console.error('[Profile Get Error]', error);
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }

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
router.put('/', requireAdminAuth, async (req, res) => {
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

    const parsedSocialLinks = typeof social_links === 'string' ? safeParseJson(social_links, {}) : (social_links || {});
    const parsedSkills = typeof skills === 'string' ? safeParseJson(skills, []) : (skills || []);

    const updatePayload = {
      id: 1,
      name: name || 'Ravi Prakash',
      headline: headline || '',
      bio: bio || '',
      profile_photo: profile_photo || '',
      location: location || '',
      email: email || '',
      phone: phone || '',
      social_links: parsedSocialLinks,
      skills: parsedSkills,
      updated_at: new Date().toISOString()
    };

    const { data: updated, error } = await supabase
      .from('profile')
      .upsert(updatePayload)
      .select()
      .single();

    if (error) {
      console.error('[Profile Update Error]', error);
      return res.status(500).json({ error: 'Failed to update profile' });
    }

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
