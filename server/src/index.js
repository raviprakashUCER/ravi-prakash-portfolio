import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import { config } from './config.js';
import { initDatabase } from './db.js';

import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import resumeRoutes from './routes/resume.js';
import notesRoutes from './routes/notes.js';
import projectsRoutes from './routes/projects.js';
import certificatesRoutes from './routes/certificates.js';
import mediaRoutes from './routes/media.js';
import uploadRoutes from './routes/upload.js';

const app = express();

// Initialize database schema and default records
initDatabase();

// Helmet security headers (with crossOriginResourcePolicy allow for media files)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// CORS configuration
const allowedOrigins = [
  config.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server tests)
      if (!origin) return callback(null, true);
      
      // If frontend URL is set to a wildcard or origin matches allowed list, vercel preview, or render domain
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.onrender.com') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(new Error('CORS policy: Not allowed by origin'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiter for login route
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per windowMs
  message: { error: 'Too many login attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Health check route with persistent storage status
app.get('/api/health', (req, res) => {
  const dbExists = fs.existsSync(config.DATABASE_PATH);
  const uploadsExists = fs.existsSync(config.UPLOAD_DIR);
  let fileCount = 0;
  if (uploadsExists) {
    try {
      fileCount = fs.readdirSync(config.UPLOAD_DIR).length;
    } catch (e) {}
  }

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: {
      path: config.DATABASE_PATH,
      exists: dbExists
    },
    uploads: {
      path: config.UPLOAD_DIR,
      exists: uploadsExists,
      fileCount
    }
  });
});

// Mount Routes
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/admin/me', authRoutes);

app.use('/api/profile', profileRoutes);
app.use('/api/admin/profile', profileRoutes);

app.use('/api/resume', resumeRoutes);
app.use('/api/admin/resume', resumeRoutes);

app.use('/api/notes', notesRoutes);
app.use('/api/admin/notes', notesRoutes);

app.use('/api/projects', projectsRoutes);
app.use('/api/admin/projects', projectsRoutes);

app.use('/api/certificates', certificatesRoutes);
app.use('/api/admin/certificates', certificatesRoutes);

app.use('/api/admin/upload', uploadRoutes);

// Single canonical media route
app.use('/api/media', mediaRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(config.PORT, '0.0.0.0', () => {
    const dbDir = path.dirname(config.DATABASE_PATH);
    const dbExists = fs.existsSync(config.DATABASE_PATH);
    const uploadsExists = fs.existsSync(config.UPLOAD_DIR);

    console.log(`========================================`);
    console.log(` Portfolio Server Running on port ${config.PORT} (0.0.0.0)`);
    console.log(` Database File:    ${config.DATABASE_PATH} (${dbExists ? 'Exists' : 'Initialized'})`);
    console.log(` Database Dir:     ${dbDir} (${fs.existsSync(dbDir) ? 'Ready' : 'Created'})`);
    console.log(` Upload Directory: ${config.UPLOAD_DIR} (${uploadsExists ? 'Ready' : 'Created'})`);
    console.log(` Media Route:      /api/media/:filename`);
    console.log(` Frontend URL:     ${config.FRONTEND_URL}`);
    console.log(`========================================`);
  });
}

export default app;
