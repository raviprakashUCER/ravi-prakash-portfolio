import express from 'express';
import { supabase } from '../supabase.js';
import { requireAdminAuth } from '../middleware/auth.js';

const router = express.Router();

// Public Get All Certificates
router.get('/', async (req, res) => {
  try {
    const { data: rows, error } = await supabase
      .from('certificates')
      .select('*')
      .order('issue_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Certificates Get Error]', error);
      return res.status(500).json({ error: 'Failed to fetch certificates' });
    }

    res.json(rows || []);
  } catch (err) {
    console.error('[Certificates Get Error]', err);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

// Admin Create Certificate
router.post('/', requireAdminAuth, async (req, res) => {
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

    const { data: created, error } = await supabase
      .from('certificates')
      .insert({
        title,
        organization: organization || '',
        issue_date: issue_date || '',
        file_url: file_url || '',
        credential_url: credential_url || '',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('[Certificates Create Error]', error);
      return res.status(500).json({ error: 'Failed to create certificate' });
    }

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
router.put('/:id', requireAdminAuth, async (req, res) => {
  try {
    const certId = req.params.id;
    const { data: existing, error: fetchErr } = await supabase
      .from('certificates')
      .select('*')
      .eq('id', certId)
      .maybeSingle();

    if (fetchErr || !existing) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    const {
      title,
      organization,
      issue_date,
      file_url,
      credential_url
    } = req.body;

    const { data: updated, error: updateErr } = await supabase
      .from('certificates')
      .update({
        title: title !== undefined ? title : existing.title,
        organization: organization !== undefined ? organization : existing.organization,
        issue_date: issue_date !== undefined ? issue_date : existing.issue_date,
        file_url: file_url !== undefined ? file_url : existing.file_url,
        credential_url: credential_url !== undefined ? credential_url : existing.credential_url
      })
      .eq('id', certId)
      .select()
      .single();

    if (updateErr) {
      console.error('[Certificates Update Error]', updateErr);
      return res.status(500).json({ error: 'Failed to update certificate' });
    }

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
router.delete('/:id', requireAdminAuth, async (req, res) => {
  try {
    const { error } = await supabase
      .from('certificates')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      console.error('[Certificates Delete Error]', error);
      return res.status(500).json({ error: 'Failed to delete certificate' });
    }

    res.json({ success: true, message: 'Certificate deleted successfully' });
  } catch (err) {
    console.error('[Certificates Delete Error]', err);
    res.status(500).json({ error: 'Failed to delete certificate' });
  }
});

export default router;
