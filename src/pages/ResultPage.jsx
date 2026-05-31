// Legacy ResultPage kept for standalone use without auth
// In the full platform, students use StudentQuizPage and teachers use TeacherGeneratePage
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz }         from '../context/QuizContext.jsx';
import { useNotification } from '../context/NotificationContext.jsx';
import MCQCard             from '../components/MCQCard.jsx';
import Spinner             from '../components/Spinner.jsx';
import { exportAsPDF, exportAsDOCX, exportAsJSON } from '../utils/exportUtils.js';

export default function ResultPage() {
  const { mcqs, quizMeta, clearQuiz } = useQuiz();
  const { push }   = useNotification();
  const navigate   = useNavigate();
  const [showAnswers,   setShowAnswers]   = useState(false);
  const [exportingPDF,  setExportingPDF]  = useState(false);
  const [exportingDOCX, setExportingDOCX] = useState(false);
  const [quizTitle,     setQuizTitle]     = useState(quizMeta.title || 'My Quiz');

  if (!mcqs.length) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center animate-fade-in">
        <div className="t-card p-12 max-w-sm mx-auto">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">No quiz loaded</h2>
          <p className="text-slate-500 mb-6">Go back to generate a quiz first.</p>
          <button onClick={() => navigate('/')} className="t-btn-primary mx-auto">← Back</button>
        </div>
      </div>
    );
  }

  async function handleExportPDF() {
    setExportingPDF(true);
    try { await exportAsPDF(quizTitle, mcqs); push('PDF downloaded!', 'success'); }
    catch (err) { push(err.message, 'error'); }
    finally { setExportingPDF(false); }
  }

  async function handleExportDOCX() {
    setExportingDOCX(true);
    try { await exportAsDOCX(quizTitle, mcqs); push('Word document downloaded!', 'success'); }
    catch (err) { push(err.message, 'error'); }
    finally { setExportingDOCX(false); }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans'" }}>{quizTitle}</h1>
          <div className="flex gap-2 mt-1">
            <span className="t-badge bg-teacher-50 text-teacher-700 border border-teacher-100">{quizMeta.difficulty}</span>
            <span className="t-badge bg-slate-100 text-slate-600">{mcqs.length} questions</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowAnswers(v => !v)} className="t-btn-secondary text-sm py-2">
            {showAnswers ? '🙈 Hide' : '👁 Show'} Answers
          </button>
          <button onClick={handleExportPDF} disabled={exportingPDF} className="t-btn-primary text-sm py-2">
            {exportingPDF ? <Spinner size="sm" className="text-white" /> : '⬇'} PDF
          </button>
          <button onClick={handleExportDOCX} disabled={exportingDOCX} className="t-btn-secondary text-sm py-2">
            {exportingDOCX ? <Spinner size="sm" className="text-teacher-600" /> : '⬇'} Word
          </button>
          <button onClick={() => { exportAsJSON(quizTitle, mcqs); push('JSON exported!', 'success'); }} className="t-btn-ghost text-sm py-2">JSON</button>
          <button onClick={() => { clearQuiz(); navigate('/'); }} className="t-btn-ghost text-sm py-2">🔄 New</button>
        </div>
      </div>
      <div className="space-y-4">
        {mcqs.map((mcq, idx) => <MCQCard key={mcq._id} mcq={mcq} index={idx} showAnswer={showAnswers} studentMode={false} />)}
      </div>
    </div>
  );
}
