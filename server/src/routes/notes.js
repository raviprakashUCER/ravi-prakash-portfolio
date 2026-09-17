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

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function formatNote(row) {
  if (!row) return null;
  return {
    ...row,
    tags: safeParseJson(row.tags, []),
    is_published: Boolean(row.is_published)
  };
}

// Public Get All Notes
router.get('/', async (req, res) => {
  try {
    const showAll = req.query.all === 'true';
    let query = supabase.from('notes').select('*').order('created_at', { ascending: false });

    if (!showAll) {
      query = query.eq('is_published', true);
    }

    const { data: rows, error } = await query;
    if (error) {
      console.error('[Notes Get All Error]', error);
      return res.status(500).json({ error: 'Failed to fetch notes' });
    }

    res.json((rows || []).map(formatNote));
  } catch (err) {
    console.error('[Notes Get All Error]', err);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Public Get Note by Slug
router.get('/:slug', async (req, res) => {
  try {
    const { data: note, error } = await supabase
      .from('notes')
      .select('*')
      .eq('slug', req.params.slug)
      .maybeSingle();

    if (error) {
      console.error('[Notes Get Slug Error]', error);
      return res.status(500).json({ error: 'Failed to fetch note' });
    }

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json(formatNote(note));
  } catch (err) {
    console.error('[Notes Get Slug Error]', err);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// Admin Create Note
router.post('/', requireAdminAuth, async (req, res) => {
  try {
    const {
      title,
      short_description,
      category,
      tags,
      content,
      cover_image,
      pdf_attachment,
      is_published = true,
      slug
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    let finalSlug = slug ? slugify(slug) : slugify(title);
    if (!finalSlug) finalSlug = `note-${Date.now()}`;

    // Ensure unique slug
    let counter = 1;
    let uniqueSlug = finalSlug;
    while (true) {
      const { data: existing } = await supabase
        .from('notes')
        .select('id')
        .eq('slug', uniqueSlug)
        .maybeSingle();

      if (!existing) break;
      uniqueSlug = `${finalSlug}-${counter}`;
      counter++;
    }

    const parsedTags = typeof tags === 'string' ? safeParseJson(tags, []) : (tags || []);

    const { data: created, error } = await supabase
      .from('notes')
      .insert({
        slug: uniqueSlug,
        title,
        short_description: short_description || '',
        category: category || 'General',
        tags: parsedTags,
        content: content || '',
        cover_image: cover_image || '',
        pdf_attachment: pdf_attachment || '',
        is_published: Boolean(is_published),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('[Notes Create Error]', error);
      return res.status(500).json({ error: error.message || 'Failed to create note' });
    }

    res.status(201).json({
      success: true,
      note: formatNote(created)
    });
  } catch (err) {
    console.error('[Notes Create Error]', err);
    res.status(500).json({ error: err.message || 'Failed to create note' });
  }
});

// Admin Update Note
router.put('/:id', requireAdminAuth, async (req, res) => {
  try {
    const noteId = req.params.id;
    const { data: existing, error: fetchErr } = await supabase
      .from('notes')
      .select('*')
      .eq('id', noteId)
      .maybeSingle();

    if (fetchErr || !existing) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const {
      title,
      short_description,
      category,
      tags,
      content,
      cover_image,
      pdf_attachment,
      is_published,
      slug
    } = req.body;

    let finalSlug = existing.slug;
    if (slug && slug !== existing.slug) {
      finalSlug = slugify(slug);
      const { data: collision } = await supabase
        .from('notes')
        .select('id')
        .eq('slug', finalSlug)
        .neq('id', noteId)
        .maybeSingle();

      if (collision) {
        finalSlug = `${finalSlug}-${Date.now()}`;
      }
    }

    const parsedTags = tags !== undefined
      ? (typeof tags === 'string' ? safeParseJson(tags, []) : tags)
      : existing.tags;

    const { data: updated, error: updateErr } = await supabase
      .from('notes')
      .update({
        slug: finalSlug,
        title: title !== undefined ? title : existing.title,
        short_description: short_description !== undefined ? short_description : existing.short_description,
        category: category !== undefined ? category : existing.category,
        tags: parsedTags,
        content: content !== undefined ? content : existing.content,
        cover_image: cover_image !== undefined ? cover_image : existing.cover_image,
        pdf_attachment: pdf_attachment !== undefined ? pdf_attachment : existing.pdf_attachment,
        is_published: is_published !== undefined ? Boolean(is_published) : existing.is_published,
        updated_at: new Date().toISOString()
      })
      .eq('id', noteId)
      .select()
      .single();

    if (updateErr) {
      console.error('[Notes Update Error]', updateErr);
      return res.status(500).json({ error: updateErr.message || 'Failed to update note' });
    }

    res.json({
      success: true,
      note: formatNote(updated)
    });
  } catch (err) {
    console.error('[Notes Update Error]', err);
    res.status(500).json({ error: err.message || 'Failed to update note' });
  }
});

// Admin Delete Note
router.delete('/:id', requireAdminAuth, async (req, res) => {
  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      console.error('[Notes Delete Error]', error);
      return res.status(500).json({ error: 'Failed to delete note' });
    }

    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (err) {
    console.error('[Notes Delete Error]', err);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

export default router;
