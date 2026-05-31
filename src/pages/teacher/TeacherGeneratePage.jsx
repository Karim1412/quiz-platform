import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateMCQs, checkHealth, formatApiError } from '../../api/quizApi.js';
import { extractText, getFileType } from '../../utils/fileParser.js';
import { useNotification } from '../../context/NotificationContext.jsx';
import { useQuiz } from '../../context/QuizContext.jsx';
import { quizService } from '../../services/authService.js';
import { FullPageSpinner } from '../../components/Spinner.jsx';
import MCQCard from '../../components/MCQCard.jsx';
import { exportAsPDF, exportAsDOCX } from '../../utils/exportUtils.js';
import Spinner from '../../components/Spinner.jsx';

const DIFFICULTY_OPTIONS = [
  { value: 'easy',   label: 'Easy',   emoji: '🌱', desc: 'Basic recall & comprehension',    color: 'border-teal-400 bg-teal-50 text-teal-800' },
  { value: 'medium', label: 'Medium', emoji: '⚡', desc: 'Understanding & application',      color: 'border-teacher-400 bg-teacher-50 text-teacher-800' },
  { value: 'hard',   label: 'Hard',   emoji: '🔥', desc: 'Analysis, synthesis & evaluation', color: 'border-red-400 bg-red-50 text-red-800' },
];
const FILE_ICONS = {
  pdf:  { bg: 'bg-red-100',      emoji: '📄' },
  docx: { bg: 'bg-teacher-100',  emoji: '📝' },
  txt:  { bg: 'bg-teal-100',     emoji: '📃' },
};

export default function TeacherGeneratePage() {
  const [file,         setFile]         = useState(null);
  const [difficulty,   setDifficulty]   = useState('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [isDragging,   setIsDragging]   = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [loadingStep,  setLoadingStep]  = useState('');
  const [saving,       setSaving]       = useState(false);
  const [saved,        setSaved]        = useState(false);
  const [showAnswers,  setShowAnswers]  = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  const inputRef  = useRef(null);
  const { push }  = useNotification();
  const { mcqs, quizMeta, setQuiz, clearQuiz } = useQuiz();
  const navigate  = useNavigate();

  const fileType = file ? getFileType(file) : null;
  const fileMeta = fileType ? FILE_ICONS[fileType] : null;

  function validateAndSetFile(f) {
    const type = getFileType(f);
    if (!type) { push('Only PDF, DOCX, and TXT files are supported.', 'error'); return; }
    if (f.size > 20 * 1024 * 1024) { push('File too large (max 20 MB).', 'error'); return; }
    setFile(f); setSaved(false);
    push(`"${f.name}" loaded.`, 'success');
  }

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (f) validateAndSetFile(f);
    e.target.value = '';
  }

  const onDrop     = useCallback(e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) validateAndSetFile(f); }, []);
  const onDragOver = useCallback(e => { e.preventDefault(); setIsDragging(true); }, []);
  const onDragLeave= useCallback(e => { e.preventDefault(); setIsDragging(false); }, []);

  async function handleGenerate() {
    if (!file) { push('Please upload a document first.', 'warning'); return; }
    setLoading(true); setSaved(false);
    try {
      setLoadingStep('Connecting to AI service…');
      await checkHealth().catch(() => { throw new Error('Cannot reach AI server. Is it running?'); });
      setLoadingStep('Extracting text…');
      const text = await extractText(file);
      if (text.length < 50) throw new Error('Document too short.');
      setLoadingStep('Generating questions with AI…');
      const questions = await generateMCQs({ text, num_questions: numQuestions, difficulty });
      const titleBase = file.name.replace(/\.[^/.]+$/, '');
      setQuiz(questions, { title: `${titleBase} — Quiz`, difficulty, sourceFile: file.name, numRequested: numQuestions });
      push(`✅ ${questions.length} questions generated!`, 'success');
    } catch (err) {
      push(err?.response ? formatApiError(err) : (err.message || 'Unexpected error.'), 'error', 7000);
    } finally { setLoading(false); setLoadingStep(''); }
  }

  async function handleSaveToDatabase() {
    if (!mcqs.length) return;
    setSaving(true);
    try {
      await quizService.create({
        title: quizMeta.title,
        sourceFile: quizMeta.sourceFile,
        difficulty: quizMeta.difficulty,
        questions: mcqs.map(({ question, A, B, C, D, answer }) => ({ question, A, B, C, D, answer })),
      });
      setSaved(true);
      push('Quiz saved to database! Students can now take it.', 'success');
    } catch (err) {
      push(err.message, 'error');
    } finally { setSaving(false); }
  }

  async function handleExportPDF() {
    setExportingPDF(true);
    try { await exportAsPDF(quizMeta.title, mcqs); push('PDF downloaded!', 'success'); }
    catch (err) { push(`PDF failed: ${err.message}`, 'error'); }
    finally { setExportingPDF(false); }
  }

  const hasMcqs = mcqs.length > 0;

  return (
    <>
      {loading && <FullPageSpinner message={loadingStep || 'Generating quiz…'} />}
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f7ff 0%, #f0fdfa 100%)' }}>

        {/* Nav */}
        <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
            <button onClick={() => navigate('/teacher/dashboard')} className="t-btn-ghost text-sm">
              ← Dashboard
            </button>
            <h1 className="font-bold text-slate-800 text-lg" style={{ fontFamily: "'Plus Jakarta Sans'" }}>
              Generate Quiz
            </h1>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

          {/* Top section: upload + config */}
          {!hasMcqs && (
            <div className="grid lg:grid-cols-5 gap-6">
              {/* Upload zone */}
              <div className="lg:col-span-3">
                <label className="t-label">
                  Source Document
                  <span className="ml-1.5 text-slate-400 font-normal">PDF, DOCX, or TXT · max 20 MB</span>
                </label>
                <div
                  onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
                  onClick={() => !file && inputRef.current?.click()}
                  className={`min-h-52 rounded-2xl border-2 border-dashed flex items-center justify-center transition-all duration-200
                    ${file ? 'border-teal-300 bg-teal-50/40' : isDragging ? 'border-teacher-400 bg-teacher-50/60 scale-[1.01]' : 'border-slate-200 bg-white hover:border-teacher-300 hover:bg-teacher-50/30 cursor-pointer'}`}
                >
                  {file ? (
                    <div className="w-full px-6 py-4 flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl ${fileMeta?.bg} flex items-center justify-center text-2xl shrink-0`}>
                        {fileMeta?.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{file.name}</p>
                        <p className="text-sm text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <button onClick={e => { e.stopPropagation(); setFile(null); }}
                        className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">✕</button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 px-8 py-8 text-center pointer-events-none">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <svg className="w-7 h-7 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700 text-sm">{isDragging ? 'Drop it here!' : 'Drag & drop your document'}</p>
                        <p className="text-xs text-slate-400 mt-0.5">or click to browse</p>
                      </div>
                    </div>
                  )}
                </div>
                <input ref={inputRef} type="file" accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" onChange={handleFileChange} />
              </div>

              {/* Config panel */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                <div>
                  <label className="t-label">Difficulty</label>
                  <div className="flex flex-col gap-2">
                    {DIFFICULTY_OPTIONS.map(opt => (
                      <button key={opt.value} onClick={() => setDifficulty(opt.value)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all
                          ${difficulty === opt.value ? opt.color + ' shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'}`}>
                        <span className="text-lg">{opt.emoji}</span>
                        <div>
                          <p className="font-semibold text-sm">{opt.label}</p>
                          <p className="text-xs opacity-60">{opt.desc}</p>
                        </div>
                        {difficulty === opt.value && <svg className="w-4 h-4 ml-auto shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/></svg>}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="t-label">Questions: <span className="text-teacher-600 font-bold">{numQuestions}</span></label>
                  <input type="range" min={1} max={20} value={numQuestions}
                    onChange={e => setNumQuestions(Number(e.target.value))}
                    className="w-full accent-teacher-600 mt-1" />
                  <div className="flex justify-between text-xs text-slate-300 mt-1"><span>1</span><span>10</span><span>20</span></div>
                </div>
                <button onClick={handleGenerate} disabled={!file || loading}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl
                    bg-gradient-to-r from-teacher-600 to-teal-600 text-white font-bold text-base
                    hover:from-teacher-700 hover:to-teal-700 transition-all shadow-card-lg
                    disabled:opacity-40 disabled:cursor-not-allowed">
                  ✨ Generate Quiz
                </button>
              </div>
            </div>
          )}

          {/* Results panel — shown after generation */}
          {hasMcqs && (
            <div className="animate-fade-in">
              {/* Action bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-4 bg-white rounded-2xl border border-slate-100 shadow-card">
                <div>
                  <h2 className="font-bold text-slate-800 text-lg" style={{ fontFamily: "'Plus Jakarta Sans'" }}>
                    {quizMeta.title}
                  </h2>
                  <div className="flex gap-2 mt-1">
                    <span className="t-badge bg-teacher-50 text-teacher-700 border border-teacher-100">{quizMeta.difficulty}</span>
                    <span className="t-badge bg-slate-100 text-slate-600">{mcqs.length} questions</span>
                    {saved && <span className="t-badge bg-green-100 text-green-700">✅ Saved</span>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setShowAnswers(v => !v)} className="t-btn-secondary text-sm py-2">
                    {showAnswers ? '🙈 Hide' : '👁 Show'} Answers
                  </button>
                  <button onClick={handleExportPDF} disabled={exportingPDF} className="t-btn-secondary text-sm py-2">
                    {exportingPDF ? <Spinner size="sm" className="text-teacher-700" /> : '⬇'} PDF
                  </button>
                  <button onClick={handleSaveToDatabase} disabled={saving || saved}
                    className="t-btn-primary text-sm py-2">
                    {saving ? <Spinner size="sm" className="text-white" /> : saved ? '✅' : '💾'}
                    {saving ? 'Saving…' : saved ? 'Saved!' : 'Save to Database'}
                  </button>
                  <button onClick={() => { clearQuiz(); setFile(null); setSaved(false); }}
                    className="t-btn-ghost text-sm py-2">
                    🔄 New Quiz
                  </button>
                </div>
              </div>

              {/* MCQ cards */}
              <div className="space-y-4">
                {mcqs.map((mcq, idx) => (
                  <MCQCard key={mcq._id} mcq={mcq} index={idx} showAnswer={showAnswers} studentMode={false} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
