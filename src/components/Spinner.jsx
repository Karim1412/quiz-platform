export default function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-4' };
  return (
    <div
      className={`rounded-full border-transparent border-t-current animate-spin ${sizes[size] ?? sizes.md} ${className}`}
      role="status" aria-label="Loading"
    />
  );
}

export function FullPageSpinner({ message = 'Generating your quiz…' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-card-lg border border-slate-100 p-10
                      flex flex-col items-center gap-6 max-w-sm mx-4 text-center">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teacher-500 to-teal-500
                          flex items-center justify-center shadow-lg">
            <span className="text-2xl">✨</span>
          </div>
          <div className="absolute -inset-2 rounded-3xl border-4 border-teacher-200 border-t-teacher-500 animate-spin" />
        </div>
        <div>
          <p className="text-lg font-bold text-slate-800 mb-1">{message}</p>
          <p className="text-sm text-slate-500">The AI is crafting your questions…</p>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-teacher-500 to-teal-500 rounded-full animate-pulse-soft w-2/3" />
        </div>
      </div>
    </div>
  );
}
