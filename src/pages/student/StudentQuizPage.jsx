import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext.jsx';
import { quizService, resultService } from '../../services/authService.js';
import { useAuth } from '../../context/AuthContext.jsx';

const OPT_COLORS = {
  A: { bg: '#4CC9F0', shadow: '#1a9fbf' },
  B: { bg: '#06D6A0', shadow: '#04a87e' },
  C: { bg: '#FFD93D', shadow: '#c9a800' },
  D: { bg: '#FF6B35', shadow: '#c94d1a' },
};

export default function StudentQuizPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { push }   = useNotification();
  const { updateUser } = useAuth();

  const [quiz,     setQuiz]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers,  setAnswers]  = useState({}); // { questionIndex: 'A'|'B'|'C'|'D' }
  const [revealed, setRevealed] = useState({}); // { questionIndex: true }
  const [finished, setFinished] = useState(false);
  const [result,   setResult]   = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [elapsed,  setElapsed]  = useState(0);

  const timerRef = useRef(null);

  useEffect(() => {
    quizService.get(id)
      .then(q => setQuiz(q))
      .catch(err => { push(err.message, 'error'); navigate('/student/dashboard'); })
      .finally(() => setLoading(false));

    // Start timer
    timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [id]);

  async function pickAnswer(questionIndex, opt) {
    if (revealed[questionIndex]) return;
    const newAnswers  = { ...answers,  [questionIndex]: opt };
    const newRevealed = { ...revealed, [questionIndex]: true };
    setAnswers(newAnswers);
    setRevealed(newRevealed);

    // Auto-advance after 1.5s
    if (questionIndex < quiz.questions.length - 1) {
      setTimeout(() => setCurrentQ(questionIndex + 1), 1500);
    }
  }

  async function handleSubmit() {
    if (submitting) return;
    clearInterval(timerRef.current);
    setSubmitting(true);
    try {
      const answersPayload = Object.entries(answers).map(([qi, selected]) => ({
        questionIndex: parseInt(qi),
        selected,
      }));
      const data = await resultService.submit({
        quizId: quiz._id,
        answers: answersPayload,
        timeTaken: elapsed,
      });
      setResult(data);
      setFinished(true);
      // Update XP in context
      updateUser({ totalScore: (prev => prev) });
      if (data.newBadges?.length) {
        push(`🏅 New badge unlocked: ${data.newBadges.join(', ')}!`, 'success', 6000);
      }
    } catch (err) {
      push(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(160deg, #FFF9DB 0%, #E8F7FD 40%, #E6FFF6 100%)', fontFamily: 'Nunito' }}>
      <div className="text-center">
        <div className="text-6xl animate-bounce mb-4">🧠</div>
        <p className="font-black text-slate-700 text-xl">Loading quiz…</p>
      </div>
    </div>
  );

  if (!quiz) return null;

  const total    = quiz.questions.length;
  const answered = Object.keys(answers).length;
  const progress = Math.round((answered / total) * 100);
  const allDone  = answered === total;

  // ── FINISHED SCREEN ──────────────────────────────────────────────────────
  if (finished && result) {
    const { score, total: tot, percentage } = result;
    const stars = percentage >= 80 ? 3 : percentage >= 50 ? 2 : 1;

    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ fontFamily: 'Nunito', background: 'linear-gradient(160deg, #FFF9DB 0%, #E8F7FD 40%, #E6FFF6 100%)' }}>
        <div className="w-full max-w-md text-center animate-bounce-in">
          <div className="s-card p-8">
            <div className="text-7xl mb-4 animate-float inline-block">
              {percentage === 100 ? '🏆' : percentage >= 80 ? '🌟' : percentage >= 50 ? '👍' : '💪'}
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-1">
              {percentage === 100 ? 'Perfect!' : percentage >= 80 ? 'Great job!' : percentage >= 50 ? 'Good effort!' : 'Keep trying!'}
            </h2>
            <p className="text-slate-500 font-bold mb-5">{quiz.title}</p>

            {/* Stars */}
            <div className="flex justify-center gap-2 mb-5">
              {[1,2,3].map(s => (
                <span key={s} className="text-4xl" style={{ opacity: s <= stars ? 1 : 0.2 }}>⭐</span>
              ))}
            </div>

            {/* Big score */}
            <div className="w-32 h-32 rounded-full mx-auto mb-5 flex flex-col items-center justify-center border-8"
              style={{ borderColor: '#FFD93D', background: '#FFFBEB' }}>
              <div className="text-4xl font-black text-slate-800">{percentage}%</div>
              <div className="text-xs font-bold text-slate-400">{score}/{tot} correct</div>
            </div>

            {/* XP earned */}
            <div className="inline-flex items-center gap-2 bg-play-yellow/20 rounded-2xl px-4 py-2 border-2 border-play-yellow/40 mb-5">
              <span className="text-xl">⭐</span>
              <span className="font-black text-amber-700">+{percentage} XP earned!</span>
            </div>

            {/* Per-question result dots */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {quiz.questions.map((q, i) => {
                const correct = answers[i] === q.answer;
                return (
                  <div key={i} className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-white
                    ${correct ? 'bg-play-green' : 'bg-red-400'}`}>
                    {i + 1}
                  </div>
                );
              })}
            </div>

            {/* Badges */}
            {result.newBadges?.length > 0 && (
              <div className="mb-5 p-3 bg-amber-50 rounded-2xl border-2 border-amber-200">
                <p className="font-black text-amber-800 text-sm mb-2">🎉 New Badge Unlocked!</p>
                <div className="flex justify-center gap-2">
                  {result.newBadges.map(b => (
                    <span key={b} className="text-2xl">
                      {b === 'first-quiz' ? '🏅' : b === 'perfect-score' ? '⭐' : '🏆'}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => navigate('/student/leaderboard')}
                className="flex-1 py-4 rounded-3xl font-black text-base text-slate-800 transition-all active:translate-y-0.5"
                style={{ background: '#4CC9F0', boxShadow: '0 5px 0 #1a9fbf' }}>
                🏆 Leaderboard
              </button>
              <button onClick={() => navigate('/student/dashboard')}
                className="flex-1 py-4 rounded-3xl font-black text-base text-slate-800 transition-all active:translate-y-0.5"
                style={{ background: '#FFD93D', boxShadow: '0 5px 0 #c9a800' }}>
                🏠 Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── QUIZ SCREEN ───────────────────────────────────────────────────────────
  const q = quiz.questions[currentQ];

  return (
    <div className="min-h-screen" style={{ fontFamily: 'Nunito', background: 'linear-gradient(160deg, #FFF9DB 0%, #E8F7FD 40%, #E6FFF6 100%)' }}>

      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b-4 border-slate-100 px-4 py-3">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => navigate('/student/dashboard')} className="text-slate-400 text-xl">←</button>
            <span className="font-black text-slate-700 text-sm">{currentQ + 1} / {total}</span>
            <div className="flex items-center gap-1 bg-slate-100 rounded-full px-2 py-1">
              <span className="text-xs">⏱</span>
              <span className="font-black text-xs text-slate-600">
                {Math.floor(elapsed/60)}:{String(elapsed%60).padStart(2,'0')}
              </span>
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6">

        {/* Question */}
        <div className="s-card p-6 mb-5 text-center">
          <span className="inline-block bg-purple-100 text-purple-700 text-xs font-black px-3 py-1 rounded-full mb-3">
            Question {currentQ + 1}
          </span>
          <p className="text-xl font-black text-slate-800 leading-snug">{q.question}</p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 gap-3 mb-6">
          {['A','B','C','D'].map(opt => {
            const s          = OPT_COLORS[opt];
            const isSelected = answers[currentQ] === opt;
            const isRevealed = !!revealed[currentQ];
            const isCorrect  = q.answer === opt;

            let bg      = 'white';
            let border  = '#e2e8f0';
            let color   = '#334155';
            let shadow  = '0 4px 0 #cbd5e1';

            if (isRevealed) {
              if (isSelected && isCorrect)  { bg = '#06D6A0'; border = '#04a87e'; color = 'white'; shadow = '0 4px 0 #04a87e'; }
              else if (isSelected)          { bg = '#FF6B35'; border = '#c94d1a'; color = 'white'; shadow = '0 4px 0 #c94d1a'; }
              else if (isCorrect)           { bg = '#06D6A0'; border = '#04a87e'; color = 'white'; shadow = '0 4px 0 #04a87e'; }
              else                          { bg = '#f8fafc'; color = '#cbd5e1'; shadow = 'none'; }
            }

            return (
              <button key={opt}
                onClick={() => pickAnswer(currentQ, opt)}
                disabled={isRevealed}
                className="flex items-center gap-4 w-full px-5 py-4 rounded-2xl border-4 text-left font-bold text-base transition-all duration-150 disabled:cursor-default"
                style={{ background: bg, borderColor: border, color, boxShadow: shadow }}
              >
                <span className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 text-white"
                  style={{ background: s.bg, boxShadow: `0 3px 0 ${s.shadow}` }}>
                  {opt}
                </span>
                <span className="flex-1 leading-snug">{q[opt]}</span>
                {isRevealed && isSelected && isCorrect  && <span className="ml-auto text-xl">🎉</span>}
                {isRevealed && isSelected && !isCorrect && <span className="ml-auto text-xl">😅</span>}
                {isRevealed && !isSelected && isCorrect && <span className="ml-auto text-xl">✅</span>}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {revealed[currentQ] && (
          <div className={`rounded-2xl p-4 text-center font-black text-base mb-4 animate-bounce-in
            ${answers[currentQ] === q.answer ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {answers[currentQ] === q.answer
              ? '🌟 Awesome! That\'s right!'
              : `😬 The answer was ${q.answer}: ${q[q.answer]}`}
          </div>
        )}

        {/* Question nav dots */}
        <div className="flex flex-wrap justify-center gap-2">
          {quiz.questions.map((qq, i) => (
            <button key={i} onClick={() => setCurrentQ(i)}
              className="w-8 h-8 rounded-xl font-black text-xs transition-all text-white"
              style={{
                background: i === currentQ ? '#9B5DE5' : answers[i] !== undefined ? (answers[i] === qq.answer ? '#06D6A0' : '#FF6B35') : '#e2e8f0',
                color: i === currentQ || answers[i] !== undefined ? 'white' : '#94a3b8',
                boxShadow: i === currentQ ? '0 3px 0 #6b3daa' : 'none',
                transform: i === currentQ ? 'scale(1.15)' : 'scale(1)',
              }}>
              {i + 1}
            </button>
          ))}
        </div>

        {/* Submit when all answered */}
        {allDone && !finished && (
          <button onClick={handleSubmit} disabled={submitting}
            className="mt-6 w-full py-5 rounded-3xl font-black text-2xl text-slate-800 transition-all active:translate-y-1 disabled:opacity-50"
            style={{ background: '#FFD93D', boxShadow: '0 6px 0 #c9a800' }}>
            {submitting
              ? <span className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 border-4 border-slate-800/30 border-t-slate-800 rounded-full animate-spin" />
                  Submitting…
                </span>
              : '🏁 Submit Quiz!'}
          </button>
        )}
      </div>
    </div>
  );
}
