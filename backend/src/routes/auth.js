import { Router } from 'express';
import User from '../models/User.js';
import { createAuthResponse } from '../services/authService.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role, grade } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'name, email, password and role are required.' });
    }
    if (!['teacher', 'student'].includes(role)) {
      return res.status(400).json({ message: 'role must be "teacher" or "student".' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered.' });

    const user = await User.create({ name, email, password, role, grade: grade || '' });
    res.status(201).json(createAuthResponse(user));
  } catch (err) { next(err); }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    res.json(createAuthResponse(user));
  } catch (err) { next(err); }
});

// GET /api/auth/me  — refresh current user data
router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user });
});

export default router;
