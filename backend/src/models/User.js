import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Schema
 * Stores both teachers and students. Role determines which interface they see.
 */
const userSchema = new mongoose.Schema(
  {
    name:  { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role:  { type: String, enum: ['teacher', 'student'], required: true, default: 'student' },
    avatar: { type: String, default: '' },          // optional emoji or URL
    grade:  { type: String, default: '' },          // for students (e.g. "Grade 3")
    totalScore:  { type: Number, default: 0 },      // cumulative score (students)
    quizzesTaken:{ type: Number, default: 0 },      // count of completed quizzes
    badges: [{ type: String }],                     // ['first-quiz', 'top-scorer', ...]
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password helper
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Never send password in JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model('User', userSchema);
