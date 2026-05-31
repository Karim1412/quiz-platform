import { Router } from 'express';
import Result from '../models/Result.js';
import Quiz   from '../models/Quiz.js';
import User   from '../models/User.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = Router();
router.use(protect);

// POST /api/results  — student submits a quiz attempt
router.post('/', restrictTo('student'), async (req, res, next) => {
  try {
    const { quizId, answers, timeTaken } = req.body;
    // answers: [{ questionIndex, selected }]

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found.' });

    // Grade the answers
    const graded = answers.map(a => ({
      questionIndex: a.questionIndex,
      selected:      a.selected,
      correct:       quiz.questions[a.questionIndex]?.answer === a.selected,
    }));

    const score      = graded.filter(a => a.correct).length;
    const total      = quiz.questions.length;
    const percentage = Math.round((score / total) * 100);

    // Upsert: one result per student per quiz (keep latest)
    const result = await Result.findOneAndUpdate(
      { student: req.user._id, quiz: quizId },
      { answers: graded, score, totalQuestions: total, percentage, timeTaken: timeTaken || 0, completedAt: new Date() },
      { upsert: true, new: true, runValidators: true }
    );

    // Update user aggregates
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalScore: percentage, quizzesTaken: 1 },
    });

    // Increment quiz play count
    await Quiz.findByIdAndUpdate(quizId, { $inc: { timesPlayed: 1 } });

    // Award badges
    const user = await User.findById(req.user._id);
    const newBadges = [];
    if (user.quizzesTaken === 1 && !user.badges.includes('first-quiz')) newBadges.push('first-quiz');
    if (percentage === 100 && !user.badges.includes('perfect-score')) newBadges.push('perfect-score');
    if (user.quizzesTaken >= 5 && !user.badges.includes('quiz-master')) newBadges.push('quiz-master');
    if (newBadges.length) await User.findByIdAndUpdate(req.user._id, { $push: { badges: { $each: newBadges } } });

    res.status(201).json({ result, score, total, percentage, newBadges });
  } catch (err) { next(err); }
});

// GET /api/results/me  — student's own history
router.get('/me', async (req, res, next) => {
  try {
    const results = await Result.find({ student: req.user._id })
      .populate('quiz', 'title difficulty sourceFile')
      .sort({ completedAt: -1 })
      .lean();
    res.json({ results });
  } catch (err) { next(err); }
});

// GET /api/results/quiz/:quizId  — teacher sees all results for a quiz
router.get('/quiz/:quizId', restrictTo('teacher'), async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.quizId, createdBy: req.user._id });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found or not yours.' });

    const results = await Result.find({ quiz: req.params.quizId })
      .populate('student', 'name email grade')
      .sort({ percentage: -1 })
      .lean();
    res.json({ results, quiz });
  } catch (err) { next(err); }
});

export default router;
