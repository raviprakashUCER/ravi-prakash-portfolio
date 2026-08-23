import express from 'express';
import { requireAdminAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { db } from '../db.js';

const router = express.Router();

// Admin general file upload
router.post('/', requireAdminAuth, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { filename, originalname, mimetype, size, path: storagePath } = req.file;

    const stmt = db.prepare(`
      INSERT INTO media_files (filename, original_name, mime_type, size, storage_path)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(filename, originalname, mimetype, size, storagePath);

    const publicUrl = `/api/media/${filename}`;

    return res.json({
      success: true,
      id: info.lastInsertRowid,
      url: publicUrl,
      filename,
      original_name: originalname,
      mime_type: mimetype,
      size
    });
  } catch (err) {
    console.error('[Upload Error]', err);
    return res.status(500).json({ error: err.message || 'File upload failed' });
  }
});

export default router;
