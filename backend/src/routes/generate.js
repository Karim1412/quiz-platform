import { Router } from 'express';
import { generateMCQs, checkGroqHealth } from '../services/groqService.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/generate/health
 * Check that Groq API key is configured and reachable.
 * Called by the frontend before every generation attempt.
 */
router.get('/health', async (_req, res) => {
  const result = await checkGroqHealth();
  if (result.ok) {
    return res.json({ status: 'ok', service: 'groq-ai' });
  }
  res.status(503).json({
    status: 'error',
    error:  result.error,
    hint:   'Get a free Groq API key at https://console.groq.com and add GROQ_API_KEY to backend/.env',
  });
});

/**
 * POST /api/generate
 * Body: { text: string, num_questions: number, difficulty: string }
 * Returns: { mcqs: [...] }
 *
 * Protected: only teachers can generate (students take pre-made quizzes).
 * But we also allow unauthenticated access for backward compatibility
 * with the standalone (non-auth) upload page.
 */
router.post('/', async (req, res, next) => {
  try {
    const { text, num_questions = 5, difficulty = 'medium' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ message: 'text is required and must be a string.' });
    }
    if (text.trim().length < 50) {
      return res.status(400).json({ message: 'Text is too short. Please provide more content (at least 50 characters).' });
    }

    const n = Math.min(Math.max(parseInt(num_questions) || 5, 1), 20);

    const mcqs = await generateMCQs(text, n, difficulty);
    res.json({ mcqs });

  } catch (err) {
    // Surface AI errors clearly to the frontend
    if (err.message.includes('GROQ_API_KEY')) {
      return res.status(503).json({ message: err.message });
    }
    if (err.status === 401 || err.message?.includes('401')) {
      return res.status(401).json({ message: 'Invalid Groq API key. Check GROQ_API_KEY in backend/.env' });
    }
    if (err.status === 429 || err.message?.includes('rate')) {
      return res.status(429).json({ message: 'Groq rate limit reached. Wait a moment and try again.' });
    }
    next(err);
  }
});

export default router;
