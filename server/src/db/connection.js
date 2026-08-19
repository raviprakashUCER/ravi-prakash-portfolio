import Database from 'better-sqlite3';
import { config } from '../config.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbFile = path.isAbsolute(config.dbPath)
  ? config.dbPath
  : path.resolve(__dirname, '../../', config.dbPath);

export const db = new Database(dbFile);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
