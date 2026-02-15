import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config({ path: '../development.env' });

import type { Application } from 'express';

import router from './router.ts';
import globalErrorHandler from './middlewares/globalErrorHandler.ts';

const app: Application = express();

// Rate limiter - basic example, adjust as needed
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
});

// ── Middlewares ────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(limiter);

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'AN_STRONG_SECRET',
    resave: false,
    saveUninitialized: true,
  }),
);

// ── Routes ─────────────────────────────────────────────────────
app.use('/api', router);

app.get('/health', (req, res) => {
  return res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use(globalErrorHandler); // must be after all routes and middlewares

export default app;
