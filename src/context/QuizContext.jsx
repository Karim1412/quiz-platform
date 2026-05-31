import { createContext, useCallback, useContext, useState } from 'react';

const QuizContext = createContext(null);

let qid = 1;

export function QuizProvider({ children }) {
  const [mcqs,     setMcqs]     = useState([]);
  const [quizMeta, setQuizMeta] = useState({});

  const setQuiz = useCallback((questions, meta = {}) => {
    setMcqs(questions.map(q => ({ ...q, _id: q._id || `q_${qid++}` })));
    setQuizMeta(meta);
  }, []);

  const clearQuiz = useCallback(() => {
    setMcqs([]);
    setQuizMeta({});
  }, []);

  const updateQuestion = useCallback((id, updates) => {
    setMcqs(prev => prev.map(q => q._id === id ? { ...q, ...updates } : q));
  }, []);

  const deleteQuestion = useCallback((id) => {
    setMcqs(prev => prev.filter(q => q._id !== id));
  }, []);

  return (
    <QuizContext.Provider value={{ mcqs, quizMeta, setQuiz, clearQuiz, updateQuestion, deleteQuestion }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error('useQuiz must be used inside QuizProvider');
  return ctx;
}
