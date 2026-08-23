import express from 'express';
import path from 'path';
import fs from 'fs';
import { config } from '../config.js';

const router = express.Router();

const MIME_MAP = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp'
};

// Single canonical media endpoint
router.get('/:filename', (req, res) => {
  try {
    // Sanitize filename to prevent directory traversal
    const safeFilename = path.basename(req.params.filename);
    const filePath = path.join(config.UPLOAD_DIR, safeFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Media file not found' });
    }

    const ext = path.extname(safeFilename).toLowerCase();
    const contentType = MIME_MAP[ext] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day cache

    // If query param ?download=true is passed, force download header
    if (req.query.download === 'true' || req.query.download === '1') {
      res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    } else {
      res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
    }

    const fileStream = fs.createReadStream(filePath);
    fileStream.on('error', (err) => {
      console.error('[Media Route Stream Error]', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to read media file' });
      }
    });
    fileStream.pipe(res);
  } catch (err) {
    console.error('[Media Route Error]', err);
    res.status(500).json({ error: 'Internal server error while serving media' });
  }
});

export default router;
