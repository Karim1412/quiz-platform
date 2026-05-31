import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotification } from '../../context/NotificationContext.jsx';
import { quizService, userService, resultService } from '../../services/authService.js';
import Spinner from '../../components/Spinner.jsx';

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const { push }         = useNotification();
  const navigate         = useNavigate();

  const [quizzes,  setQuizzes]  = useState([]);
  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [tab, setTab]           = useState('quizzes'); // 'quizzes' | 'students'
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizResults,  setQuizResults]  = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [q, s] = await Promise.all([quizService.list(), userService.students()]);
        setQuizzes(q);
        setStudents(s);
      } catch (err) {
        push(err.message, 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleDelete(id) {
    if (!confirm('Delete this quiz? This cannot be undone.')) return;
    try {
      await quizService.remove(id);
      setQuizzes(prev => prev.filter(q => q._id !== id));
      push('Quiz deleted.', 'success');
    } catch (err) { push(err.message, 'error'); }
  }

  async function handleTogglePublish(id) {
    try {
      const updated = await quizService.togglePublish(id);
      setQuizzes(prev => prev.map(q => q._id === id ? updated : q));
    } catch (err) { push(err.message, 'error'); }
  }

  async function viewResults(quiz) {
    setSelectedQuiz(quiz);
    setLoadingResults(true);
    try {
      const { results } = await resultService.forQuiz(quiz._id);
      setQuizResults(results);
    } catch (err) { push(err.message, 'error'); }
    finally { setLoadingResults(false); }
  }

  const totalPlays = quizzes.reduce((s, q) => s + (q.timesPlayed || 0), 0);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" className="text-teacher-500" />
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f7ff 0%, #f0fdfa 100%)' }}>

      {/* Top Nav */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teacher-500 to-teal-500 flex items-center justify-center">
              <span className="text-white text-sm font-bold">Q</span>
            </div>
            <span className="font-bold text-slate-800" style={{ fontFamily: "'Plus Jakarta Sans'" }}>QuizCraft</span>
            <span className="hidden sm:block text-xs bg-teacher-50 text-teacher-600 font-semibold px-2 py-0.5 rounded-full border border-teacher-100">
              Teacher Studio
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-slate-500">👋 {user?.name}</span>
            <Link to="/teacher/generate"
              className="t-btn-primary text-sm py-2">
              + New Quiz
            </Link>
            <button onClick={() => { logout(); navigate('/login'); }}
              className="t-btn-ghost text-sm py-2">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Quizzes created', value: quizzes.length, icon: '📋', color: 'from-teacher-500 to-teacher-400' },
            { label: 'Total plays',     value: totalPlays,      icon: '🎯', color: 'from-teal-500 to-teal-400' },
            { label: 'Students',        value: students.length, icon: '🧒', color: 'from-purple-500 to-purple-400' },
            { label: 'Published',       value: quizzes.filter(q => q.isPublished).length, icon: '✅', color: 'from-green-500 to-green-400' },
          ].map(stat => (
            <div key={stat.label} className="t-card p-4 flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-xl shrink-0`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans'" }}>{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'quizzes',  label: '📋 My Quizzes' },
            { id: 'students', label: '🧒 Students' },
            { id: 'results',  label: '📊 Results' },
          ].map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setSelectedQuiz(null); }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all
                ${tab === t.id ? 'bg-teacher-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:border-teacher-300'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* QUIZZES TAB */}
        {tab === 'quizzes' && (
          <div>
            {quizzes.length === 0 ? (
              <div className="t-card p-12 text-center">
                <div className="text-5xl mb-3">📋</div>
                <h3 className="text-lg font-bold text-slate-700 mb-2">No quizzes yet</h3>
                <p className="text-slate-400 mb-4">Upload a document to generate your first quiz.</p>
                <Link to="/teacher/generate" className="t-btn-primary">+ Generate Quiz</Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {quizzes.map(quiz => (
                  <div key={quiz._id} className="t-card p-5 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2">
                        {quiz.title}
                      </h3>
                      <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-semibold
                        ${quiz.isPublished ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {quiz.isPublished ? 'Live' : 'Hidden'}
                      </span>
                    </div>
                    <div className="flex gap-2 flex-wrap text-xs text-slate-400">
                      <span>📝 {quiz.questions.length} questions</span>
                      <span>🎯 {quiz.difficulty}</span>
                      <span>▶ {quiz.timesPlayed} plays</span>
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <button onClick={() => { setTab('results'); viewResults(quiz); }}
                        className="t-btn-ghost text-xs py-1.5 flex-1 justify-center">
                        📊 Results
                      </button>
                      <button onClick={() => handleTogglePublish(quiz._id)}
                        className="t-btn-ghost text-xs py-1.5 flex-1 justify-center">
                        {quiz.isPublished ? '🙈 Hide' : '👁 Show'}
                      </button>
                      <button onClick={() => handleDelete(quiz._id)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors text-xs">
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
                {/* Add new card */}
                <Link to="/teacher/generate"
                  className="t-card p-5 flex flex-col items-center justify-center gap-3 border-dashed border-2 border-slate-200 hover:border-teacher-400 hover:bg-teacher-50/30 transition-all text-slate-400 hover:text-teacher-600 min-h-[160px]">
                  <div className="text-3xl">+</div>
                  <p className="text-sm font-semibold">New Quiz</p>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* STUDENTS TAB */}
        {tab === 'students' && (
          <div className="t-card overflow-hidden">
            {students.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <div className="text-5xl mb-3">🧒</div>
                <p>No students registered yet.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Student', 'Grade', 'Quizzes', 'Total Score', 'Badges'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {students.map((s, i) => (
                    <tr key={s._id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{s.avatar || '🧒'}</span>
                          <div>
                            <p className="font-semibold text-slate-800">{s.name}</p>
                            <p className="text-xs text-slate-400">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{s.grade || '—'}</td>
                      <td className="px-4 py-3 text-slate-600">{s.quizzesTaken}</td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-teacher-600">{s.totalScore}</span>
                        <span className="text-slate-400 text-xs"> pts</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {s.badges?.map(b => (
                            <span key={b} className="text-base" title={b}>
                              {b === 'first-quiz' ? '🏅' : b === 'perfect-score' ? '⭐' : b === 'quiz-master' ? '🏆' : '🎖'}
                            </span>
                          ))}
                          {(!s.badges || s.badges.length === 0) && <span className="text-slate-300 text-xs">—</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* RESULTS TAB */}
        {tab === 'results' && (
          <div>
            {!selectedQuiz ? (
              <div>
                <p className="text-slate-500 mb-4 text-sm">Select a quiz to view its results:</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quizzes.map(quiz => (
                    <button key={quiz._id} onClick={() => viewResults(quiz)}
                      className="t-card p-5 text-left hover:shadow-card-lg hover:-translate-y-0.5 transition-all">
                      <p className="font-bold text-slate-800 text-sm mb-1 line-clamp-2">{quiz.title}</p>
                      <p className="text-xs text-slate-400">▶ {quiz.timesPlayed} attempts</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <button onClick={() => setSelectedQuiz(null)} className="t-btn-ghost text-xs mb-4 -ml-1">
                  ← All Quizzes
                </button>
                <h3 className="font-bold text-slate-800 mb-4" style={{ fontFamily: "'Plus Jakarta Sans'" }}>
                  📊 Results: {selectedQuiz.title}
                </h3>
                {loadingResults ? (
                  <div className="flex justify-center py-12"><Spinner size="lg" className="text-teacher-500" /></div>
                ) : quizResults.length === 0 ? (
                  <div className="t-card p-10 text-center text-slate-400">
                    <div className="text-4xl mb-2">📭</div>
                    <p>No students have attempted this quiz yet.</p>
                  </div>
                ) : (
                  <div className="t-card overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          {['Rank', 'Student', 'Grade', 'Score', 'Time', 'Date'].map(h => (
                            <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {quizResults.map((r, i) => (
                          <tr key={r._id} className={i < 3 ? 'bg-amber-50/30' : ''}>
                            <td className="px-4 py-3 font-bold text-slate-700">
                              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-800">{r.student?.name}</td>
                            <td className="px-4 py-3 text-slate-500">{r.student?.grade || '—'}</td>
                            <td className="px-4 py-3">
                              <span className={`font-bold ${r.percentage >= 80 ? 'text-green-600' : r.percentage >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                                {r.score}/{r.totalQuestions}
                              </span>
                              <span className="text-slate-400 text-xs ml-1">({r.percentage}%)</span>
                            </td>
                            <td className="px-4 py-3 text-slate-400">{r.timeTaken}s</td>
                            <td className="px-4 py-3 text-slate-400">
                              {new Date(r.completedAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
