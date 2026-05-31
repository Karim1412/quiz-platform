// Legacy UploadPage - preserved for non-auth context
import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateMCQs, checkHealth, formatApiError } from '../api/quizApi.js';
import { extractText, getFileType } from '../utils/fileParser.js';
import { useNotification } from '../context/NotificationContext.jsx';
import { useQuiz } from '../context/QuizContext.jsx';
import { FullPageSpinner } from '../components/Spinner.jsx';

const DIFFICULTY_OPTIONS = [
  { value: 'easy',   label: 'Easy',   emoji: '🌱', desc: 'Basic recall',          color: 'border-teal-400 bg-teal-50 text-teal-800' },
  { value: 'medium', label: 'Medium', emoji: '⚡', desc: 'Understanding',          color: 'border-blue-400 bg-blue-50 text-blue-800' },
  { value: 'hard',   label: 'Hard',   emoji: '🔥', desc: 'Analysis & evaluation',  color: 'border-red-400 bg-red-50 text-red-800' },
];

export default function UploadPage() {
  const [file,         setFile]         = useState(null);
  const [difficulty,   setDifficulty]   = useState('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [isDragging,   setIsDragging]   = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [loadingStep,  setLoadingStep]  = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { push } = useNotification();
  const { setQuiz } = useQuiz();

  function validateAndSetFile(f) {
    const type = getFileType(f);
    if (!type) { push('Only PDF, DOCX, and TXT files are supported.', 'error'); return; }
    if (f.size > 20 * 1024 * 1024) { push('File too large (max 20 MB).', 'error'); return; }
    setFile(f);
    push(`"${f.name}" loaded.`, 'success');
  }

  function handleFileChange(e) { const f = e.target.files?.[0]; if (f) validateAndSetFile(f); e.target.value = ''; }
  const onDrop     = useCallback(e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) validateAndSetFile(f); }, []);
  const onDragOver = useCallback(e => { e.preventDefault(); setIsDragging(true);  }, []);
  const onDragLeave= useCallback(e => { e.preventDefault(); setIsDragging(false); }, []);

  async function handleGenerate() {
    if (!file) { push('Please upload a document first.', 'warning'); return; }
    setLoading(true);
    try {
      setLoadingStep('Connecting to AI service…');
      await checkHealth().catch(() => { throw new Error('Cannot reach the quiz server.'); });
      setLoadingStep('Extracting text from your document…');
      const text = await extractText(file);
      if (text.length < 50) throw new Error('Document is too short.');
      setLoadingStep('Generating questions with AI…');
      const mcqs = await generateMCQs({ text, num_questions: numQuestions, difficulty });
      const titleBase = file.name.replace(/\.[^/.]+$/, '');
      setQuiz(mcqs, { title: `${titleBase} — Quiz`, difficulty, sourceFile: file.name, numRequested: numQuestions });
      push(`${mcqs.length} questions generated!`, 'success');
      navigate('/results');
    } catch (err) {
      push(err?.response ? formatApiError(err) : (err.message || 'Unexpected error.'), 'error', 7000);
    } finally { setLoading(false); setLoadingStep(''); }
  }

  return (
    <>
      {loading && <FullPageSpinner message={loadingStep || 'Generating quiz…'} />}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans'" }}>Generate your quiz</h1>
          <p className="text-slate-500 text-lg">Upload any educational document and get MCQs in seconds.</p>
        </div>
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <label className="t-label">Source Document <span className="text-slate-400 font-normal">PDF, DOCX, or TXT · max 20 MB</span></label>
            <div onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
              onClick={() => !file && inputRef.current?.click()}
              className={`min-h-52 rounded-2xl border-2 border-dashed flex items-center justify-center transition-all duration-200
                ${file ? 'border-teal-300 bg-teal-50/40' : isDragging ? 'border-blue-400 bg-blue-50/60 scale-[1.01]' : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/20 cursor-pointer'}`}>
              {file ? (
                <div className="w-full px-6 py-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl shrink-0">📄</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{file.name}</p>
                    <p className="text-sm text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); setFile(null); }}
                    className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">✕</button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 px-8 py-8 text-center pointer-events-none">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl">📎</div>
                  <div>
                    <p className="font-semibold text-slate-700 text-sm">{isDragging ? 'Drop it here!' : 'Drag & drop your document'}</p>
                    <p className="text-xs text-slate-400 mt-0.5">or click to browse · PDF, DOCX, TXT</p>
                  </div>
                </div>
              )}
            </div>
            <input ref={inputRef} type="file" accept=".pdf,.docx,.txt" onChange={handleFileChange} />
          </div>
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div>
              <label className="t-label">Difficulty</label>
              <div className="flex flex-col gap-2">
                {DIFFICULTY_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setDifficulty(opt.value)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${difficulty === opt.value ? opt.color + ' shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'}`}>
                    <span className="text-lg">{opt.emoji}</span>
                    <div><p className="font-semibold text-sm">{opt.label}</p><p className="text-xs opacity-60">{opt.desc}</p></div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="t-label">Questions: <span className="text-blue-600 font-bold">{numQuestions}</span></label>
              <input type="range" min={1} max={20} value={numQuestions}
                onChange={e => setNumQuestions(Number(e.target.value))}
                className="w-full accent-blue-600 mt-1" />
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
      </div>
    </>
  );
}
