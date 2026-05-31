import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotification } from '../../context/NotificationContext.jsx';

const AVATARS = ['🦊','🐻','🦋','🦁','🐬','🐼','🦄','🐯','🦅','🐸'];
const GRADES  = ['Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8'];

export default function RegisterPage() {
  const [step,     setStep]     = useState(1);
  const [role,     setRole]     = useState('');
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [grade,    setGrade]    = useState('');
  const [avatar,   setAvatar]   = useState('🦊');
  const [loading,  setLoading]  = useState(false);

  const { register } = useAuth();
  const { push }     = useNotification();
  const navigate     = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name || !email || !password) { push('Please fill in all fields.', 'warning'); return; }
    if (password.length < 6) { push('Password must be at least 6 characters.', 'warning'); return; }
    setLoading(true);
    try {
      const user = await register(name, email, password, role, grade);
      push(`Account created! Welcome, ${user.name}! 🎉`, 'success');
      navigate(role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard', { replace: true });
    } catch (err) {
      push(err.message || 'Registration failed.', 'error');
    } finally {
      setLoading(false);
    }
  }

  const isStudent = role === 'student';

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: isStudent
        ? 'linear-gradient(160deg,#FFF9DB 0%,#E8F7FD 50%,#E6FFF6 100%)'
        : 'linear-gradient(135deg,#f0f7ff 0%,#f0fdfa 100%)' }}>

      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">{step === 1 ? '👋' : isStudent ? '🧒' : '👩‍🏫'}</div>
          <h1 className="text-2xl font-bold text-slate-900"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {step === 1 ? 'Join QuizCraft' : isStudent ? 'Student Account' : 'Teacher Account'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {step === 1 ? 'Who are you?' : 'Fill in your details'}
          </p>
        </div>

        {/* Step 1 — Role selection */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { role: 'teacher', emoji: '👩‍🏫', title: 'Teacher', desc: 'Create & manage quizzes', grad: 'from-teacher-500 to-teal-500' },
                { role: 'student', emoji: '🧒',  title: 'Student',  desc: 'Take quizzes & earn XP!',  grad: 'from-orange-400 to-yellow-400' },
              ].map(opt => (
                <button key={opt.role} onClick={() => { setRole(opt.role); setStep(2); }}
                  className="t-card p-6 text-center hover:shadow-card-lg transition-all duration-200 hover:-translate-y-1 group">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${opt.grad}
                                  flex items-center justify-center text-3xl mx-auto mb-3
                                  shadow-card group-hover:scale-110 transition-transform`}>
                    {opt.emoji}
                  </div>
                  <p className="font-bold text-slate-800">{opt.title}</p>
                  <p className="text-xs text-slate-400 mt-1">{opt.desc}</p>
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-teacher-600 font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        )}

        {/* Step 2 — Details */}
        {step === 2 && (
          <div className="t-card p-8">
            <button onClick={() => setStep(1)} className="t-btn-ghost text-xs mb-4 -ml-1">← Back</button>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Avatar (students only) */}
              {isStudent && (
                <div>
                  <label className="t-label">Pick your avatar</label>
                  <div className="flex flex-wrap gap-2">
                    {AVATARS.map(a => (
                      <button key={a} type="button" onClick={() => setAvatar(a)}
                        className={`text-2xl w-10 h-10 rounded-xl transition-all
                          ${avatar === a ? 'bg-amber-200 scale-110 shadow-md' : 'hover:bg-slate-100'}`}>
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="t-label">Full name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className="t-input" placeholder={isStudent ? 'Your name' : 'Ms. Smith'} required />
              </div>

              {isStudent && (
                <div>
                  <label className="t-label">Grade</label>
                  <select value={grade} onChange={e => setGrade(e.target.value)} className="t-input">
                    <option value="">Select grade…</option>
                    {GRADES.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="t-label">Email address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="t-input" placeholder="you@example.com" required />
              </div>

              <div>
                <label className="t-label">Password <span className="text-slate-400 font-normal">(min. 6 characters)</span></label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="t-input" placeholder="••••••••" required />
              </div>

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl
                           text-white font-bold text-base transition-all shadow-card-lg
                           disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: isStudent
                  ? 'linear-gradient(135deg,#FF6B35,#FFD93D)'
                  : 'linear-gradient(135deg,#0271bf,#0d9488)' }}>
                {loading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : isStudent ? '🚀' : '🎓'}
                {loading ? 'Creating…' : 'Create Account'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
