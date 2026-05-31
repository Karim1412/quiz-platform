import axios from 'axios';

/**
 * This now points to the Express backend (/api/generate),
 * which internally calls Groq AI.
 * No separate Python service needed anymore.
 */
const BACKEND = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:5000';

const client = axios.create({
  baseURL: `${BACKEND}/api`,
  timeout: 120_000, // 2 min — AI can be slow on long documents
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Ping the AI health endpoint.
 */
export async function checkHealth() {
  const { data } = await client.get('/generate/health');
  return data;
}

/**
 * Generate MCQs from extracted document text.
 * @param {{ text: string, num_questions: number, difficulty: string }} params
 * @returns {Promise<Array>}
 */
export async function generateMCQs({ text, num_questions, difficulty }) {
  const { data } = await client.post('/generate', { text, num_questions, difficulty });
  return data.mcqs;
}

/**
 * Human-readable error from an Axios error.
 */
export function formatApiError(error) {
  if (!axios.isAxiosError(error)) return String(error);

  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. Try fewer questions or a shorter document.';
  }
  if (!error.response) {
    return `Cannot reach the backend at ${BACKEND}. Make sure the Express server is running (npm run dev in /backend).`;
  }

  const status  = error.response.status;
  const message = error.response.data?.message ?? error.response.data?.detail ?? 'Unknown error';

  if (status === 401) return `Groq API key is invalid. Check GROQ_API_KEY in backend/.env`;
  if (status === 429) return 'Groq rate limit hit. Wait a moment and try again.';
  if (status === 503) return message; // "GROQ_API_KEY not configured" etc.
  if (status === 400) return `Bad request: ${message}`;
  return `Server error (${status}): ${message}`;
}
