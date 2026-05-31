import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';

import authRoutes        from './routes/auth.js';
import quizRoutes        from './routes/quiz.js';
import generateRoutes    from './routes/generate.js';   // ← NEW: replaces Python service
import resultRoutes      from './routes/results.js';
import leaderboardRoutes from './routes/leaderboard.js';
import userRoutes        from './routes/users.js';
import { errorHandler } from './middleware/error.js';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // curl / Postman / mobile
    const allowed = [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
    ];
    if (allowed.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/quizzes',     quizRoutes);
app.use('/api/generate',    generateRoutes);   // POST /api/generate, GET /api/generate/health
app.use('/api/results',     resultRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/users',       userRoutes);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status:    'ok',
    service:   'quizcraft-backend',
    db:        'connected',
    ai:        process.env.GROQ_API_KEY?.startsWith('gsk_') ? 'configured' : 'not configured',
    mode:      process.env.USE_MEMORY_DB === 'true' ? 'memory-db' : 'persistent-db',
    timestamp: new Date().toISOString(),
  });
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Boot ──────────────────────────────────────────────────────────────────────
async function boot() {
  await connectDB();

  app.listen(PORT, () => {
    const groqReady = process.env.GROQ_API_KEY?.startsWith('gsk_');
    console.log('');
    console.log('╔══════════════════════════════════════════════════╗');
    console.log(`║  🎓 QuizCraft Backend  →  http://localhost:${PORT}  ║`);
    console.log('╠══════════════════════════════════════════════════╣');
    console.log(`║  DB  : ${process.env.USE_MEMORY_DB === 'true' ? '🧪 In-memory (resets on restart)    ' : '✅ MongoDB connected                 '} ║`);
    console.log(`║  AI  : ${groqReady                             ? '✅ Groq AI ready                     ' : '⚠️  GROQ_API_KEY not set — add to .env'} ║`);
    console.log('╚══════════════════════════════════════════════════╝');
    console.log('');
    if (!groqReady) {
      console.log('  👉  Get your free Groq key → https://console.groq.com');
      console.log('  👉  Add to backend/.env:  GROQ_API_KEY=gsk_...\n');
    }
  });
}

boot();
