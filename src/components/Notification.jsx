import { useNotification } from '../context/NotificationContext.jsx';

const ICONS = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
const STYLES = {
  success: 'bg-teal-50 border-teal-300 text-teal-800',
  error:   'bg-red-50 border-red-300 text-red-800',
  info:    'bg-teacher-50 border-teacher-300 text-teacher-800',
  warning: 'bg-amber-50 border-amber-300 text-amber-800',
};

export default function NotificationStack() {
  const { toasts, remove } = useNotification();
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map(({ id, message, type }) => (
        <div key={id}
          className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-card-lg
                      pointer-events-auto animate-slide-up ${STYLES[type] ?? STYLES.info}`}>
          <span className="text-base shrink-0">{ICONS[type] ?? ICONS.info}</span>
          <p className="flex-1 text-sm font-semibold leading-snug">{message}</p>
          <button onClick={() => remove(id)}
            className="opacity-50 hover:opacity-100 transition-opacity text-current shrink-0">
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
