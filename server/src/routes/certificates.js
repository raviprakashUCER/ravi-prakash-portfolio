import express from 'express';
import { db } from '../db.js';
import { requireAdminAuth } from '../middleware/auth.js';

const router = express.Router();

// Public Get All Certificates
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM certificates ORDER BY issue_date DESC, created_at DESC').all();
    res.json(rows);
  } catch (err) {
    console.error('[Certificates Get Error]', err);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

// Admin Create Certificate
router.post('/', requireAdminAuth, (req, res) => {
  try {
    const {
      title,
      organization,
      issue_date,
      file_url,
      credential_url
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Certificate title is required' });
    }

    const stmt = db.prepare(`
      INSERT INTO certificates (title, organization, issue_date, file_url, credential_url)
      VALUES (?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      title,
      organization || '',
      issue_date || '',
      file_url || '',
      credential_url || ''
    );

    const created = db.prepare('SELECT * FROM certificates WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({
      success: true,
      certificate: created
    });
  } catch (err) {
    console.error('[Certificates Create Error]', err);
    res.status(500).json({ error: 'Failed to create certificate' });
  }
});

// Admin Update Certificate
router.put('/:id', requireAdminAuth, (req, res) => {
  try {
    const certId = req.params.id;
    const existing = db.prepare('SELECT * FROM certificates WHERE id = ?').get(certId);
    if (!existing) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    const {
      title,
      organization,
      issue_date,
      file_url,
      credential_url
    } = req.body;

    const stmt = db.prepare(`
      UPDATE certificates SET
        title = ?,
        organization = ?,
        issue_date = ?,
        file_url = ?,
        credential_url = ?
      WHERE id = ?
    `);

    stmt.run(
      title !== undefined ? title : existing.title,
      organization !== undefined ? organization : existing.organization,
      issue_date !== undefined ? issue_date : existing.issue_date,
      file_url !== undefined ? file_url : existing.file_url,
      credential_url !== undefined ? credential_url : existing.credential_url,
      certId
    );

    const updated = db.prepare('SELECT * FROM certificates WHERE id = ?').get(certId);
    res.json({
      success: true,
      certificate: updated
    });
  } catch (err) {
    console.error('[Certificates Update Error]', err);
    res.status(500).json({ error: 'Failed to update certificate' });
  }
});

// Admin Delete Certificate
router.delete('/:id', requireAdminAuth, (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM certificates WHERE id = ?');
    const result = stmt.run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }
    res.json({ success: true, message: 'Certificate deleted successfully' });
  } catch (err) {
    console.error('[Certificates Delete Error]', err);
    res.status(500).json({ error: 'Failed to delete certificate' });
  }
});

export default router;
