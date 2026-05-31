import { Router } from 'express';
import User   from '../models/User.js';
import Result from '../models/Result.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

// GET /api/leaderboard  — top students by total score
router.get('/', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const students = await User.find({ role: 'student' })
      .select('name grade totalScore quizzesTaken badges avatar')
      .sort({ totalScore: -1 })
      .limit(limit)
      .lean();

    const ranked = students.map((s, i) => ({ ...s, rank: i + 1 }));
    res.json({ leaderboard: ranked });
  } catch (err) { next(err); }
});

// GET /api/leaderboard/quiz/:quizId  — per-quiz leaderboard
router.get('/quiz/:quizId', async (req, res, next) => {
  try {
    const results = await Result.find({ quiz: req.params.quizId })
      .populate('student', 'name grade avatar badges')
      .sort({ percentage: -1, timeTaken: 1 })
      .limit(20)
      .lean();

    const ranked = results.map((r, i) => ({
      rank:       i + 1,
      studentId:  r.student._id,
      name:       r.student.name,
      grade:      r.student.grade,
      avatar:     r.student.avatar,
      badges:     r.student.badges,
      score:      r.score,
      total:      r.totalQuestions,
      percentage: r.percentage,
      timeTaken:  r.timeTaken,
      completedAt: r.completedAt,
    }));

    res.json({ leaderboard: ranked });
  } catch (err) { next(err); }
});

export default router;
