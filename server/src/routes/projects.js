import express from 'express';
import { supabase } from '../supabase.js';
import { requireAdminAuth } from '../middleware/auth.js';

const router = express.Router();

function safeParseJson(data, defaultValue) {
  if (!data) return defaultValue;
  if (typeof data === 'object') return data;
  try {
    return JSON.parse(data);
  } catch (e) {
    return defaultValue;
  }
}

function formatProject(row) {
  if (!row) return null;
  return {
    ...row,
    technologies: safeParseJson(row.technologies, [])
  };
}

// Public Get All Projects
router.get('/', async (req, res) => {
  try {
    const { data: rows, error } = await supabase
      .from('projects')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Projects Get Error]', error);
      return res.status(500).json({ error: 'Failed to fetch projects' });
    }

    res.json((rows || []).map(formatProject));
  } catch (err) {
    console.error('[Projects Get Error]', err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Admin Create Project
router.post('/', requireAdminAuth, async (req, res) => {
  try {
    const {
      title,
      description,
      technologies,
      github_url,
      demo_url,
      image_url,
      display_order = 0
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Project title is required' });
    }

    const parsedTech = typeof technologies === 'string' ? safeParseJson(technologies, []) : (technologies || []);

    const { data: created, error } = await supabase
      .from('projects')
      .insert({
        title,
        description: description || '',
        technologies: parsedTech,
        github_url: github_url || '',
        demo_url: demo_url || '',
        image_url: image_url || '',
        display_order: parseInt(display_order, 10) || 0,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('[Projects Create Error]', error);
      return res.status(500).json({ error: error.message || 'Failed to create project' });
    }

    res.status(201).json({
      success: true,
      project: formatProject(created)
    });
  } catch (err) {
    console.error('[Projects Create Error]', err);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Admin Update Project
router.put('/:id', requireAdminAuth, async (req, res) => {
  try {
    const projectId = req.params.id;
    const { data: existing, error: fetchErr } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .maybeSingle();

    if (fetchErr || !existing) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const {
      title,
      description,
      technologies,
      github_url,
      demo_url,
      image_url,
      display_order
    } = req.body;

    const parsedTech = technologies !== undefined
      ? (typeof technologies === 'string' ? safeParseJson(technologies, []) : technologies)
      : existing.technologies;

    const { data: updated, error: updateErr } = await supabase
      .from('projects')
      .update({
        title: title !== undefined ? title : existing.title,
        description: description !== undefined ? description : existing.description,
        technologies: parsedTech,
        github_url: github_url !== undefined ? github_url : existing.github_url,
        demo_url: demo_url !== undefined ? demo_url : existing.demo_url,
        image_url: image_url !== undefined ? image_url : existing.image_url,
        display_order: display_order !== undefined ? parseInt(display_order, 10) : existing.display_order
      })
      .eq('id', projectId)
      .select()
      .single();

    if (updateErr) {
      console.error('[Projects Update Error]', updateErr);
      return res.status(500).json({ error: updateErr.message || 'Failed to update project' });
    }

    res.json({
      success: true,
      project: formatProject(updated)
    });
  } catch (err) {
    console.error('[Projects Update Error]', err);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Admin Delete Project
router.delete('/:id', requireAdminAuth, async (req, res) => {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      console.error('[Projects Delete Error]', error);
      return res.status(500).json({ error: 'Failed to delete project' });
    }

    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err) {
    console.error('[Projects Delete Error]', err);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;
