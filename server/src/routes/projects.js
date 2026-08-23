import express from 'express';
import { db } from '../db.js';
import { requireAdminAuth } from '../middleware/auth.js';

const router = express.Router();

function safeParseJson(str, defaultValue) {
  if (!str) return defaultValue;
  try {
    return JSON.parse(str);
  } catch (e) {
    return defaultValue;
  }
}

function formatProject(row) {
  if (!row) return null;
  return {
    ...row,
    technologies: safeParseJson(row.technologies, [])
  };
}

// Public Get All Projects
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM projects ORDER BY display_order ASC, created_at DESC').all();
    res.json(rows.map(formatProject));
  } catch (err) {
    console.error('[Projects Get Error]', err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Admin Create Project
router.post('/', requireAdminAuth, (req, res) => {
  try {
    const {
      title,
      description,
      technologies,
      github_url,
      demo_url,
      image_url,
      display_order = 0
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Project title is required' });
    }

    const techStr = typeof technologies === 'object' ? JSON.stringify(technologies) : (technologies || '[]');

    const stmt = db.prepare(`
      INSERT INTO projects (title, description, technologies, github_url, demo_url, image_url, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      title,
      description || '',
      techStr,
      github_url || '',
      demo_url || '',
      image_url || '',
      display_order || 0
    );

    const created = db.prepare('SELECT * FROM projects WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({
      success: true,
      project: formatProject(created)
    });
  } catch (err) {
    console.error('[Projects Create Error]', err);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Admin Update Project
router.put('/:id', requireAdminAuth, (req, res) => {
  try {
    const projectId = req.params.id;
    const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
    if (!existing) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const {
      title,
      description,
      technologies,
      github_url,
      demo_url,
      image_url,
      display_order
    } = req.body;

    const techStr = technologies !== undefined ? (typeof technologies === 'object' ? JSON.stringify(technologies) : technologies) : existing.technologies;

    const stmt = db.prepare(`
      UPDATE projects SET
        title = ?,
        description = ?,
        technologies = ?,
        github_url = ?,
        demo_url = ?,
        image_url = ?,
        display_order = ?
      WHERE id = ?
    `);

    stmt.run(
      title !== undefined ? title : existing.title,
      description !== undefined ? description : existing.description,
      techStr,
      github_url !== undefined ? github_url : existing.github_url,
      demo_url !== undefined ? demo_url : existing.demo_url,
      image_url !== undefined ? image_url : existing.image_url,
      display_order !== undefined ? display_order : existing.display_order,
      projectId
    );

    const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
    res.json({
      success: true,
      project: formatProject(updated)
    });
  } catch (err) {
    console.error('[Projects Update Error]', err);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Admin Delete Project
router.delete('/:id', requireAdminAuth, (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM projects WHERE id = ?');
    const result = stmt.run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err) {
    console.error('[Projects Delete Error]', err);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;
