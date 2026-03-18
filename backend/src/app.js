import cors from 'cors';
import express from 'express';
import path from 'path';
import { getDatabaseHealth, isDatabaseConnected } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import ledgerRoutes from './routes/ledgerRoutes.js';
import loanRoutes from './routes/loanRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  const allowedOrigins = [];
  
  // Add configured URLs from CLIENT_URL
  if (process.env.CLIENT_URL) {
    allowedOrigins.push(...process.env.CLIENT_URL.split(','));
  }
  
  // Allow localhost for development
  allowedOrigins.push('http://localhost:5173', 'http://localhost:3000');
  
  // Allow all Vercel deployments pattern
  const vercelPattern = /^https:\/\/.*\.vercel\.app$/;
  
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || vercelPattern.test(origin)) {
          callback(null, true);
        } else {
          callback(new Error('CORS not allowed'));
        }
      },
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

  app.get('/', (req, res) => {
    res.json({
      name: 'Loan Manager API',
      status: 'running',
      health: '/api/health',
    });
  });

  app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
  });

  app.get('/api/health', (req, res) => {
    const database = getDatabaseHealth();
    const ok = isDatabaseConnected();

    res.status(ok ? 200 : 503).json({
      status: ok ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      database,
    });
  });

  app.use('/api', (req, res, next) => {
    if (!isDatabaseConnected()) {
      return res.status(503).json({ message: 'Database connection is unavailable. Please retry shortly.' });
    }

    return next();
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/loans', loanRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/ledger', ledgerRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/reminders', reminderRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
