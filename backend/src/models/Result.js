import mongoose from 'mongoose';

/**
 * Result Schema
 * Stores a student's answers and score for a specific quiz attempt.
 */
const answerSchema = new mongoose.Schema(
  {
    questionIndex: { type: Number, required: true },
    selected: { type: String, enum: ['A', 'B', 'C', 'D', null], default: null },
    correct:  { type: Boolean, required: true },
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quiz:    { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    answers: [answerSchema],
    score:       { type: Number, required: true },   // raw correct count
    totalQuestions: { type: Number, required: true },
    percentage:  { type: Number, required: true },   // 0–100
    timeTaken:   { type: Number, default: 0 },       // seconds
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Compound index: one attempt per student per quiz (latest wins)
resultSchema.index({ student: 1, quiz: 1 });

export default mongoose.model('Result', resultSchema);
