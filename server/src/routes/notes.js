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

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function formatNote(row) {
  if (!row) return null;
  return {
    ...row,
    tags: safeParseJson(row.tags, []),
    is_published: Boolean(row.is_published)
  };
}

// Public Get All Notes
router.get('/', (req, res) => {
  try {
    const showAll = req.query.all === 'true';
    let rows;
    if (showAll) {
      rows = db.prepare('SELECT * FROM notes ORDER BY created_at DESC').all();
    } else {
      rows = db.prepare('SELECT * FROM notes WHERE is_published = 1 ORDER BY created_at DESC').all();
    }
    res.json(rows.map(formatNote));
  } catch (err) {
    console.error('[Notes Get All Error]', err);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Public Get Note by Slug
router.get('/:slug', (req, res) => {
  try {
    const note = db.prepare('SELECT * FROM notes WHERE slug = ?').get(req.params.slug);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(formatNote(note));
  } catch (err) {
    console.error('[Notes Get Slug Error]', err);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// Admin Create Note
router.post('/', requireAdminAuth, (req, res) => {
  try {
    const {
      title,
      short_description,
      category,
      tags,
      content,
      cover_image,
      pdf_attachment,
      is_published = 1,
      slug
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    let finalSlug = slug ? slugify(slug) : slugify(title);
    if (!finalSlug) finalSlug = `note-${Date.now()}`;

    // Ensure unique slug
    let counter = 1;
    let uniqueSlug = finalSlug;
    while (db.prepare('SELECT id FROM notes WHERE slug = ?').get(uniqueSlug)) {
      uniqueSlug = `${finalSlug}-${counter}`;
      counter++;
    }

    const tagsStr = typeof tags === 'object' ? JSON.stringify(tags) : (tags || '[]');
    const stmt = db.prepare(`
      INSERT INTO notes (slug, title, short_description, category, tags, content, cover_image, pdf_attachment, is_published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      uniqueSlug,
      title,
      short_description || '',
      category || 'General',
      tagsStr,
      content || '',
      cover_image || '',
      pdf_attachment || '',
      is_published ? 1 : 0
    );

    const created = db.prepare('SELECT * FROM notes WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({
      success: true,
      note: formatNote(created)
    });
  } catch (err) {
    console.error('[Notes Create Error]', err);
    res.status(500).json({ error: err.message || 'Failed to create note' });
  }
});

// Admin Update Note
router.put('/:id', requireAdminAuth, (req, res) => {
  try {
    const noteId = req.params.id;
    const existing = db.prepare('SELECT * FROM notes WHERE id = ?').get(noteId);
    if (!existing) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const {
      title,
      short_description,
      category,
      tags,
      content,
      cover_image,
      pdf_attachment,
      is_published,
      slug
    } = req.body;

    let finalSlug = existing.slug;
    if (slug && slug !== existing.slug) {
      finalSlug = slugify(slug);
      // Check collision
      const collision = db.prepare('SELECT id FROM notes WHERE slug = ? AND id != ?').get(finalSlug, noteId);
      if (collision) {
        finalSlug = `${finalSlug}-${Date.now()}`;
      }
    }

    const tagsStr = tags !== undefined ? (typeof tags === 'object' ? JSON.stringify(tags) : tags) : existing.tags;

    const stmt = db.prepare(`
      UPDATE notes SET
        slug = ?,
        title = ?,
        short_description = ?,
        category = ?,
        tags = ?,
        content = ?,
        cover_image = ?,
        pdf_attachment = ?,
        is_published = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      finalSlug,
      title !== undefined ? title : existing.title,
      short_description !== undefined ? short_description : existing.short_description,
      category !== undefined ? category : existing.category,
      tagsStr,
      content !== undefined ? content : existing.content,
      cover_image !== undefined ? cover_image : existing.cover_image,
      pdf_attachment !== undefined ? pdf_attachment : existing.pdf_attachment,
      is_published !== undefined ? (is_published ? 1 : 0) : existing.is_published,
      noteId
    );

    const updated = db.prepare('SELECT * FROM notes WHERE id = ?').get(noteId);
    res.json({
      success: true,
      note: formatNote(updated)
    });
  } catch (err) {
    console.error('[Notes Update Error]', err);
    res.status(500).json({ error: err.message || 'Failed to update note' });
  }
});

// Admin Delete Note
router.delete('/:id', requireAdminAuth, (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM notes WHERE id = ?');
    const result = stmt.run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (err) {
    console.error('[Notes Delete Error]', err);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

export default router;
