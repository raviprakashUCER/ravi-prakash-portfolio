import bcrypt from 'bcryptjs';
import { supabase } from './supabase.js';
import { config } from './config.js';

/**
 * Initializes database check and synchronizes the Admin user credentials
 * with environment variables (ADMIN_USERNAME, ADMIN_PASSWORD).
 */
export async function initDatabase() {
  // If Supabase credentials are missing (e.g. initial setup without env), skip gracefully with warning
  if (!config.SUPABASE_URL || !config.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('[DB] Supabase credentials not set. Database initialization skipped.');
    return;
  }

  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(config.ADMIN_PASSWORD, salt);

    // 1. Synchronize Admin credentials
    const { data: targetAdmin, error: adminQueryErr } = await supabase
      .from('admin')
      .select('id, username')
      .eq('username', config.ADMIN_USERNAME)
      .maybeSingle();

    if (adminQueryErr) {
      console.error('[DB] Error querying admin table:', adminQueryErr.message);
    } else if (targetAdmin) {
      const { error: updateErr } = await supabase
        .from('admin')
        .update({ password_hash: hash })
        .eq('id', targetAdmin.id);

      if (updateErr) {
        console.error('[DB] Error synchronizing admin credentials:', updateErr.message);
      } else {
        console.log(`[DB] Admin credentials synchronized for: ${config.ADMIN_USERNAME}`);
      }
    } else {
      const { data: anyAdmin } = await supabase
        .from('admin')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (anyAdmin) {
        const { error: updateErr } = await supabase
          .from('admin')
          .update({ username: config.ADMIN_USERNAME, password_hash: hash })
          .eq('id', anyAdmin.id);

        if (updateErr) {
          console.error('[DB] Error updating admin credentials:', updateErr.message);
        } else {
          console.log(`[DB] Admin credentials synchronized for: ${config.ADMIN_USERNAME}`);
        }
      } else {
        const { error: insertErr } = await supabase
          .from('admin')
          .insert({ username: config.ADMIN_USERNAME, password_hash: hash });

        if (insertErr) {
          console.error('[DB] Error creating admin user:', insertErr.message);
        } else {
          console.log(`[DB] Admin created: ${config.ADMIN_USERNAME}`);
        }
      }
    }

    // 2. Ensure default Profile exists (id = 1)
    const { data: existingProfile, error: profileQueryErr } = await supabase
      .from('profile')
      .select('id')
      .eq('id', 1)
      .maybeSingle();

    if (!profileQueryErr && !existingProfile) {
      const defaultProfile = {
        id: 1,
        name: 'Ravi Prakash',
        headline: 'Full Stack Engineer & Cloud Architect',
        bio: 'Passionate software engineer building robust, scalable web applications and cloud architectures.',
        profile_photo: '',
        location: 'India',
        email: 'ravi.prakash@example.com',
        phone: '+91 98765 43210',
        social_links: {
          github: 'https://github.com',
          linkedin: 'https://linkedin.com',
          twitter: 'https://twitter.com'
        },
        skills: [
          { category: 'Frontend', items: ['React', 'JavaScript', 'HTML5', 'CSS3', 'TailwindCSS'] },
          { category: 'Backend', items: ['Node.js', 'Express.js', 'Python', 'REST APIs'] },
          { category: 'Database & Cloud', items: ['PostgreSQL', 'Supabase', 'Render', 'Vercel', 'Docker'] }
        ]
      };

      const { error: profileInsertErr } = await supabase
        .from('profile')
        .insert(defaultProfile);

      if (profileInsertErr) {
        console.error('[DB] Error inserting default profile:', profileInsertErr.message);
      } else {
        console.log('[DB] Default profile initialized.');
      }
    }
  } catch (err) {
    console.error('[DB] Database initialization error:', err.message);
  }
}
