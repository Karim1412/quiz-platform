import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNotification } from "../../context/NotificationContext.jsx";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { push } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      push("Please fill in all fields.", "warning");
      return;
    }
    setLoading(true);
    try {
      const user = await login(email, password);
      push(`Welcome back, ${user.name}! 👋`, "success");
      const dest =
        location.state?.from?.pathname ||
        (user.role === "teacher" ? "/teacher/dashboard" : "/student/dashboard");
      navigate(dest, { replace: true });
    } catch (err) {
      push(err.message || "Login failed. Check your credentials.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "linear-gradient(135deg, #f0f7ff 0%, #f0fdfa 100%)",
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teacher-500 to-teal-500
                          flex items-center justify-center mx-auto mb-4 shadow-card-lg text-2xl"
          >
            🎓
          </div>
          <h1
            className="text-3xl font-bold text-slate-900"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Welcome to QuizCraft
          </h1>
          <p className="text-slate-500 mt-1">Sign in to continue</p>
        </div>

        {/* Card */}
        <div className="t-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="t-label">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="t-input"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label className="t-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="t-input"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl
                         bg-gradient-to-r from-teacher-600 to-teal-600 text-white font-bold text-base
                         hover:from-teacher-700 hover:to-teal-700 transition-all shadow-card-lg
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "🔐"
              )}
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-teacher-600 font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Notifications live at root level */}
      <NotificationsPortal />
    </div>
  );
}

function NotificationsPortal() {
  const { toasts, remove } = useNotification();
  const STYLES = {
    success: "bg-teal-50 border-teal-300 text-teal-800",
    error: "bg-red-50 border-red-300 text-red-800",
    warning: "bg-amber-50 border-amber-300 text-amber-800",
    info: "bg-blue-50 border-blue-300 text-blue-800",
  };
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map(({ id, message, type }) => (
        <div
          key={id}
          className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-card-lg
                      pointer-events-auto animate-slide-up ${STYLES[type] ?? STYLES.info}`}
        >
          <p className="flex-1 text-sm font-semibold">{message}</p>
          <button
            onClick={() => remove(id)}
            className="opacity-50 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
