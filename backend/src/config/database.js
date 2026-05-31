import mongoose from 'mongoose';

/**
 * Connect to MongoDB.
 *
 * Priority order:
 *  1. USE_MEMORY_DB=true  →  spin up an in-process MongoDB (no install needed)
 *  2. MONGODB_URI in .env →  your Atlas / local URI
 *  3. Fallback            →  helpful error with setup instructions
 */
export async function connectDB() {
  // ── Option 1: In-memory MongoDB (zero setup, great for dev/demo) ──────────
  if (process.env.USE_MEMORY_DB === 'true') {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log('🧪  Using in-memory MongoDB (data resets on restart)');
    console.log('💡  To persist data, set MONGODB_URI in backend/.env');

    // Auto-seed demo data when using memory DB
    await seedDemoData();
    return;
  }

  // ── Option 2: Atlas or local URI from .env ────────────────────────────────
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('YOUR_ATLAS')) {
    console.error(`
╔══════════════════════════════════════════════════════════════╗
║          ❌  No MongoDB connection configured                 ║
╠══════════════════════════════════════════════════════════════╣
║  Choose ONE of these options:                                ║
║                                                              ║
║  OPTION A — Zero-install (recommended for quick start):      ║
║    npm run dev:memory                                        ║
║    (uses in-memory DB, auto-seeds demo data)                 ║
║                                                              ║
║  OPTION B — MongoDB Atlas (free, persistent):                ║
║    1. Go to https://cloud.mongodb.com                        ║
║    2. Create free account → New Project → Build Database     ║
║    3. Choose FREE tier (M0) → Create                         ║
║    4. Add your IP to Network Access (or allow 0.0.0.0/0)    ║
║    5. Create a DB user with password                         ║
║    6. Click Connect → Drivers → copy the URI                 ║
║    7. Paste URI into backend/.env as MONGODB_URI             ║
║       Example:                                               ║
║       MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/quizcraft ║
║    8. Run: npm run dev                                        ║
║                                                              ║
║  OPTION C — Local MongoDB:                                   ║
║    Install from https://www.mongodb.com/try/download/community ║
║    Then set: MONGODB_URI=mongodb://localhost:27017/quizcraft  ║
╚══════════════════════════════════════════════════════════════╝
`);
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
    });
    console.log(`🗄️  MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.error(`
╔══════════════════════════════════════════════════════════════╗
║  ❌  MongoDB connection failed                               ║
╠══════════════════════════════════════════════════════════════╣
║  Error: ${err.message.slice(0, 52).padEnd(52)} ║
║                                                              ║
║  Common fixes:                                               ║
║  • Atlas: Check your IP is whitelisted in Network Access     ║
║  • Atlas: Verify username/password in the URI                ║
║  • Local: Make sure mongod service is running                ║
║  • Quick fix: npm run dev:memory  (no install needed)        ║
╚══════════════════════════════════════════════════════════════╝
`);
    process.exit(1);
  }
}

// ── Auto-seed demo data for in-memory mode ────────────────────────────────────
async function seedDemoData() {
  const { default: User }   = await import('../models/User.js');
  const { default: Quiz }   = await import('../models/Quiz.js');
  const { default: Result } = await import('../models/Result.js');

  // Skip if already seeded
  const existing = await User.countDocuments();
  if (existing > 0) return;

  console.log('🌱  Seeding demo data…');

  const teacher = await User.create({
    name: 'Ms. Sarah Johnson',
    email: 'teacher@quizcraft.com',
    password: 'teacher123',
    role: 'teacher',
    avatar: '👩‍🏫',
  });

  const studentData = [
    { name: 'Alice Martin',  email: 'alice@quizcraft.com',  grade: 'Grade 4', avatar: '🦊', score: 100 },
    { name: 'Bob Chen',      email: 'bob@quizcraft.com',    grade: 'Grade 4', avatar: '🐻', score: 80  },
    { name: 'Carla Torres',  email: 'carla@quizcraft.com',  grade: 'Grade 5', avatar: '🦋', score: 60  },
    { name: 'David Kim',     email: 'david@quizcraft.com',  grade: 'Grade 3', avatar: '🦁', score: 40  },
    { name: 'Emma Wilson',   email: 'emma@quizcraft.com',   grade: 'Grade 5', avatar: '🐬', score: 100 },
  ];

  const students = await Promise.all(
    studentData.map(s => User.create({ ...s, password: 'student123', role: 'student' }))
  );

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

  for (const [i, student] of students.entries()) {
    const pct   = studentData[i].score;
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
      timeTaken: 60 + i * 12,
    });
    await User.findByIdAndUpdate(student._id, {
      totalScore: pct,
      quizzesTaken: 1,
      badges: pct === 100 ? ['first-quiz', 'perfect-score'] : ['first-quiz'],
    });
  }

  console.log('✅  Demo data ready!');
  console.log('👩‍🏫  teacher@quizcraft.com  /  teacher123');
  console.log('🧒  alice@quizcraft.com     /  student123');
  console.log('🧒  bob@quizcraft.com       /  student123');
  console.log('🧒  carla@quizcraft.com     /  student123');
}
