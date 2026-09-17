import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { supabase } from '../supabase.js';
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
router.get('/', async (req, res) => {
  try {
    const { data: resume, error } = await supabase
      .from('resume')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error) {
      console.error('[Resume Get Error]', error);
      return res.status(500).json({ error: 'Failed to fetch resume information' });
    }

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
router.post('/', requireAdminAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded' });
    }

    const { originalname, mimetype, size, buffer } = req.file;

    // Fetch existing resume to clean up old storage file after successful update
    const { data: oldResume } = await supabase
      .from('resume')
      .select('filename')
      .eq('id', 1)
      .maybeSingle();

    // Generate safe unique filename
    const ext = path.extname(originalname).toLowerCase() || '.pdf';
    const randomHex = crypto.randomBytes(8).toString('hex');
    const filename = `${Date.now()}-${randomHex}${ext}`;

    // 1. Upload new file buffer to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(config.SUPABASE_STORAGE_BUCKET)
      .upload(filename, buffer, {
        contentType: mimetype,
        upsert: true
      });

    if (uploadError) {
      console.error('[Resume Storage Upload Error]', uploadError);
      return res.status(500).json({ error: `Storage upload failed: ${uploadError.message}` });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(config.SUPABASE_STORAGE_BUCKET)
      .getPublicUrl(filename);
    const publicUrl = urlData?.publicUrl || '';

    // 2. Update singleton resume row in database
    const { data: updatedResume, error: dbError } = await supabase
      .from('resume')
      .upsert({
        id: 1,
        filename,
        original_name: originalname,
        file_size: size,
        mime_type: mimetype,
        uploaded_at: new Date().toISOString()
      })
      .select()
      .single();

    if (dbError) {
      console.error('[Resume DB Update Error]', dbError);
      // Try to clean up newly uploaded file since DB update failed
      await supabase.storage.from(config.SUPABASE_STORAGE_BUCKET).remove([filename]);
      return res.status(500).json({ error: 'Database update failed for resume' });
    }

    // 3. Register in media_files table
    await supabase
      .from('media_files')
      .upsert({
        filename,
        original_name: originalname,
        mime_type: mimetype,
        size,
        storage_path: filename,
        public_url: publicUrl,
        created_at: new Date().toISOString()
      }, { onConflict: 'filename' });

    // 4. Delete old storage object now that new upload and DB update succeeded
    if (oldResume && oldResume.filename && oldResume.filename !== filename) {
      try {
        await supabase.storage.from(config.SUPABASE_STORAGE_BUCKET).remove([oldResume.filename]);
      } catch (cleanupErr) {
        console.warn('[Resume Cleanup] Could not delete old file from storage:', oldResume.filename);
      }
    }

    res.json({
      success: true,
      url: `/api/media/${filename}`,
      resume: formatResume(updatedResume)
    });
  } catch (err) {
    console.error('[Resume Upload Error]', err);
    res.status(500).json({ error: err.message || 'Failed to upload resume' });
  }
});

// Admin Delete Resume
router.delete('/', requireAdminAuth, async (req, res) => {
  try {
    const { data: existing } = await supabase
      .from('resume')
      .select('filename')
      .eq('id', 1)
      .maybeSingle();

    if (existing && existing.filename) {
      try {
        await supabase.storage.from(config.SUPABASE_STORAGE_BUCKET).remove([existing.filename]);
      } catch (storageErr) {
        console.warn('[Resume Delete] Could not remove storage file:', existing.filename);
      }
    }

    const { error: deleteErr } = await supabase
      .from('resume')
      .delete()
      .eq('id', 1);

    if (deleteErr) {
      console.error('[Resume DB Delete Error]', deleteErr);
      return res.status(500).json({ error: 'Failed to delete resume record' });
    }

    res.json({ success: true, message: 'Resume deleted successfully' });
  } catch (err) {
    console.error('[Resume Delete Error]', err);
    res.status(500).json({ error: 'Failed to delete resume' });
  }
});

export default router;
