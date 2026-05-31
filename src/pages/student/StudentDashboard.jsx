import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotification } from '../../context/NotificationContext.jsx';
import { quizService, resultService } from '../../services/authService.js';

const BADGE_META = {
  'first-quiz':    { emoji: '🏅', label: 'First Quiz!' },
  'perfect-score': { emoji: '⭐', label: 'Perfect Score' },
  'quiz-master':   { emoji: '🏆', label: 'Quiz Master' },
};

const DIFF_COLOR = {
  easy:   { bg: 'bg-green-400',  shadow: '#04a87e', text: '🟢 Easy' },
  medium: { bg: 'bg-blue-400',   shadow: '#1a9fbf', text: '🔵 Medium' },
  hard:   { bg: 'bg-orange-400', shadow: '#c94d1a', text: '🟠 Hard' },
};

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const { push }         = useNotification();
  const navigate         = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('quizzes');

  useEffect(() => {
    async function load() {
      try {
        const [q, h] = await Promise.all([quizService.list(), resultService.myHistory()]);
        setQuizzes(q);
        setHistory(h);
      } catch (err) {
        push(err.message, 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const completedIds = new Set(history.map(r => r.quiz?._id));
  const avgScore = history.length
    ? Math.round(history.reduce((s, r) => s + r.percentage, 0) / history.length)
    : 0;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(160deg, #FFF9DB 0%, #E8F7FD 40%, #E6FFF6 100%)' }}>
      <div className="text-6xl animate-bounce">⚡</div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ fontFamily: 'Nunito, system-ui, sans-serif', background: 'linear-gradient(160deg, #FFF9DB 0%, #E8F7FD 40%, #E6FFF6 100%)' }}>

      {/* Top Nav */}
      <header className="bg-white/80 backdrop-blur-md border-b-4 border-play-yellow/40 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{user?.avatar || '🧒'}</span>
            <div>
              <p className="font-black text-slate-800 text-sm leading-none">{user?.name}</p>
              <p className="text-xs text-slate-400 font-bold">{user?.grade || 'Student'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* XP pill */}
            <div className="flex items-center gap-1.5 bg-play-yellow/20 rounded-full px-3 py-1.5 border-2 border-play-yellow/30">
              <span className="text-base">⭐</span>
              <span className="font-black text-sm text-amber-700">{user?.totalScore || 0} XP</span>
            </div>
            <button onClick={() => { logout(); navigate('/login'); }}
              className="text-slate-400 hover:text-slate-600 text-sm font-bold px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors">
              Exit
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">

        {/* Welcome header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-2 inline-block animate-float">{user?.avatar || '🧒'}</div>
          <h1 className="text-2xl font-black text-slate-800">
            Hey, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-500 font-bold text-sm">Ready to learn something awesome today?</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Quizzes done', value: history.length, emoji: '🎯', color: '#4CC9F0' },
            { label: 'Avg score',    value: `${avgScore}%`, emoji: '📊', color: '#06D6A0' },
            { label: 'Total XP',     value: user?.totalScore || 0, emoji: '⭐', color: '#FFD93D' },
          ].map(s => (
            <div key={s.label} className="s-card p-4 text-center">
              <div className="text-2xl mb-1">{s.emoji}</div>
              <div className="text-xl font-black text-slate-800">{s.value}</div>
              <div className="text-xs font-bold text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Badges */}
        {user?.badges?.length > 0 && (
          <div className="s-card p-4 mb-6">
            <p className="font-black text-slate-700 text-sm mb-3">🏆 Your Badges</p>
            <div className="flex flex-wrap gap-3">
              {user.badges.map(b => (
                <div key={b} className="flex items-center gap-2 bg-play-yellow/20 rounded-2xl px-3 py-2 border-2 border-play-yellow/30">
                  <span className="text-xl">{BADGE_META[b]?.emoji || '🎖'}</span>
                  <span className="text-xs font-black text-amber-800">{BADGE_META[b]?.label || b}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-3 mb-5">
          {[
            { id: 'quizzes', label: '📋 Quizzes' },
            { id: 'history', label: '📈 My History' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="px-5 py-2.5 rounded-2xl font-black text-sm transition-all border-4"
              style={{
                background:   tab === t.id ? '#9B5DE5' : 'white',
                color:        tab === t.id ? 'white'   : '#64748b',
                borderColor:  tab === t.id ? '#6b3daa' : '#e2e8f0',
                boxShadow:    tab === t.id ? '0 4px 0 #6b3daa' : '0 3px 0 #e2e8f0',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* QUIZZES */}
        {tab === 'quizzes' && (
          <div className="space-y-4">
            {quizzes.length === 0 ? (
              <div className="s-card p-10 text-center">
                <div className="text-5xl mb-3">😴</div>
                <p className="font-black text-slate-700">No quizzes available yet!</p>
                <p className="text-slate-400 text-sm font-bold mt-1">Ask your teacher to create some.</p>
              </div>
            ) : (
              quizzes.map(quiz => {
                const done  = completedIds.has(quiz._id);
                const dconf = DIFF_COLOR[quiz.difficulty] || DIFF_COLOR.medium;
                const result = history.find(r => r.quiz?._id === quiz._id);
                return (
                  <div key={quiz._id} className="s-card p-5">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                        style={{ background: dconf.bg.replace('bg-', ''), backgroundColor: done ? '#06D6A0' : undefined }}>
                        {done ? '✅' : '📋'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-slate-800 text-base leading-snug line-clamp-2">{quiz.title}</h3>
                        <div className="flex flex-wrap gap-2 mt-1.5">
                          <span className="text-xs font-bold text-slate-500">📝 {quiz.questions.length} questions</span>
                          <span className="text-xs font-bold text-slate-500">{dconf.text}</span>
                          {done && result && (
                            <span className="text-xs font-black text-green-600">✅ {result.percentage}%</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/student/quiz/${quiz._id}`)}
                        className="shrink-0 px-4 py-3 rounded-2xl font-black text-sm text-white transition-all active:translate-y-0.5"
                        style={{
                          background:  done ? '#06D6A0' : '#FF6B35',
                          boxShadow:   done ? '0 4px 0 #04a87e' : '0 4px 0 #c94d1a',
                        }}>
                        {done ? '🔄 Retry' : '▶ Play!'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* HISTORY */}
        {tab === 'history' && (
          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="s-card p-10 text-center">
                <div className="text-5xl mb-3">📭</div>
                <p className="font-black text-slate-700">No quizzes taken yet!</p>
                <p className="text-slate-400 text-sm font-bold mt-1">Go play some quizzes first.</p>
              </div>
            ) : (
              history.map(r => (
                <div key={r._id} className="s-card p-4 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black text-white shrink-0
                    ${r.percentage >= 80 ? 'bg-play-green' : r.percentage >= 50 ? 'bg-play-blue' : 'bg-play-orange'}`}>
                    {r.percentage}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-800 text-sm truncate">{r.quiz?.title || 'Quiz'}</p>
                    <p className="text-xs font-bold text-slate-400">{r.score}/{r.totalQuestions} correct · {new Date(r.completedAt).toLocaleDateString()}</p>
                  </div>
                  <span className="text-xl">
                    {r.percentage === 100 ? '🏆' : r.percentage >= 80 ? '⭐' : r.percentage >= 50 ? '👍' : '💪'}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
