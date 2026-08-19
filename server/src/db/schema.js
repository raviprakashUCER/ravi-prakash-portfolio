import { db } from './connection.js';

export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      headline TEXT NOT NULL,
      bio TEXT NOT NULL,
      location TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      avatar_url TEXT,
      resume_url TEXT,
      career_goal TEXT,
      current_focus TEXT,
      interests TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      level TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      sort_order INTEGER DEFAULT 0,
      is_public BOOLEAN DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      tags TEXT,
      content_md TEXT NOT NULL,
      reading_time TEXT DEFAULT '5 min read',
      difficulty TEXT DEFAULT 'Beginner',
      cover_image_url TEXT,
      attachment_url TEXT,
      attachment_name TEXT,
      views INTEGER DEFAULT 0,
      is_public BOOLEAN DEFAULT 1,
      is_published BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      problem TEXT,
      solution TEXT,
      features TEXT,
      technologies TEXT NOT NULL,
      status TEXT DEFAULT 'Completed',
      thumbnail_url TEXT,
      doc_url TEXT,
      github_url TEXT,
      demo_url TEXT,
      lessons_learned TEXT,
      image_url TEXT,
      sort_order INTEGER DEFAULT 0,
      is_public BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS project_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      media_file_id INTEGER,
      image_url TEXT NOT NULL,
      caption TEXT,
      display_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS certifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE,
      title TEXT NOT NULL,
      organization TEXT NOT NULL,
      issue_date TEXT,
      expiry_date TEXT,
      credential_id TEXT,
      credential_url TEXT,
      certificate_file_url TEXT,
      image_url TEXT,
      description TEXT,
      skills TEXT,
      is_public BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS social_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform TEXT NOT NULL,
      username TEXT,
      url TEXT NOT NULL,
      icon TEXT,
      visible BOOLEAN DEFAULT 1,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS education (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      institution TEXT NOT NULL,
      course TEXT NOT NULL,
      start_date TEXT,
      end_date TEXT,
      description TEXT,
      is_public BOOLEAN DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS learning_journey (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic TEXT NOT NULL,
      category TEXT,
      status TEXT DEFAULT 'Learning',
      started_at TEXT,
      description TEXT,
      is_public BOOLEAN DEFAULT 1,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS ai_knowledge (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL,
      category TEXT NOT NULL,
      content TEXT NOT NULL,
      is_public BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT,
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS site_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value INTEGER DEFAULT 0
    );

    -- Media Management Tables
    CREATE TABLE IF NOT EXISTS media_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      original_name TEXT NOT NULL,
      stored_name TEXT UNIQUE NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      storage_path TEXT NOT NULL,
      public_url TEXT NOT NULL,
      is_public BOOLEAN DEFAULT 1,
      uploaded_by TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS resumes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      media_file_id INTEGER,
      version_name TEXT NOT NULL,
      file_url TEXT NOT NULL,
      is_active BOOLEAN DEFAULT 0,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (media_file_id) REFERENCES media_files(id) ON DELETE SET NULL
    );
  `);

  // Migrate columns gracefully if existing DB
  try { db.exec(`ALTER TABLE admin_users ADD COLUMN email TEXT`); } catch (e) {}
  try { db.exec(`ALTER TABLE notes ADD COLUMN cover_image_url TEXT`); } catch (e) {}
  try { db.exec(`ALTER TABLE notes ADD COLUMN attachment_url TEXT`); } catch (e) {}
  try { db.exec(`ALTER TABLE notes ADD COLUMN attachment_name TEXT`); } catch (e) {}
  try { db.exec(`ALTER TABLE notes ADD COLUMN is_published BOOLEAN DEFAULT 1`); } catch (e) {}
  try { db.exec(`ALTER TABLE projects ADD COLUMN thumbnail_url TEXT`); } catch (e) {}
  try { db.exec(`ALTER TABLE projects ADD COLUMN doc_url TEXT`); } catch (e) {}
  try { db.exec(`ALTER TABLE certifications ADD COLUMN slug TEXT`); } catch (e) {}
  try { db.exec(`ALTER TABLE certifications ADD COLUMN expiry_date TEXT`); } catch (e) {}
  try { db.exec(`ALTER TABLE certifications ADD COLUMN description TEXT`); } catch (e) {}
  try { db.exec(`ALTER TABLE certifications ADD COLUMN skills TEXT`); } catch (e) {}
  try { db.exec(`ALTER TABLE certifications ADD COLUMN certificate_file_url TEXT`); } catch (e) {}
}
