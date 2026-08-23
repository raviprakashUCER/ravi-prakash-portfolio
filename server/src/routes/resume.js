import express from 'express';
import fs from 'fs';
import path from 'path';
import { db } from '../db.js';
import { config } from '../config.js';
import { requireAdminAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Helper to format resume object
function formatResume(row) {
  if (!row) return null;
  return {
    id: row.id,
    filename: row.filename,
    original_name: row.original_name,
    file_size: row.file_size,
    mime_type: row.mime_type,
    uploaded_at: row.uploaded_at,
    url: `/api/media/${row.filename}`
  };
}

// Public Get Resume Info
router.get('/', (req, res) => {
  try {
    const resume = db.prepare('SELECT * FROM resume WHERE id = 1').get();
    res.json({
      success: true,
      resume: formatResume(resume)
    });
  } catch (err) {
    console.error('[Resume Get Error]', err);
    res.status(500).json({ error: 'Failed to fetch resume information' });
  }
});

// Admin Upload/Replace Resume
router.post('/', requireAdminAuth, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded' });
    }

    const { filename, originalname, mimetype, size, path: storagePath } = req.file;

    // Check if old resume exists to clean up file
    const oldResume = db.prepare('SELECT * FROM resume WHERE id = 1').get();
    if (oldResume && oldResume.filename) {
      const oldPath = path.join(config.UPLOAD_DIR, oldResume.filename);
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (e) {
          console.warn('[Resume Cleanup] Could not delete old file:', oldPath);
        }
      }
    }

    // Upsert single resume
    const stmt = db.prepare(`
      INSERT INTO resume (id, filename, original_name, file_size, mime_type, uploaded_at)
      VALUES (1, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        filename = excluded.filename,
        original_name = excluded.original_name,
        file_size = excluded.file_size,
        mime_type = excluded.mime_type,
        uploaded_at = CURRENT_TIMESTAMP
    `);
    stmt.run(filename, originalname, size, mimetype);

    // Also register in media_files
    db.prepare(`
      INSERT INTO media_files (filename, original_name, mime_type, size, storage_path)
      VALUES (?, ?, ?, ?, ?)
    `).run(filename, originalname, mimetype, size, storagePath);

    const updated = db.prepare('SELECT * FROM resume WHERE id = 1').get();

    res.json({
      success: true,
      url: `/api/media/${filename}`,
      resume: formatResume(updated)
    });
  } catch (err) {
    console.error('[Resume Upload Error]', err);
    res.status(500).json({ error: err.message || 'Failed to upload resume' });
  }
});

// Admin Delete Resume
router.delete('/', requireAdminAuth, (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM resume WHERE id = 1').get();
    if (existing && existing.filename) {
      const filePath = path.join(config.UPLOAD_DIR, existing.filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.warn('[Resume Delete] Could not delete file:', filePath);
        }
      }
    }

    db.prepare('DELETE FROM resume WHERE id = 1').run();
    res.json({ success: true, message: 'Resume deleted successfully' });
  } catch (err) {
    console.error('[Resume Delete Error]', err);
    res.status(500).json({ error: 'Failed to delete resume' });
  }
});

export default router;
