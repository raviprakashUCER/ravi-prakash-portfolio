import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { config } from './config.js';

export const db = new Database(config.DATABASE_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL,
      headline TEXT,
      bio TEXT,
      profile_photo TEXT,
      location TEXT,
      email TEXT,
      phone TEXT,
      social_links TEXT DEFAULT '{}',
      skills TEXT DEFAULT '[]',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS resume (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      short_description TEXT,
      category TEXT,
      tags TEXT DEFAULT '[]',
      content TEXT,
      cover_image TEXT,
      pdf_attachment TEXT,
      is_published INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      technologies TEXT DEFAULT '[]',
      github_url TEXT,
      demo_url TEXT,
      image_url TEXT,
      display_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS certificates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      organization TEXT,
      issue_date TEXT,
      file_url TEXT,
      credential_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS media_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT UNIQUE NOT NULL,
      original_name TEXT,
      mime_type TEXT,
      size INTEGER,
      storage_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed Admin user if not exists
  const existingAdmin = db.prepare('SELECT id FROM admin WHERE username = ?').get(config.ADMIN_USERNAME);
  if (!existingAdmin) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(config.ADMIN_PASSWORD, salt);
    db.prepare('INSERT INTO admin (username, password_hash) VALUES (?, ?)').run(config.ADMIN_USERNAME, hash);
    console.log(`[DB] Default admin created: ${config.ADMIN_USERNAME}`);
  }

  // Seed default Profile if not exists
  const existingProfile = db.prepare('SELECT id FROM profile WHERE id = 1').get();
  if (!existingProfile) {
    const defaultProfile = {
      id: 1,
      name: 'Ravi Prakash',
      headline: 'Full Stack Engineer & Cloud Architect',
      bio: 'Passionate software engineer building robust, scalable web applications and cloud architectures.',
      profile_photo: '',
      location: 'India',
      email: 'ravi.prakash@example.com',
      phone: '+91 98765 43210',
      social_links: JSON.stringify({
        github: 'https://github.com',
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com'
      }),
      skills: JSON.stringify([
        { category: 'Frontend', items: ['React', 'JavaScript', 'HTML5', 'CSS3', 'TailwindCSS'] },
        { category: 'Backend', items: ['Node.js', 'Express.js', 'Python', 'REST APIs'] },
        { category: 'Database & Cloud', items: ['SQLite', 'PostgreSQL', 'Render', 'Vercel', 'Docker'] }
      ])
    };

    db.prepare(`
      INSERT INTO profile (id, name, headline, bio, profile_photo, location, email, phone, social_links, skills)
      VALUES (@id, @name, @headline, @bio, @profile_photo, @location, @email, @phone, @social_links, @skills)
    `).run(defaultProfile);
    console.log('[DB] Default profile initialized.');
  }
}
