/**
 * Seed script — run with: npm run seed
 *
 * Works with BOTH Atlas and local MongoDB.
 * For in-memory mode, seeding happens automatically — no need to run this.
 *
 * Usage:
 *   npm run seed                  (uses MONGODB_URI from .env)
 *   MONGODB_URI=<uri> npm run seed
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User   from '../models/User.js';
import Quiz   from '../models/Quiz.js';
import Result from '../models/Result.js';

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI || MONGO_URI.includes('YOUR_ATLAS') || MONGO_URI.includes('<username>')) {
  console.error('\n❌  Please set MONGODB_URI in backend/.env before seeding.\n');
  console.error('    Or use "npm run dev:memory" for zero-config auto-seeding.\n');
  process.exit(1);
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅  Connected to MongoDB');

  // Wipe existing data
  await Promise.all([User.deleteMany(), Quiz.deleteMany(), Result.deleteMany()]);
  console.log('🧹  Cleared existing data');

  // Teacher
  const teacher = await User.create({
    name: 'Ms. Sarah Johnson',
    email: 'teacher@quizcraft.com',
    password: 'teacher123',
    role: 'teacher',
    avatar: '👩‍🏫',
  });
  console.log('👩‍🏫  Teacher created');

  // Students
  const studentData = [
    { name: 'Alice Martin',  email: 'alice@quizcraft.com',  grade: 'Grade 4', avatar: '🦊', pct: 100 },
    { name: 'Bob Chen',      email: 'bob@quizcraft.com',    grade: 'Grade 4', avatar: '🐻', pct: 80  },
    { name: 'Carla Torres',  email: 'carla@quizcraft.com',  grade: 'Grade 5', avatar: '🦋', pct: 60  },
    { name: 'David Kim',     email: 'david@quizcraft.com',  grade: 'Grade 3', avatar: '🦁', pct: 40  },
    { name: 'Emma Wilson',   email: 'emma@quizcraft.com',   grade: 'Grade 5', avatar: '🐬', pct: 100 },
  ];

  const students = await Promise.all(
    studentData.map(s => User.create({ name: s.name, email: s.email, grade: s.grade, avatar: s.avatar, password: 'student123', role: 'student' }))
  );
  console.log(`🧒  ${students.length} students created`);

  // Quiz
  const quiz = await Quiz.create({
    title: 'Introduction to the Solar System',
    sourceFile: 'solar_system.pdf',
    difficulty: 'easy',
    createdBy: teacher._id,
    questions: [
      { question: 'What is the largest planet in our solar system?',
        A: 'Saturn', B: 'Jupiter', C: 'Neptune', D: 'Uranus', answer: 'B' },
      { question: 'How many planets are in our solar system?',
        A: '7', B: '9', C: '8', D: '10', answer: 'C' },
      { question: 'Which planet is known as the Red Planet?',
        A: 'Venus', B: 'Mars', C: 'Mercury', D: 'Jupiter', answer: 'B' },
      { question: 'What is the closest star to Earth?',
        A: 'Sirius', B: 'Alpha Centauri', C: 'The Sun', D: 'Proxima Centauri', answer: 'C' },
      { question: 'Which planet has rings around it?',
        A: 'Jupiter', B: 'Mars', C: 'Saturn', D: 'Neptune', answer: 'C' },
    ],
  });
  console.log('📋  Quiz created');

  // Results
  for (const [i, student] of students.entries()) {
    const pct   = studentData[i].pct;
    const score = Math.round((pct / 100) * quiz.questions.length);
    await Result.create({
      student: student._id,
      quiz: quiz._id,
      answers: quiz.questions.map((q, idx) => ({
        questionIndex: idx,
        selected: idx < score ? q.answer : (q.answer === 'A' ? 'B' : 'A'),
        correct:  idx < score,
      })),
      score,
      totalQuestions: quiz.questions.length,
      percentage: pct,
      timeTaken: 55 + i * 10,
    });
    await User.findByIdAndUpdate(student._id, {
      totalScore: pct,
      quizzesTaken: 1,
      badges: pct === 100 ? ['first-quiz', 'perfect-score'] : ['first-quiz'],
    });
  }
  console.log('📊  Results + scores seeded');

  console.log('\n🎉  Seed complete!\n');
  console.log('   👩‍🏫  teacher@quizcraft.com  /  teacher123');
  console.log('   🧒  alice@quizcraft.com     /  student123');
  console.log('   🧒  bob@quizcraft.com       /  student123');
  console.log('   🧒  carla@quizcraft.com     /  student123');
  console.log('   🧒  david@quizcraft.com     /  student123');
  console.log('   🧒  emma@quizcraft.com      /  student123\n');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('\n❌  Seed failed:', err.message, '\n');
  process.exit(1);
});
