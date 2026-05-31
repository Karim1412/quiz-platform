import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { leaderboardService } from '../../services/authService.js';

const RANK_STYLE = [
  { bg: '#FFD93D', shadow: '#c9a800', emoji: '🥇', label: '1st' },
  { bg: '#E0E0E0', shadow: '#9E9E9E', emoji: '🥈', label: '2nd' },
  { bg: '#F4A460', shadow: '#8B5E2E', emoji: '🥉', label: '3rd' },
];

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isTeacher }   = useAuth();
  const navigate               = useNavigate();

  useEffect(() => {
    leaderboardService.global(20)
      .then(setLeaders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const myRank = leaders.findIndex(l => l._id === user?._id) + 1;

  const isStudent = !isTeacher;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: isStudent
        ? 'linear-gradient(160deg, #FFF9DB 0%, #E8F7FD 40%, #E6FFF6 100%)'
        : 'linear-gradient(135deg, #f0f7ff 0%, #f0fdfa 100%)',
        fontFamily: isStudent ? 'Nunito' : 'inherit' }}>
      <div className="text-6xl animate-bounce">🏆</div>
    </div>
  );

  return (
    <div className="min-h-screen"
      style={{
        fontFamily: isStudent ? 'Nunito, system-ui, sans-serif' : 'inherit',
        background: isStudent
          ? 'linear-gradient(160deg, #FFF9DB 0%, #E8F7FD 40%, #E6FFF6 100%)'
          : 'linear-gradient(135deg, #f0f7ff 0%, #f0fdfa 100%)',
      }}>

      {/* Header */}
      <div className={`sticky top-0 z-20 backdrop-blur-md border-b ${isStudent ? 'bg-white/80 border-play-yellow/40 border-b-4' : 'bg-white/90 border-slate-200'}`}>
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => navigate(isTeacher ? '/teacher/dashboard' : '/student/dashboard')}
            className={isStudent ? 'text-slate-500 text-xl font-black' : 't-btn-ghost text-sm'}>
            ←
          </button>
          <h1 className={`font-black ${isStudent ? 'text-2xl text-slate-800' : 'text-xl text-slate-800'}`}
            style={isStudent ? {} : { fontFamily: "'Plus Jakarta Sans'" }}>
            🏆 Leaderboard
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* My rank (student) */}
        {isStudent && myRank > 0 && (
          <div className="s-card p-4 mb-6 flex items-center gap-4"
            style={{ background: 'linear-gradient(135deg, #FFD93D20, #4CC9F020)', borderColor: '#FFD93D', borderWidth: 3 }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black text-white"
              style={{ background: '#9B5DE5', boxShadow: '0 4px 0 #6b3daa' }}>
              #{myRank}
            </div>
            <div>
              <p className="font-black text-slate-800">You are ranked #{myRank}!</p>
              <p className="text-xs font-bold text-slate-400">Keep quizzing to climb the board! 🚀</p>
            </div>
            <span className="ml-auto text-2xl">
              {myRank === 1 ? '🥇' : myRank === 2 ? '🥈' : myRank === 3 ? '🥉' : '⚡'}
            </span>
          </div>
        )}

        {/* Top 3 podium */}
        {leaders.length >= 3 && (
          <div className="flex items-end justify-center gap-3 mb-6 px-4">
            {/* 2nd */}
            <PodiumCard leader={leaders[1]} rank={2} isStudent={isStudent} height="h-28" />
            {/* 1st */}
            <PodiumCard leader={leaders[0]} rank={1} isStudent={isStudent} height="h-36" featured />
            {/* 3rd */}
            <PodiumCard leader={leaders[2]} rank={3} isStudent={isStudent} height="h-20" />
          </div>
        )}

        {/* Full list */}
        <div className={`${isStudent ? 's-card' : 't-card'} overflow-hidden`}>
          {leaders.map((l, i) => {
            const isMe = l._id === user?._id;
            return (
              <div key={l._id}
                className={`flex items-center gap-3 px-5 py-4 border-b last:border-0 border-slate-50
                  ${isMe ? (isStudent ? 'bg-play-yellow/10' : 'bg-teacher-50/50') : ''}`}>
                {/* Rank */}
                <div className="w-8 font-black text-center">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (
                    <span className={`text-sm ${i < 9 ? 'text-slate-600' : 'text-slate-400'}`}>#{i+1}</span>
                  )}
                </div>
                {/* Avatar */}
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0"
                  style={{ background: isStudent ? '#F0F7FF' : '#F0F7FF' }}>
                  {l.avatar || '🧒'}
                </div>
                {/* Name + grade */}
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-slate-800 truncate ${isStudent ? 'font-black' : ''} ${isMe ? 'text-teacher-700' : ''}`}>
                    {l.name} {isMe && <span className="text-xs">(you)</span>}
                  </p>
                  <p className="text-xs text-slate-400 font-semibold">{l.grade || 'Student'} · {l.quizzesTaken} quizzes</p>
                </div>
                {/* Score */}
                <div className="text-right shrink-0">
                  <p className={`font-black text-lg ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-slate-500' : i === 2 ? 'text-amber-700' : 'text-slate-700'}`}>
                    {l.totalScore}
                  </p>
                  <p className="text-xs text-slate-400">XP</p>
                </div>
                {/* Badges */}
                <div className="flex gap-0.5 ml-1">
                  {l.badges?.slice(0,3).map(b => (
                    <span key={b} className="text-sm">{b === 'first-quiz' ? '🏅' : b === 'perfect-score' ? '⭐' : '🏆'}</span>
                  ))}
                </div>
              </div>
            );
          })}
          {leaders.length === 0 && (
            <div className="p-12 text-center text-slate-400">
              <div className="text-4xl mb-2">🏜️</div>
              <p className="font-bold">No players yet. Be the first!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PodiumCard({ leader, rank, isStudent, height, featured }) {
  const s = RANK_STYLE[rank - 1];
  return (
    <div className={`flex-1 flex flex-col items-center ${featured ? 'scale-105' : ''}`}>
      <span className="text-3xl mb-1">{leader.avatar || '🧒'}</span>
      <p className={`font-black text-slate-800 text-xs text-center truncate w-full px-1 ${featured ? 'text-sm' : ''}`}>
        {leader.name?.split(' ')[0]}
      </p>
      <p className={`font-black text-xs mb-2 ${featured ? 'text-base' : ''}`}
        style={{ color: rank === 1 ? '#c9a800' : rank === 2 ? '#757575' : '#8B5E2E' }}>
        {leader.totalScore} XP
      </p>
      <div className={`w-full ${height} rounded-t-2xl flex items-center justify-center text-2xl`}
        style={{ background: s.bg, boxShadow: `inset 0 -4px 0 ${s.shadow}` }}>
        {s.emoji}
      </div>
    </div>
  );
}
