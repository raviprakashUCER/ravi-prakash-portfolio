import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly resolve and load .env files from server directory, root directory, or .env.example fallback
const envPaths = [
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../.env.example'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '.env.example'),
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'portfolio-media';

const DATABASE_PATH = process.env.DATABASE_PATH || path.resolve(__dirname, '../../database.sqlite');
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.resolve(__dirname, '../../uploads');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required to run migration.');
  console.error('Please make sure they are defined in server/.env or server/.env.example');
  process.exit(1);
}

if (!fs.existsSync(DATABASE_PATH)) {
  console.error(`❌ Error: SQLite database file not found at ${DATABASE_PATH}`);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const sqlite = new Database(DATABASE_PATH, { readonly: true });

function safeParseJson(data, defaultValue) {
  if (!data) return defaultValue;
  if (typeof data === 'object') return data;
  try {
    return JSON.parse(data);
  } catch (e) {
    return defaultValue;
  }
}

const MIME_MAP = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp'
};

async function runMigration() {
  console.log('====================================================');
  console.log('🚀 Starting SQLite to Supabase Migration');
  console.log(`Database Source: ${DATABASE_PATH}`);
  console.log(`Uploads Source:  ${UPLOAD_DIR}`);
  console.log(`Supabase Target: ${SUPABASE_URL}`);
  console.log(`Storage Bucket:  ${STORAGE_BUCKET}`);
  console.log('====================================================\n');

  const summary = {
    admin: 0,
    profile: 0,
    resume: 0,
    notes: 0,
    projects: 0,
    certificates: 0,
    media_files: 0,
    storage_files_uploaded: 0,
    errors: 0
  };

  // 1. Migrate Admin Table
  try {
    const adminRows = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='admin'").get()
      ? sqlite.prepare('SELECT * FROM admin').all()
      : [];

    for (const row of adminRows) {
      const { error } = await supabase.from('admin').upsert({
        id: row.id,
        username: row.username,
        password_hash: row.password_hash,
        created_at: row.created_at || new Date().toISOString()
      }, { onConflict: 'username' });

      if (error) {
        console.error(`[Admin Migration Error for user ${row.username}]:`, error.message);
        summary.errors++;
      } else {
        summary.admin++;
      }
    }
    console.log(`✔ Admin table migrated (${summary.admin} records)`);
  } catch (err) {
    console.error('[Admin Migration Exception]:', err.message);
    summary.errors++;
  }

  // 2. Migrate Profile Table
  try {
    const profileRows = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='profile'").get()
      ? sqlite.prepare('SELECT * FROM profile').all()
      : [];

    for (const row of profileRows) {
      const { error } = await supabase.from('profile').upsert({
        id: 1,
        name: row.name || 'Ravi Prakash',
        headline: row.headline || '',
        bio: row.bio || '',
        profile_photo: row.profile_photo || '',
        location: row.location || '',
        email: row.email || '',
        phone: row.phone || '',
        social_links: safeParseJson(row.social_links, {}),
        skills: safeParseJson(row.skills, []),
        updated_at: row.updated_at || new Date().toISOString()
      }, { onConflict: 'id' });

      if (error) {
        console.error('[Profile Migration Error]:', error.message);
        summary.errors++;
      } else {
        summary.profile++;
      }
    }
    console.log(`✔ Profile table migrated (${summary.profile} records)`);
  } catch (err) {
    console.error('[Profile Migration Exception]:', err.message);
    summary.errors++;
  }

  // 3. Migrate Resume Table
  try {
    const resumeRows = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='resume'").get()
      ? sqlite.prepare('SELECT * FROM resume').all()
      : [];

    for (const row of resumeRows) {
      const { error } = await supabase.from('resume').upsert({
        id: 1,
        filename: row.filename,
        original_name: row.original_name,
        file_size: row.file_size,
        mime_type: row.mime_type,
        uploaded_at: row.uploaded_at || new Date().toISOString()
      }, { onConflict: 'id' });

      if (error) {
        console.error('[Resume Migration Error]:', error.message);
        summary.errors++;
      } else {
        summary.resume++;
      }
    }
    console.log(`✔ Resume table migrated (${summary.resume} records)`);
  } catch (err) {
    console.error('[Resume Migration Exception]:', err.message);
    summary.errors++;
  }

  // 4. Migrate Notes Table
  try {
    const notesRows = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='notes'").get()
      ? sqlite.prepare('SELECT * FROM notes').all()
      : [];

    for (const row of notesRows) {
      const { error } = await supabase.from('notes').upsert({
        id: row.id,
        slug: row.slug,
        title: row.title,
        short_description: row.short_description || '',
        category: row.category || 'General',
        tags: safeParseJson(row.tags, []),
        content: row.content || '',
        cover_image: row.cover_image || '',
        pdf_attachment: row.pdf_attachment || '',
        is_published: Boolean(row.is_published),
        created_at: row.created_at || new Date().toISOString(),
        updated_at: row.updated_at || new Date().toISOString()
      }, { onConflict: 'slug' });

      if (error) {
        console.error(`[Notes Migration Error for slug "${row.slug}"]:`, error.message);
        summary.errors++;
      } else {
        summary.notes++;
      }
    }
    console.log(`✔ Notes table migrated (${summary.notes} records)`);
  } catch (err) {
    console.error('[Notes Migration Exception]:', err.message);
    summary.errors++;
  }

  // 5. Migrate Projects Table
  try {
    const projectRows = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='projects'").get()
      ? sqlite.prepare('SELECT * FROM projects').all()
      : [];

    for (const row of projectRows) {
      const { error } = await supabase.from('projects').upsert({
        id: row.id,
        title: row.title,
        description: row.description || '',
        technologies: safeParseJson(row.technologies, []),
        github_url: row.github_url || '',
        demo_url: row.demo_url || '',
        image_url: row.image_url || '',
        display_order: row.display_order || 0,
        created_at: row.created_at || new Date().toISOString()
      }, { onConflict: 'id' });

      if (error) {
        console.error(`[Projects Migration Error for id ${row.id}]:`, error.message);
        summary.errors++;
      } else {
        summary.projects++;
      }
    }
    console.log(`✔ Projects table migrated (${summary.projects} records)`);
  } catch (err) {
    console.error('[Projects Migration Exception]:', err.message);
    summary.errors++;
  }

  // 6. Migrate Certificates Table
  try {
    const certRows = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='certificates'").get()
      ? sqlite.prepare('SELECT * FROM certificates').all()
      : [];

    for (const row of certRows) {
      const { error } = await supabase.from('certificates').upsert({
        id: row.id,
        title: row.title,
        organization: row.organization || '',
        issue_date: row.issue_date || '',
        file_url: row.file_url || '',
        credential_url: row.credential_url || '',
        created_at: row.created_at || new Date().toISOString()
      }, { onConflict: 'id' });

      if (error) {
        console.error(`[Certificates Migration Error for id ${row.id}]:`, error.message);
        summary.errors++;
      } else {
        summary.certificates++;
      }
    }
    console.log(`✔ Certificates table migrated (${summary.certificates} records)`);
  } catch (err) {
    console.error('[Certificates Migration Exception]:', err.message);
    summary.errors++;
  }

  // 7. Migrate Media Files Table & Local Storage Uploads
  try {
    const mediaRows = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='media_files'").get()
      ? sqlite.prepare('SELECT * FROM media_files').all()
      : [];

    for (const row of mediaRows) {
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(row.filename);
      const publicUrl = urlData?.publicUrl || '';

      const { error } = await supabase.from('media_files').upsert({
        id: row.id,
        filename: row.filename,
        original_name: row.original_name,
        mime_type: row.mime_type,
        size: row.size,
        storage_path: row.filename,
        public_url: publicUrl,
        created_at: row.created_at || new Date().toISOString()
      }, { onConflict: 'filename' });

      if (error) {
        console.error(`[Media Files DB Error for filename ${row.filename}]:`, error.message);
        summary.errors++;
      } else {
        summary.media_files++;
      }
    }
    console.log(`✔ Media files metadata table migrated (${summary.media_files} records)`);
  } catch (err) {
    console.error('[Media Files Metadata Migration Exception]:', err.message);
    summary.errors++;
  }

  // 8. Upload Physical Local Files to Supabase Storage
  if (fs.existsSync(UPLOAD_DIR)) {
    const files = fs.readdirSync(UPLOAD_DIR);
    console.log(`\nFound ${files.length} physical file(s) in local uploads directory. Uploading to Supabase Storage...`);

    for (const filename of files) {
      const filePath = path.join(UPLOAD_DIR, filename);
      const stats = fs.statSync(filePath);
      if (!stats.isFile()) continue;

      const fileBuffer = fs.readFileSync(filePath);
      const ext = path.extname(filename).toLowerCase();
      const contentType = MIME_MAP[ext] || 'application/octet-stream';

      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filename, fileBuffer, {
          contentType,
          upsert: true
        });

      if (error) {
        console.error(`[Storage Upload Error for ${filename}]:`, error.message);
        summary.errors++;
      } else {
        summary.storage_files_uploaded++;
        console.log(`  Uploaded: ${filename} (${Math.round(stats.size / 1024)} KB)`);
      }
    }
  }

  console.log('\n====================================================');
  console.log('🎉 Migration Completed Summary:');
  console.log('----------------------------------------------------');
  console.log(`Admin:                  ${summary.admin}`);
  console.log(`Profile:                ${summary.profile}`);
  console.log(`Resume:                 ${summary.resume}`);
  console.log(`Notes:                  ${summary.notes}`);
  console.log(`Projects:               ${summary.projects}`);
  console.log(`Certificates:           ${summary.certificates}`);
  console.log(`Media files:            ${summary.media_files}`);
  console.log(`Storage files uploaded: ${summary.storage_files_uploaded}`);
  console.log(`Errors:                 ${summary.errors}`);
  console.log('====================================================');
}

runMigration()
  .then(() => {
    sqlite.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Migration failed with uncaught exception:', err);
    sqlite.close();
    process.exit(1);
  });
