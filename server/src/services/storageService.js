import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config.js';

// Ensure media storage directory exists
if (!fs.existsSync(config.mediaDir)) {
  fs.mkdirSync(config.mediaDir, { recursive: true });
}

// Strict allowlist of extensions and MIME types
const ALLOWED_EXTENSIONS = new Set([
  // Documents
  '.pdf', '.doc', '.docx', '.txt', '.md', '.markdown',
  // Images
  '.jpg', '.jpeg', '.png', '.webp', '.svg'
]);

const ALLOWED_MIME_TYPES = new Set([
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
  'text/x-markdown',
  // Images
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml'
]);

const DANGEROUS_EXTENSIONS = new Set([
  '.exe', '.bat', '.cmd', '.ps1', '.sh', '.vbs', '.dll', '.com', '.msi',
  '.scr', '.pif', '.hta', '.cpl', '.jar', '.js', '.mjs', '.php', '.py',
  '.pl', '.cgi', '.asp', '.aspx', '.jsp'
]);

class LocalStorageDriver {
  constructor(baseDir) {
    this.baseDir = baseDir;
  }

  async save(fileBuffer, originalFilename, mimeType) {
    const ext = path.extname(originalFilename).toLowerCase();
    const sanitizedBase = path.basename(originalFilename, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 40);
    const uniqueId = uuidv4();
    const storedFilename = `${sanitizedBase}_${uniqueId}${ext}`;
    const destinationPath = path.join(this.baseDir, storedFilename);

    await fs.promises.writeFile(destinationPath, fileBuffer);

    return {
      storedFilename,
      storagePath: destinationPath,
      publicUrl: `/media/public/${storedFilename}`,
      downloadUrl: `/media/download/${storedFilename}`
    };
  }

  async delete(storedFilename) {
    // Prevent directory traversal
    const safeFilename = path.basename(storedFilename);
    const targetPath = path.join(this.baseDir, safeFilename);
    if (fs.existsSync(targetPath)) {
      await fs.promises.unlink(targetPath);
      return true;
    }
    return false;
  }

  getFilePath(storedFilename) {
    const safeFilename = path.basename(storedFilename);
    return path.join(this.baseDir, safeFilename);
  }

  fileExists(storedFilename) {
    const safeFilename = path.basename(storedFilename);
    return fs.existsSync(path.join(this.baseDir, safeFilename));
  }
}

// Storage Service Wrapper
class StorageService {
  constructor() {
    this.driver = new LocalStorageDriver(config.mediaDir);
  }

  validateFile(filename, mimetype, size) {
    const ext = path.extname(filename).toLowerCase();

    if (DANGEROUS_EXTENSIONS.has(ext)) {
      return { valid: false, error: `Dangerous executable file type (${ext}) is strictly prohibited.` };
    }

    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return { valid: false, error: `Unsupported file extension (${ext}). Allowed: PDF, DOC, DOCX, TXT, MD, JPG, PNG, WEBP, SVG.` };
    }

    if (size > config.maxFileSize) {
      const mbLimit = Math.round(config.maxFileSize / (1024 * 1024));
      return { valid: false, error: `File size exceeds the ${mbLimit}MB limit.` };
    }

    return { valid: true };
  }

  async saveFile(fileBuffer, originalFilename, mimeType) {
    return this.driver.save(fileBuffer, originalFilename, mimeType);
  }

  async deleteFile(storedFilename) {
    return this.driver.delete(storedFilename);
  }

  getFilePath(storedFilename) {
    return this.driver.getFilePath(storedFilename);
  }

  fileExists(storedFilename) {
    return this.driver.fileExists(storedFilename);
  }
}

export const storageService = new StorageService();
