import { createContext, useCallback, useContext, useState } from 'react';

const ModeContext = createContext(null);

export function ModeProvider({ children }) {
  const [mode, setMode] = useState('teacher'); // 'teacher' | 'student'

  const toggleMode = useCallback(() => {
    setMode(m => (m === 'teacher' ? 'student' : 'teacher'));
  }, []);

  const isTeacher = mode === 'teacher';
  const isStudent = mode === 'student';

  return (
    <ModeContext.Provider value={{ mode, isTeacher, isStudent, toggleMode, setMode }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error('useMode must be used inside ModeProvider');
  return ctx;
}
