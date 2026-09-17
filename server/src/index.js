import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config, validateSupabaseConfig } from './config.js';
import { initDatabase } from './db.js';
import { supabase } from './supabase.js';

import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import resumeRoutes from './routes/resume.js';
import notesRoutes from './routes/notes.js';
import projectsRoutes from './routes/projects.js';
import certificatesRoutes from './routes/certificates.js';
import mediaRoutes from './routes/media.js';
import uploadRoutes from './routes/upload.js';

const app = express();

// Initialize database schema and admin synchronization on startup
initDatabase().catch((err) => {
  console.error('[DB Startup Error]', err);
});

// Helmet security headers (with crossOriginResourcePolicy allow for media assets)
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
      
      // If frontend URL is set or matches allowed list, vercel preview, or render domain
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

// Health check route with Supabase DB & Storage verification
app.get('/api/health', async (req, res) => {
  let dbStatus = 'unconfigured';
  let storageStatus = 'unconfigured';
  let latencyMs = null;

  if (config.SUPABASE_URL && config.SUPABASE_SERVICE_ROLE_KEY) {
    const start = Date.now();
    try {
      const { error } = await supabase.from('admin').select('id').limit(1);
      latencyMs = Date.now() - start;
      if (error) {
        dbStatus = `error: ${error.message}`;
      } else {
        dbStatus = 'connected';
      }
    } catch (e) {
      dbStatus = `error: ${e.message}`;
    }

    try {
      const { error: bucketError } = await supabase.storage
        .from(config.SUPABASE_STORAGE_BUCKET)
        .list('', { limit: 1 });
      if (bucketError) {
        storageStatus = `error: ${bucketError.message}`;
      } else {
        storageStatus = 'accessible';
      }
    } catch (e) {
      storageStatus = `error: ${e.message}`;
    }
  }

  const isHealthy = dbStatus === 'connected' && storageStatus === 'accessible';

  res.status(isHealthy || dbStatus === 'unconfigured' ? 200 : 503).json({
    status: isHealthy ? 'healthy' : (dbStatus === 'unconfigured' ? 'ready_for_supabase' : 'degraded'),
    timestamp: new Date().toISOString(),
    database: {
      provider: 'supabase-postgresql',
      status: dbStatus,
      latencyMs
    },
    storage: {
      provider: 'supabase-storage',
      bucket: config.SUPABASE_STORAGE_BUCKET,
      status: storageStatus
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
    console.log(`========================================`);
    console.log(` Portfolio Server Running on port ${config.PORT} (0.0.0.0)`);
    console.log(` Database:         Supabase PostgreSQL`);
    console.log(` Storage Bucket:   ${config.SUPABASE_STORAGE_BUCKET}`);
    console.log(` Media Route:      /api/media/:filename`);
    console.log(` Frontend URL:     ${config.FRONTEND_URL}`);
    console.log(`========================================`);
  });
}

export default app;
