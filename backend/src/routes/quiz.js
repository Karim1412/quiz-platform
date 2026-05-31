import { Router } from 'express';
import Quiz from '../models/Quiz.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = Router();
router.use(protect); // all quiz routes require auth

// GET /api/quizzes  — list quizzes
//   Teachers see their own; students see all published quizzes
router.get('/', async (req, res, next) => {
  try {
    const filter = req.user.role === 'teacher'
      ? { createdBy: req.user._id }
      : { isPublished: true };

    const quizzes = await Quiz.find(filter)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ quizzes });
  } catch (err) { next(err); }
});

// GET /api/quizzes/:id
router.get('/:id', async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('createdBy', 'name').lean();
    if (!quiz) return res.status(404).json({ message: 'Quiz not found.' });
    res.json({ quiz });
  } catch (err) { next(err); }
});

// POST /api/quizzes  — create (teacher only)
router.post('/', restrictTo('teacher'), async (req, res, next) => {
  try {
    const { title, sourceFile, difficulty, questions } = req.body;
    if (!title || !questions?.length) {
      return res.status(400).json({ message: 'title and questions are required.' });
    }
    const quiz = await Quiz.create({
      title,
      sourceFile: sourceFile || '',
      difficulty: difficulty || 'medium',
      questions,
      createdBy: req.user._id,
    });
    res.status(201).json({ quiz });
  } catch (err) { next(err); }
});

// DELETE /api/quizzes/:id  — teacher only, own quizzes
router.delete('/:id', restrictTo('teacher'), async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found or not yours.' });
    await quiz.deleteOne();
    res.json({ message: 'Quiz deleted.' });
  } catch (err) { next(err); }
});

// PATCH /api/quizzes/:id/publish  — toggle published
router.patch('/:id/publish', restrictTo('teacher'), async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found.' });
    quiz.isPublished = !quiz.isPublished;
    await quiz.save();
    res.json({ quiz });
  } catch (err) { next(err); }
});

export default router;
