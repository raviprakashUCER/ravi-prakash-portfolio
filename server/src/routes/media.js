import express from 'express';
import path from 'path';
import fs from 'fs';
import { supabase } from '../supabase.js';
import { config } from '../config.js';

const router = express.Router();

const MIME_MAP = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp'
};

// Single canonical media endpoint with Supabase Storage CDN redirect & local fallback
router.get('/:filename', async (req, res) => {
  try {
    const safeFilename = path.basename(req.params.filename);

    // If Supabase URL & bucket configured, redirect to Supabase Storage CDN
    if (config.SUPABASE_URL && config.SUPABASE_STORAGE_BUCKET) {
      const { data } = supabase.storage
        .from(config.SUPABASE_STORAGE_BUCKET)
        .getPublicUrl(safeFilename);

      if (data?.publicUrl) {
        return res.redirect(302, data.publicUrl);
      }
    }

    // Local disk fallback (if running locally or prior to Supabase migration)
    const filePath = path.join(config.UPLOAD_DIR, safeFilename);
    if (fs.existsSync(filePath)) {
      const ext = path.extname(safeFilename).toLowerCase();
      const contentType = MIME_MAP[ext] || 'application/octet-stream';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');

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
      return fileStream.pipe(res);
    }

    return res.status(404).json({ error: 'Media file not found' });
  } catch (err) {
    console.error('[Media Route Error]', err);
    res.status(500).json({ error: 'Internal server error while serving media' });
  }
});

export default router;
