import { Router } from 'express';
import User from '../models/User.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = Router();
router.use(protect);

// GET /api/users/students  — teacher sees all students
router.get('/students', restrictTo('teacher'), async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('name email grade totalScore quizzesTaken badges createdAt')
      .sort({ totalScore: -1 })
      .lean();
    res.json({ students });
  } catch (err) { next(err); }
});

// PATCH /api/users/me  — update own profile
router.patch('/me', async (req, res, next) => {
  try {
    const allowed = ['name', 'grade', 'avatar'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ user });
  } catch (err) { next(err); }
});

export default router;
