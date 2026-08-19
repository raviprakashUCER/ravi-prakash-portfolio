import { Router } from 'express';
import { db } from '../db/connection.js';
import { verifyAdmin } from './auth.js';

export const adminRouter = Router();

// Protect all admin routes with JWT verification
adminRouter.use(verifyAdmin);

// 1. Dashboard Metrics & Stats
adminRouter.get('/stats', (req, res) => {
  try {
    const totalNotes = db.prepare('SELECT COUNT(*) as count FROM notes').get().count;
    const totalProjects = db.prepare('SELECT COUNT(*) as count FROM projects').get().count;
    const totalSkills = db.prepare('SELECT COUNT(*) as count FROM skills').get().count;
    const totalCerts = db.prepare('SELECT COUNT(*) as count FROM certifications').get().count;
    const totalSocials = db.prepare('SELECT COUNT(*) as count FROM social_links').get().count;
    const totalAIEntries = db.prepare('SELECT COUNT(*) as count FROM ai_knowledge').get().count;
    const totalMediaFiles = db.prepare('SELECT COUNT(*) as count FROM media_files').get()?.count || 0;
    const unreadMessages = db.prepare('SELECT COUNT(*) as count FROM messages WHERE is_read = 0').get().count;
    const totalMessages = db.prepare('SELECT COUNT(*) as count FROM messages').get().count;
    const profileViews = db.prepare("SELECT value FROM site_stats WHERE key = 'profile_views'").get()?.value || 0;

    res.json({
      success: true,
      stats: {
        totalNotes,
        totalProjects,
        totalSkills,
        totalCerts,
        totalSocials,
        totalAIEntries,
        totalMediaFiles,
        unreadMessages,
        totalMessages,
        profileViews
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Profile Management
adminRouter.get('/profile', (req, res) => {
  const profile = db.prepare('SELECT * FROM profile LIMIT 1').get();
  res.json({ success: true, profile });
});

adminRouter.put('/profile', (req, res) => {
  try {
    const { name, headline, bio, location, email, phone, avatar_url, resume_url, current_focus, career_goal, interests } = req.body;
    
    const interestsStr = Array.isArray(interests) ? JSON.stringify(interests) : (interests || '[]');

    db.prepare(`
      UPDATE profile SET
        name = ?, headline = ?, bio = ?, location = ?, email = ?, phone = ?,
        avatar_url = ?, resume_url = ?, current_focus = ?, career_goal = ?, interests = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `).run(name, headline, bio, location, email, phone, avatar_url, resume_url, current_focus, career_goal, interestsStr);

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Notes CRUD
adminRouter.get('/notes', (req, res) => {
  const notes = db.prepare('SELECT * FROM notes ORDER BY created_at DESC').all();
  res.json({ success: true, notes });
});

adminRouter.post('/notes', (req, res) => {
  try {
    const { title, slug, description, category, tags, content_md, reading_time, difficulty, cover_image_url, attachment_url, attachment_name, is_public, is_published } = req.body;
    let finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const existing = db.prepare('SELECT id FROM notes WHERE slug = ?').get(finalSlug);
    if (existing) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    const result = db.prepare(`
      INSERT INTO notes (title, slug, description, category, tags, content_md, reading_time, difficulty, cover_image_url, attachment_url, attachment_name, is_public, is_published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      title,
      finalSlug,
      description,
      category,
      tags,
      content_md,
      reading_time || '5 min read',
      difficulty || 'Beginner',
      cover_image_url || null,
      attachment_url || null,
      attachment_name || null,
      is_public !== false ? 1 : 0,
      is_published !== false ? 1 : 0
    );

    res.json({ success: true, id: result.lastInsertRowid, slug: finalSlug });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.put('/notes/:id', (req, res) => {
  try {
    const { title, slug, description, category, tags, content_md, reading_time, difficulty, cover_image_url, attachment_url, attachment_name, is_public, is_published } = req.body;
    db.prepare(`
      UPDATE notes SET
        title = ?, slug = ?, description = ?, category = ?, tags = ?,
        content_md = ?, reading_time = ?, difficulty = ?,
        cover_image_url = ?, attachment_url = ?, attachment_name = ?,
        is_public = ?, is_published = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title,
      slug,
      description,
      category,
      tags,
      content_md,
      reading_time,
      difficulty,
      cover_image_url || null,
      attachment_url || null,
      attachment_name || null,
      is_public ? 1 : 0,
      is_published ? 1 : 0,
      req.params.id
    );

    res.json({ success: true, message: 'Note updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.delete('/notes/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM notes WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Projects CRUD & Project Images
adminRouter.get('/projects', (req, res) => {
  const projects = db.prepare('SELECT * FROM projects ORDER BY sort_order, id DESC').all();
  for (const p of projects) {
    p.images = db.prepare('SELECT * FROM project_images WHERE project_id = ? ORDER BY display_order').all(p.id);
  }
  res.json({ success: true, projects });
});

adminRouter.post('/projects', (req, res) => {
  try {
    const { title, slug, description, problem, solution, features, technologies, status, thumbnail_url, doc_url, github_url, demo_url, lessons_learned, image_url, sort_order, is_public, images = [] } = req.body;
    let finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const existing = db.prepare('SELECT id FROM projects WHERE slug = ?').get(finalSlug);
    if (existing) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }
    const featStr = Array.isArray(features) ? JSON.stringify(features) : (features || '[]');

    const result = db.prepare(`
      INSERT INTO projects (title, slug, description, problem, solution, features, technologies, status, thumbnail_url, doc_url, github_url, demo_url, lessons_learned, image_url, sort_order, is_public)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(title, finalSlug, description, problem, solution, featStr, technologies, status || 'Completed', thumbnail_url || null, doc_url || null, github_url, demo_url, lessons_learned, image_url, sort_order || 0, is_public !== false ? 1 : 0);

    const projectId = result.lastInsertRowid;

    // Insert associated images
    if (Array.isArray(images) && images.length > 0) {
      const imgStmt = db.prepare(`
        INSERT INTO project_images (project_id, media_file_id, image_url, caption, display_order)
        VALUES (?, ?, ?, ?, ?)
      `);
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        imgStmt.run(projectId, img.media_file_id || null, img.image_url, img.caption || '', i);
      }
    }

    res.json({ success: true, id: projectId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.put('/projects/:id', (req, res) => {
  try {
    const { title, slug, description, problem, solution, features, technologies, status, thumbnail_url, doc_url, github_url, demo_url, lessons_learned, image_url, sort_order, is_public, images } = req.body;
    const featStr = Array.isArray(features) ? JSON.stringify(features) : (features || '[]');

    db.prepare(`
      UPDATE projects SET
        title = ?, slug = ?, description = ?, problem = ?, solution = ?,
        features = ?, technologies = ?, status = ?, thumbnail_url = ?, doc_url = ?,
        github_url = ?, demo_url = ?, lessons_learned = ?, image_url = ?,
        sort_order = ?, is_public = ?
      WHERE id = ?
    `).run(title, slug, description, problem, solution, featStr, technologies, status, thumbnail_url || null, doc_url || null, github_url, demo_url, lessons_learned, image_url, sort_order || 0, is_public ? 1 : 0, req.params.id);

    if (Array.isArray(images)) {
      db.prepare('DELETE FROM project_images WHERE project_id = ?').run(req.params.id);
      const imgStmt = db.prepare(`
        INSERT INTO project_images (project_id, media_file_id, image_url, caption, display_order)
        VALUES (?, ?, ?, ?, ?)
      `);
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        imgStmt.run(req.params.id, img.media_file_id || null, img.image_url, img.caption || '', i);
      }
    }

    res.json({ success: true, message: 'Project updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.delete('/projects/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM project_images WHERE project_id = ?').run(req.params.id);
    db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Skills CRUD
adminRouter.get('/skills', (req, res) => {
  const skills = db.prepare('SELECT * FROM skills ORDER BY category, sort_order, name').all();
  res.json({ success: true, skills });
});

adminRouter.post('/skills', (req, res) => {
  try {
    const { name, category, level, description, icon, sort_order, is_public } = req.body;
    const result = db.prepare(`
      INSERT INTO skills (name, category, level, description, icon, sort_order, is_public)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(name, category, level, description, icon, sort_order || 0, is_public !== false ? 1 : 0);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.put('/skills/:id', (req, res) => {
  try {
    const { name, category, level, description, icon, sort_order, is_public } = req.body;
    db.prepare(`
      UPDATE skills SET
        name = ?, category = ?, level = ?, description = ?,
        icon = ?, sort_order = ?, is_public = ?
      WHERE id = ?
    `).run(name, category, level, description, icon, sort_order || 0, is_public ? 1 : 0, req.params.id);
    res.json({ success: true, message: 'Skill updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.delete('/skills/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM skills WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Skill deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Certifications CRUD
adminRouter.get('/certifications', (req, res) => {
  const certs = db.prepare('SELECT * FROM certifications ORDER BY issue_date DESC').all();
  res.json({ success: true, certs });
});

adminRouter.post('/certifications', (req, res) => {
  try {
    const { title, slug, organization, issue_date, expiry_date, credential_id, credential_url, certificate_file_url, image_url, description, skills, is_public } = req.body;
    let finalSlug = slug || (title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : 'cert-' + Date.now());
    
    const existing = db.prepare('SELECT id FROM certifications WHERE slug = ?').get(finalSlug);
    if (existing) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    const result = db.prepare(`
      INSERT INTO certifications (title, slug, organization, issue_date, expiry_date, credential_id, credential_url, certificate_file_url, image_url, description, skills, is_public)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      title,
      finalSlug,
      organization,
      issue_date || 'Completed',
      expiry_date || null,
      credential_id || null,
      credential_url || null,
      certificate_file_url || null,
      image_url || null,
      description || null,
      skills || null,
      is_public !== false ? 1 : 0
    );
    res.json({ success: true, id: result.lastInsertRowid, slug: finalSlug });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.put('/certifications/:id', (req, res) => {
  try {
    const { title, slug, organization, issue_date, expiry_date, credential_id, credential_url, certificate_file_url, image_url, description, skills, is_public } = req.body;
    db.prepare(`
      UPDATE certifications SET
        title = ?, slug = ?, organization = ?, issue_date = ?, expiry_date = ?,
        credential_id = ?, credential_url = ?, certificate_file_url = ?,
        image_url = ?, description = ?, skills = ?, is_public = ?
      WHERE id = ?
    `).run(
      title,
      slug,
      organization,
      issue_date,
      expiry_date || null,
      credential_id || null,
      credential_url || null,
      certificate_file_url || null,
      image_url || null,
      description || null,
      skills || null,
      is_public ? 1 : 0,
      req.params.id
    );
    res.json({ success: true, message: 'Certification updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.delete('/certifications/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM certifications WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Certification deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Resumes Management
adminRouter.get('/resumes', (req, res) => {
  try {
    const resumes = db.prepare('SELECT * FROM resumes ORDER BY uploaded_at DESC').all();
    res.json({ success: true, resumes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.post('/resumes', (req, res) => {
  try {
    const { version_name, file_url, media_file_id, is_active } = req.body;
    if (!file_url) {
      return res.status(400).json({ error: 'File URL is required for resume' });
    }

    if (is_active) {
      db.prepare('UPDATE resumes SET is_active = 0').run();
      db.prepare('UPDATE profile SET resume_url = ? WHERE id = 1').run(file_url);
    }

    const result = db.prepare(`
      INSERT INTO resumes (version_name, file_url, media_file_id, is_active)
      VALUES (?, ?, ?, ?)
    `).run(version_name || 'Resume ' + new Date().toLocaleDateString(), file_url, media_file_id || null, is_active ? 1 : 0);

    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.put('/resumes/:id/active', (req, res) => {
  try {
    const resume = db.prepare('SELECT * FROM resumes WHERE id = ?').get(req.params.id);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    db.prepare('UPDATE resumes SET is_active = 0').run();
    db.prepare('UPDATE resumes SET is_active = 1 WHERE id = ?').run(req.params.id);
    db.prepare('UPDATE profile SET resume_url = ? WHERE id = 1').run(resume.file_url);

    res.json({ success: true, message: 'Active resume updated', file_url: resume.file_url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.delete('/resumes/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM resumes WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Resume deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Social Links CRUD
adminRouter.get('/socials', (req, res) => {
  const socials = db.prepare('SELECT * FROM social_links ORDER BY sort_order').all();
  res.json({ success: true, socials });
});

adminRouter.post('/socials', (req, res) => {
  try {
    const { platform, username, url, icon, visible, sort_order } = req.body;
    const result = db.prepare(`
      INSERT INTO social_links (platform, username, url, icon, visible, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(platform, username, url, icon, visible !== false ? 1 : 0, sort_order || 0);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.put('/socials/:id', (req, res) => {
  try {
    const { platform, username, url, icon, visible, sort_order } = req.body;
    db.prepare(`
      UPDATE social_links SET
        platform = ?, username = ?, url = ?, icon = ?,
        visible = ?, sort_order = ?
      WHERE id = ?
    `).run(platform, username, url, icon, visible ? 1 : 0, sort_order || 0, req.params.id);
    res.json({ success: true, message: 'Social link updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.delete('/socials/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM social_links WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Social link deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. AI Knowledge Base Management
adminRouter.get('/ai-knowledge', (req, res) => {
  const items = db.prepare('SELECT * FROM ai_knowledge ORDER BY id DESC').all();
  res.json({ success: true, items });
});

adminRouter.post('/ai-knowledge', (req, res) => {
  try {
    const { key, category, content, is_public } = req.body;
    const result = db.prepare(`
      INSERT INTO ai_knowledge (key, category, content, is_public)
      VALUES (?, ?, ?, ?)
    `).run(key, category, content, is_public !== false ? 1 : 0);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.put('/ai-knowledge/:id', (req, res) => {
  try {
    const { key, category, content, is_public } = req.body;
    db.prepare(`
      UPDATE ai_knowledge SET
        key = ?, category = ?, content = ?, is_public = ?
      WHERE id = ?
    `).run(key, category, content, is_public ? 1 : 0, req.params.id);
    res.json({ success: true, message: 'AI Knowledge updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.delete('/ai-knowledge/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM ai_knowledge WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'AI Knowledge deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Contact Messages Viewer
adminRouter.get('/messages', (req, res) => {
  const messages = db.prepare('SELECT * FROM messages ORDER BY created_at DESC').all();
  res.json({ success: true, messages });
});

adminRouter.put('/messages/:id/read', (req, res) => {
  try {
    db.prepare('UPDATE messages SET is_read = 1 WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

adminRouter.delete('/messages/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM messages WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
