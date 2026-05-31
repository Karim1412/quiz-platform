import { useState } from 'react';
import { useQuiz } from '../context/QuizContext.jsx';

const OPTION_KEYS = ['A', 'B', 'C', 'D'];

const T_OPTION = {
  A: { base: 'bg-teal-50 border-teal-200',        correct: 'bg-teal-500 border-teal-500 text-white',       dot: 'bg-teal-200 text-teal-700' },
  B: { base: 'bg-blue-50 border-blue-200',         correct: 'bg-blue-500 border-blue-500 text-white',       dot: 'bg-blue-200 text-blue-700' },
  C: { base: 'bg-amber-50 border-amber-200',        correct: 'bg-amber-500 border-amber-500 text-white',     dot: 'bg-amber-200 text-amber-700' },
  D: { base: 'bg-purple-50 border-purple-200',      correct: 'bg-purple-500 border-purple-500 text-white',   dot: 'bg-purple-200 text-purple-700' },
};

// studentMode prop explicitly controls rendering — no context dependency
export default function MCQCard({ mcq, index, showAnswer, studentMode = false }) {
  return studentMode
    ? <StudentCard mcq={mcq} index={index} />
    : <TeacherCard mcq={mcq} index={index} showAnswer={showAnswer} />;
}

function TeacherCard({ mcq, index, showAnswer }) {
  const { updateQuestion, deleteQuestion } = useQuiz();
  const [editing,    setEditing]    = useState(false);
  const [draft,      setDraft]      = useState(mcq);
  const [confirming, setConfirming] = useState(false);

  function handleSave()   { updateQuestion(mcq._id, draft); setEditing(false); }
  function handleCancel() { setDraft(mcq); setEditing(false); }
  function handleDelete() { deleteQuestion(mcq._id); }

  return (
    <article className="t-card animate-fade-in group">
      <div className="flex items-start justify-between gap-4 p-5 pb-3">
        <div className="flex items-start gap-3 flex-1">
          <span className="shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-teacher-500 to-teal-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">
            {index + 1}
          </span>
          {editing ? (
            <textarea className="t-input text-sm font-semibold resize-none flex-1" rows={2}
              value={draft.question} onChange={e => setDraft(d => ({ ...d, question: e.target.value }))} autoFocus />
          ) : (
            <p className="text-sm font-semibold text-slate-800 leading-snug flex-1">{mcq.question}</p>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {!editing && !confirming && (
            <>
              <button onClick={() => setEditing(true)} className="p-2 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Edit">
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z"/>
                  <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z"/>
                </svg>
              </button>
              <button onClick={() => setConfirming(true)} className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Delete">
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd"/>
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {confirming && (
        <div className="mx-5 mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between gap-3">
          <p className="text-sm text-red-700 font-semibold">Delete this question?</p>
          <div className="flex gap-2">
            <button onClick={() => setConfirming(false)} className="t-btn-ghost text-xs py-1.5 px-3">Cancel</button>
            <button onClick={handleDelete} className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600">Delete</button>
          </div>
        </div>
      )}

      <div className="px-5 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {OPTION_KEYS.map(opt => {
          const isCorrect = mcq.answer === opt;
          const s = T_OPTION[opt];
          return (
            <div key={opt} className={`flex items-start gap-2.5 px-3 py-2.5 rounded-xl border text-sm transition-all ${showAnswer && isCorrect ? s.correct : s.base}`}>
              {editing ? (
                <button onClick={() => setDraft(d => ({ ...d, answer: opt }))}
                  className={`shrink-0 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center mt-0.5 transition-all ${draft.answer === opt ? 'bg-slate-800 text-white' : s.dot + ' border border-transparent'}`}>
                  {opt}
                </button>
              ) : (
                <span className={`shrink-0 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center mt-0.5 ${showAnswer && isCorrect ? 'bg-white/30 text-white' : s.dot}`}>{opt}</span>
              )}
              {editing ? (
                <input className="flex-1 bg-transparent outline-none text-sm" value={draft[opt]}
                  onChange={e => setDraft(d => ({ ...d, [opt]: e.target.value }))} placeholder={`Option ${opt}`} />
              ) : (
                <span className={`flex-1 leading-snug ${showAnswer && isCorrect ? 'text-white font-semibold' : 'text-slate-700'}`}>{mcq[opt]}</span>
              )}
              {showAnswer && isCorrect && !editing && (
                <svg className="w-4 h-4 text-white shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/>
                </svg>
              )}
            </div>
          );
        })}
      </div>

      {editing && (
        <div className="px-5 pb-4 flex gap-2 justify-end border-t border-slate-100 pt-3">
          <p className="text-xs text-slate-400 flex-1 self-center">Click option letter to mark correct</p>
          <button onClick={handleCancel} className="t-btn-ghost text-xs">Cancel</button>
          <button onClick={handleSave} className="t-btn-primary text-xs py-2 px-4">Save</button>
        </div>
      )}
    </article>
  );
}

function StudentCard({ mcq, index }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const S_OPT = {
    A: { bg: '#4CC9F0', shadow: '#1a9fbf' },
    B: { bg: '#06D6A0', shadow: '#04a87e' },
    C: { bg: '#FFD93D', shadow: '#c9a800' },
    D: { bg: '#FF6B35', shadow: '#c94d1a' },
  };

  function pick(opt) {
    if (revealed) return;
    setSelected(opt);
    setRevealed(true);
  }

  const isRight = selected === mcq.answer;

  return (
    <article className="s-card p-6 animate-bounce-in" style={{ fontFamily: 'Nunito' }}>
      <div className="flex items-start gap-3 mb-5">
        <div className="shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-base"
          style={{ background: '#9B5DE5', boxShadow: '0 3px 0 #6b3daa' }}>{index + 1}</div>
        <p className="font-bold text-slate-800 text-base leading-snug flex-1">{mcq.question}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {OPTION_KEYS.map(opt => {
          const s = S_OPT[opt];
          const isSelected    = selected === opt;
          const isCorrectOpt  = mcq.answer === opt;
          let bg = 'white', border = '#e2e8f0', color = '#334155', shadow = '0 3px 0 #cbd5e1';
          if (revealed) {
            if (isSelected && isRight)     { bg = '#06D6A0'; border = '#04a87e'; color = 'white'; shadow = '0 3px 0 #04a87e'; }
            else if (isSelected)           { bg = '#FF6B35'; border = '#c94d1a'; color = 'white'; shadow = '0 3px 0 #c94d1a'; }
            else if (isCorrectOpt)         { bg = '#06D6A0'; border = '#04a87e'; color = 'white'; shadow = '0 3px 0 #04a87e'; }
            else                           { bg = '#f8fafc'; color = '#cbd5e1'; shadow = 'none'; }
          }
          return (
            <button key={opt} onClick={() => pick(opt)} disabled={revealed}
              className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl border-4 text-left font-bold text-sm disabled:cursor-default transition-all"
              style={{ background: bg, borderColor: border, color, boxShadow: shadow }}>
              <span className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm text-white shrink-0"
                style={{ background: s.bg, boxShadow: `0 3px 0 ${s.shadow}` }}>{opt}</span>
              <span className="flex-1 leading-snug">{mcq[opt]}</span>
              {revealed && isSelected && isRight    && <span className="ml-auto">🎉</span>}
              {revealed && isSelected && !isRight   && <span className="ml-auto">😅</span>}
              {revealed && !isSelected && isCorrectOpt && <span className="ml-auto">✅</span>}
            </button>
          );
        })}
      </div>
      {revealed && (
        <div className={`mt-4 rounded-2xl p-3 text-center font-black text-base ${isRight ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {isRight ? '⭐ Awesome! Correct!' : `😬 The answer was ${mcq.answer}: ${mcq[mcq.answer]}`}
        </div>
      )}
    </article>
  );
}
