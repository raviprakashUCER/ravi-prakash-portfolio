import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { seedDatabase } from './db/seed.js';
import { publicRouter } from './routes/public.js';
import { authRouter } from './routes/auth.js';
import { adminRouter } from './routes/admin.js';
import { aiRouter } from './routes/ai.js';
import { mediaRouter } from './routes/media.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Seed database on startup
seedDatabase();

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Ravi Prakash Portfolio API',
  });
});

// Mount Routes
app.use('/media', mediaRouter);
app.use('/api/media', mediaRouter);
app.use('/api', publicRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/ai', aiRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled API Error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`);
});
