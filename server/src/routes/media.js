import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from '../db/connection.js';
import { storageService } from '../services/storageService.js';
import { verifyAdmin } from './auth.js';

export const mediaRouter = Router();

// Multer memory storage configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 } // 30MB limit for multer buffer
});

// -------------------------------------------------------------
// PUBLIC FILE SERVING
// -------------------------------------------------------------

// Serve public media files safely
mediaRouter.get('/public/:filename', (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const filePath = storageService.getFilePath(filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check DB for mime type and public status
    const media = db.prepare('SELECT mime_type, is_public, original_name FROM media_files WHERE stored_name = ?').get(filename);
    if (media && media.is_public === 0) {
      return res.status(403).json({ error: 'This file is marked private.' });
    }

    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (media && media.mime_type) {
      res.setHeader('Content-Type', media.mime_type);
    }

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Download attachment
mediaRouter.get('/download/:filename', (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const filePath = storageService.getFilePath(filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const media = db.prepare('SELECT mime_type, is_public, original_name FROM media_files WHERE stored_name = ?').get(filename);
    if (media && media.is_public === 0) {
      return res.status(403).json({ error: 'This file is private.' });
    }

    const downloadName = media ? media.original_name : filename;
    res.download(filePath, downloadName);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// ADMIN PROTECTED API ENDPOINTS
// -------------------------------------------------------------

// 1. Upload one or multiple files
mediaRouter.post('/upload', verifyAdmin, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided for upload' });
    }

    const isPublic = req.body.is_public === 'false' || req.body.is_public === 0 ? 0 : 1;
    const results = [];
    const errors = [];

    const insertStmt = db.prepare(`
      INSERT INTO media_files (original_name, stored_name, mime_type, size, storage_path, public_url, is_public, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const file of req.files) {
      const validation = storageService.validateFile(file.originalname, file.mimetype, file.size);
      if (!validation.valid) {
        errors.push({ filename: file.originalname, error: validation.error });
        continue;
      }

      const saved = await storageService.saveFile(file.buffer, file.originalname, file.mimetype);
      const dbResult = insertStmt.run(
        file.originalname,
        saved.storedFilename,
        file.mimetype,
        file.size,
        saved.storagePath,
        saved.publicUrl,
        isPublic,
        req.user?.username || 'admin'
      );

      results.push({
        id: dbResult.lastInsertRowid,
        original_name: file.originalname,
        stored_name: saved.storedFilename,
        mime_type: file.mimetype,
        size: file.size,
        public_url: saved.publicUrl,
        download_url: saved.downloadUrl,
        is_public: isPublic
      });
    }

    res.json({
      success: true,
      uploaded: results,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ error: 'Failed to process file upload: ' + err.message });
  }
});

// 2. List & Filter Media Files
mediaRouter.get('/', verifyAdmin, (req, res) => {
  try {
    const { search, type } = req.query;
    let query = 'SELECT * FROM media_files WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND original_name LIKE ?';
      params.push(`%${search}%`);
    }

    if (type === 'images') {
      query += " AND mime_type LIKE 'image/%'";
    } else if (type === 'pdfs') {
      query += " AND mime_type = 'application/pdf'";
    } else if (type === 'documents') {
      query += " AND (mime_type = 'application/pdf' OR mime_type LIKE '%document%' OR mime_type LIKE '%word%' OR mime_type LIKE 'text/%')";
    }

    query += ' ORDER BY created_at DESC';

    const files = db.prepare(query).all(...params);

    // Calculate usage count for each file
    for (const f of files) {
      const notesUsing = db.prepare('SELECT COUNT(*) as count FROM notes WHERE cover_image_url = ? OR attachment_url = ?').get(f.public_url, f.public_url)?.count || 0;
      const projectsUsing = db.prepare('SELECT COUNT(*) as count FROM projects WHERE thumbnail_url = ? OR doc_url = ?').get(f.public_url, f.public_url)?.count || 0;
      const projectImgs = db.prepare('SELECT COUNT(*) as count FROM project_images WHERE image_url = ?').get(f.public_url)?.count || 0;
      const certsUsing = db.prepare('SELECT COUNT(*) as count FROM certifications WHERE certificate_file_url = ?').get(f.public_url)?.count || 0;
      const profileUsing = db.prepare('SELECT COUNT(*) as count FROM profile WHERE avatar_url = ? OR resume_url = ?').get(f.public_url, f.public_url)?.count || 0;
      const resumeUsing = db.prepare('SELECT COUNT(*) as count FROM resumes WHERE file_url = ?').get(f.public_url)?.count || 0;

      f.usage_count = notesUsing + projectsUsing + projectImgs + certsUsing + profileUsing + resumeUsing;
    }

    res.json({ success: true, files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Rename or toggle public status
mediaRouter.put('/:id', verifyAdmin, (req, res) => {
  try {
    const { original_name, is_public } = req.body;
    const file = db.prepare('SELECT * FROM media_files WHERE id = ?').get(req.params.id);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const newName = original_name ? original_name.trim() : file.original_name;
    const newPublic = typeof is_public !== 'undefined' ? (is_public ? 1 : 0) : file.is_public;

    db.prepare(`
      UPDATE media_files SET original_name = ?, is_public = ? WHERE id = ?
    `).run(newName, newPublic, req.params.id);

    res.json({ success: true, message: 'Media updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Replace file content
mediaRouter.post('/:id/replace', verifyAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Replacement file is required' });
    }

    const fileRecord = db.prepare('SELECT * FROM media_files WHERE id = ?').get(req.params.id);
    if (!fileRecord) {
      return res.status(404).json({ error: 'File record not found' });
    }

    const validation = storageService.validateFile(req.file.originalname, req.file.mimetype, req.file.size);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Delete old disk file
    await storageService.deleteFile(fileRecord.stored_name);

    // Save new file
    const saved = await storageService.saveFile(req.file.buffer, req.file.originalname, req.file.mimetype);

    // Update DB
    db.prepare(`
      UPDATE media_files SET
        original_name = ?,
        stored_name = ?,
        mime_type = ?,
        size = ?,
        storage_path = ?,
        public_url = ?
      WHERE id = ?
    `).run(
      req.file.originalname,
      saved.storedFilename,
      req.file.mimetype,
      req.file.size,
      saved.storagePath,
      saved.publicUrl,
      req.params.id
    );

    res.json({
      success: true,
      message: 'File replaced successfully',
      file: {
        id: fileRecord.id,
        original_name: req.file.originalname,
        stored_name: saved.storedFilename,
        public_url: saved.publicUrl
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Delete file
mediaRouter.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const file = db.prepare('SELECT * FROM media_files WHERE id = ?').get(req.params.id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Safely delete from physical disk
    await storageService.deleteFile(file.stored_name);

    // Delete from database
    db.prepare('DELETE FROM media_files WHERE id = ?').run(req.params.id);

    res.json({ success: true, message: 'File deleted from disk and database.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
