// Main Backend Server for SETU - Jharkhand Societal Innovation Collaboration Portal
// Smart India Hackathon 2026 • Problem Statement ID 26043

import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { initDb } from '../database/db.js';

import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import safetyRoutes from './routes/safety.js';
import mlRoutes from './routes/ml.js';
import challengeRoutes from './routes/challenges.js';
import adminRoutes from './routes/admin.js';

const app = express();

// Initialize Persistent Database
initDb();

// Middlewares
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging for observability
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (!req.path.includes('/health')) {
      console.log(`[HTTP] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    platform: 'SETU - Jharkhand Societal Innovation Collaboration Portal',
    psId: '26043',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount SETU Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/admin', adminRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred.'
  });
});

const PORT = config.port;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log('====================================================');
    console.log(`🚀 SETU Backend API Server running on port ${PORT}`);
    console.log(`🌐 API Endpoints: http://localhost:${PORT}/api/health`);
    console.log(`🧠 ML Model Layer: Scikit-Learn TF-IDF Pipeline`);
    console.log('====================================================');
  });
}

export { app };
export default app;
