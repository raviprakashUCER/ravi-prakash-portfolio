import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'ravi-prakash-ultra-secure-jwt-secret-2026-key',
  dbPath: process.env.DB_PATH || './ravi_portfolio.sqlite',
  mediaDir: process.env.MEDIA_DIR
    ? (path.isAbsolute(process.env.MEDIA_DIR) ? process.env.MEDIA_DIR : path.resolve(__dirname, '../../', process.env.MEDIA_DIR))
    : path.resolve(__dirname, '../media'),
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '26214400', 10), // 25MB default
  storageDriver: process.env.STORAGE_DRIVER || 'local',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  adminEmail: process.env.ADMIN_EMAIL || 'raviprakash.techpro@gmail.com',
  adminDefaultUsername: process.env.ADMIN_USER || 'ravi',
};
