import mongoose from 'mongoose';

/**
 * Quiz Schema
 * A quiz created by a teacher. Contains the generated MCQ questions.
 */
const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    A: { type: String, required: true },
    B: { type: String, required: true },
    C: { type: String, required: true },
    D: { type: String, required: true },
    answer: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    title:      { type: String, required: true, trim: true },
    sourceFile: { type: String, default: '' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    questions:  { type: [questionSchema], required: true },
    createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isPublished:{ type: Boolean, default: true },   // teacher can hide quizzes
    timesPlayed:{ type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Quiz', quizSchema);
