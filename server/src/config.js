import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
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

const PORT = parseInt(process.env.PORT, 10) || 5000;
const DATABASE_PATH = process.env.DATABASE_PATH || path.resolve(__dirname, '../../database.sqlite');
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.resolve(__dirname, '../../uploads');
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const JWT_SECRET = process.env.JWT_SECRET || 'ravi-portfolio-super-secret-jwt-key-2025';

// Supabase Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SUPABASE_STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'portfolio-media';

// Validation helper for Supabase environment variables
export function validateSupabaseConfig() {
  const missing = [];
  if (!SUPABASE_URL) missing.push('SUPABASE_URL');
  if (!SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');

  if (missing.length > 0) {
    const errorMsg = `[Config Error] Missing required Supabase environment variable(s): ${missing.join(', ')}. Set them in server/.env or Render environment.`;
    if (process.env.NODE_ENV === 'production') {
      console.error(errorMsg);
      throw new Error(errorMsg);
    } else {
      console.warn(errorMsg);
    }
  }
}

// Ensure database directory and uploads directory exist for local operations
const dbDir = path.dirname(DATABASE_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const config = {
  PORT,
  DATABASE_PATH,
  UPLOAD_DIR,
  FRONTEND_URL,
  ADMIN_USERNAME,
  ADMIN_PASSWORD,
  JWT_SECRET,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_STORAGE_BUCKET,
};
