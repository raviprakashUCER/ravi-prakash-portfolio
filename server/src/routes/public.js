import { Router } from 'express';
import { db } from '../db/connection.js';

export const publicRouter = Router();

// 1. Profile, learning journey & socials
publicRouter.get('/profile', (req, res) => {
  try {
    const profile = db.prepare('SELECT * FROM profile LIMIT 1').get();
    if (profile && profile.interests) {
      try {
        profile.interests = JSON.parse(profile.interests);
      } catch (e) {}
    }

    // Check for active resume
    const activeResume = db.prepare('SELECT file_url FROM resumes WHERE is_active = 1 LIMIT 1').get();
    if (activeResume) {
      profile.resume_url = activeResume.file_url;
    }

    const socials = db.prepare('SELECT * FROM social_links WHERE visible = 1 ORDER BY sort_order').all();
    const journey = db.prepare('SELECT * FROM learning_journey WHERE is_public = 1 ORDER BY sort_order').all();

    // Increment profile views
    try {
      db.prepare('UPDATE site_stats SET value = value + 1 WHERE key = ?').run('profile_views');
    } catch (e) {}

    res.json({
      success: true,
      data: {
        profile,
        socials,
        journey
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Skills grouped by category
publicRouter.get('/skills', (req, res) => {
  try {
    const skills = db.prepare('SELECT * FROM skills WHERE is_public = 1 ORDER BY sort_order, name').all();
    
    // Group by category
    const grouped = {};
    for (const skill of skills) {
      if (!grouped[skill.category]) {
        grouped[skill.category] = [];
      }
      grouped[skill.category].push(skill);
    }

    res.json({
      success: true,
      data: {
        skills,
        grouped
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Notes list (with search & category filtering)
publicRouter.get('/notes', (req, res) => {
  try {
    const { search, category } = req.query;
    let query = 'SELECT id, slug, title, description, category, tags, reading_time, difficulty, cover_image_url, attachment_url, attachment_name, views, created_at, updated_at FROM notes WHERE is_public = 1 AND is_published = 1';
    const params = [];

    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ? OR tags LIKE ? OR content_md LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    query += ' ORDER BY created_at DESC';

    const notes = db.prepare(query).all(...params);
    const categories = db.prepare('SELECT DISTINCT category FROM notes WHERE is_public = 1 AND is_published = 1').all().map(c => c.category);

    res.json({
      success: true,
      data: {
        notes,
        categories: ['All', ...categories]
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Single Note by Slug (increments view count)
publicRouter.get('/notes/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const note = db.prepare('SELECT * FROM notes WHERE slug = ? AND is_public = 1').get(slug);

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Increment views
    db.prepare('UPDATE notes SET views = views + 1 WHERE id = ?').run(note.id);

    // Get related notes in same category
    const related = db.prepare('SELECT id, slug, title, description, reading_time, difficulty, cover_image_url FROM notes WHERE category = ? AND id != ? AND is_public = 1 AND is_published = 1 LIMIT 3').all(note.category, note.id);

    res.json({
      success: true,
      data: {
        note,
        related
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Projects
publicRouter.get('/projects', (req, res) => {
  try {
    const projects = db.prepare('SELECT * FROM projects WHERE is_public = 1 ORDER BY sort_order, id DESC').all();
    
    // Parse features JSON & attach gallery images
    for (const p of projects) {
      if (p.features) {
        try {
          p.features = JSON.parse(p.features);
        } catch (e) {
          p.features = [p.features];
        }
      }
      p.images = db.prepare('SELECT * FROM project_images WHERE project_id = ? ORDER BY display_order').all(p.id);
    }

    res.json({
      success: true,
      data: projects
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Single Project by slug
publicRouter.get('/projects/:slug', (req, res) => {
  try {
    const project = db.prepare('SELECT * FROM projects WHERE slug = ? AND is_public = 1').get(req.params.slug);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    if (project.features) {
      try {
        project.features = JSON.parse(project.features);
      } catch (e) {
        project.features = [project.features];
      }
    }
    project.images = db.prepare('SELECT * FROM project_images WHERE project_id = ? ORDER BY display_order').all(project.id);

    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Certifications listing
publicRouter.get('/certifications', (req, res) => {
  try {
    const certs = db.prepare('SELECT * FROM certifications WHERE is_public = 1 ORDER BY issue_date DESC, id DESC').all();
    res.json({ success: true, data: certs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7b. Single Certification by slug or ID
publicRouter.get('/certifications/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    let cert = db.prepare('SELECT * FROM certifications WHERE slug = ? AND is_public = 1').get(slug);
    if (!cert && !isNaN(slug)) {
      cert = db.prepare('SELECT * FROM certifications WHERE id = ? AND is_public = 1').get(slug);
    }

    if (!cert) {
      return res.status(404).json({ error: 'Certification not found' });
    }

    res.json({ success: true, data: cert });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Structured Resume Data
publicRouter.get('/resume', (req, res) => {
  try {
    const profile = db.prepare('SELECT * FROM profile LIMIT 1').get();
    const activeResume = db.prepare('SELECT * FROM resumes WHERE is_active = 1 LIMIT 1').get();
    if (activeResume) {
      profile.resume_url = activeResume.file_url;
    }

    const skills = db.prepare('SELECT * FROM skills WHERE is_public = 1 ORDER BY category, sort_order').all();
    const projects = db.prepare('SELECT * FROM projects WHERE is_public = 1 ORDER BY sort_order').all();
    const certs = db.prepare('SELECT * FROM certifications WHERE is_public = 1 ORDER BY issue_date DESC').all();
    const education = db.prepare('SELECT * FROM education WHERE is_public = 1').all();
    const journey = db.prepare('SELECT * FROM learning_journey WHERE is_public = 1 ORDER BY sort_order').all();
    const socials = db.prepare('SELECT * FROM social_links WHERE visible = 1 ORDER BY sort_order').all();

    for (const p of projects) {
      if (p.features) {
        try { p.features = JSON.parse(p.features); } catch (e) {}
      }
      p.images = db.prepare('SELECT * FROM project_images WHERE project_id = ? ORDER BY display_order').all(p.id);
    }

    res.json({
      success: true,
      data: {
        profile,
        activeResume,
        education,
        skills,
        projects,
        certs,
        journey,
        socials
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Contact Message Submission
publicRouter.post('/contact', (req, res) => {
  try {
    const { name, email, subject, message, honeypot } = req.body;

    if (honeypot) {
      return res.json({ success: true, message: 'Message sent successfully' });
    }

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Please provide Name, Email, and Message.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    db.prepare(`
      INSERT INTO messages (name, email, subject, message)
      VALUES (?, ?, ?, ?)
    `).run(name.trim(), email.trim(), (subject || 'Portfolio Inquiry').trim(), message.trim());

    res.json({
      success: true,
      message: 'Thank you for reaching out! Ravi has received your message.'
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message. Please try again later.' });
  }
});
