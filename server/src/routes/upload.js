import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { requireAdminAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { supabase } from '../supabase.js';
import { config } from '../config.js';

const router = express.Router();

const ALLOWED_EXTENSIONS = new Set([
  '.pdf',
  '.jpg',
  '.jpeg',
  '.png',
  '.webp'
]);

// Admin General File Upload
router.post('/', requireAdminAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { originalname, mimetype, size, buffer } = req.file;

    // Generate clean safe filename
    const ext = path.extname(originalname).toLowerCase();
    const cleanExt = ALLOWED_EXTENSIONS.has(ext) ? ext : '.bin';
    const randomHex = crypto.randomBytes(8).toString('hex');
    const filename = `${Date.now()}-${randomHex}${cleanExt}`;

    // 1. Upload buffer to Supabase Storage bucket
    const { error: storageError } = await supabase.storage
      .from(config.SUPABASE_STORAGE_BUCKET)
      .upload(filename, buffer, {
        contentType: mimetype,
        upsert: true
      });

    if (storageError) {
      console.error('[Upload Storage Error]', storageError);
      return res.status(500).json({ error: `Storage upload failed: ${storageError.message}` });
    }

    // 2. Obtain Supabase public CDN URL
    const { data: urlData } = supabase.storage
      .from(config.SUPABASE_STORAGE_BUCKET)
      .getPublicUrl(filename);
    const publicUrl = urlData?.publicUrl || '';

    // 3. Record metadata in media_files table
    const { data: mediaRecord, error: dbError } = await supabase
      .from('media_files')
      .insert({
        filename,
        original_name: originalname,
        mime_type: mimetype,
        size,
        storage_path: filename,
        public_url: publicUrl,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (dbError) {
      console.error('[Upload DB Error]', dbError);
    }

    // Return backwards-compatible /api/media/:filename and full public_url
    return res.json({
      success: true,
      id: mediaRecord?.id,
      url: `/api/media/${filename}`,
      public_url: publicUrl,
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
