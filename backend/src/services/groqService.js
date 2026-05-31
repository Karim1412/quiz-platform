import Groq from 'groq-sdk';

let groqClient = null;

function getClient() {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey.startsWith('gsk_your')) {
      throw new Error('GROQ_API_KEY is not set. Get a free key at https://console.groq.com and add it to backend/.env');
    }
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

/**
 * Generate MCQs from plain text using LLaMA 3 via Groq.
 * @param {string} text - Extracted document text
 * @param {number} numQuestions - 1–20
 * @param {string} difficulty - 'easy' | 'medium' | 'hard'
 * @returns {Promise<Array>} array of MCQ objects
 */
export async function generateMCQs(text, numQuestions = 5, difficulty = 'medium') {
  const client = getClient();
  const model  = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  // Truncate text to avoid token limits (~12 000 chars ≈ 3 000 tokens)
  const truncated = text.length > 12000 ? text.slice(0, 12000) + '...' : text;

  const difficultyGuide = {
    easy:   'Focus on basic facts and definitions. Questions should be straightforward.',
    medium: 'Focus on understanding and application. Mix factual and conceptual questions.',
    hard:   'Focus on analysis, synthesis, and evaluation. Questions should require deep understanding.',
  }[difficulty] || 'Mix of different difficulty levels.';

  const prompt = `You are an expert quiz creator for educational purposes.

Generate exactly ${numQuestions} multiple-choice questions based on the following text.
Difficulty: ${difficulty.toUpperCase()} — ${difficultyGuide}

RULES:
- Each question must have exactly 4 options (A, B, C, D)
- Exactly one option must be correct
- Wrong options (distractors) must be plausible but clearly wrong
- Questions must be based ONLY on the provided text
- Do not repeat similar questions
- Return ONLY valid JSON — no markdown, no explanation, no extra text

REQUIRED JSON FORMAT:
{
  "mcqs": [
    {
      "question": "Question text here?",
      "A": "First option",
      "B": "Second option",
      "C": "Third option",
      "D": "Fourth option",
      "answer": "A"
    }
  ]
}

TEXT TO USE:
${truncated}`;

  const response = await client.chat.completions.create({
    model,
    messages:    [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens:  4096,
  });

  const raw = response.choices[0]?.message?.content ?? '';

  // Parse JSON — strip markdown code fences if present
  const cleaned = raw
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '')
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // Try to extract JSON object from the response
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('AI returned invalid JSON. Please try again.');
    parsed = JSON.parse(match[0]);
  }

  const mcqs = parsed?.mcqs;
  if (!Array.isArray(mcqs) || mcqs.length === 0) {
    throw new Error('AI returned no questions. Try with a longer or more detailed document.');
  }

  // Validate and clean each MCQ
  return mcqs.map((q, i) => {
    if (!q.question || !q.A || !q.B || !q.C || !q.D || !q.answer) {
      throw new Error(`Question ${i + 1} is missing required fields.`);
    }
    if (!['A', 'B', 'C', 'D'].includes(q.answer)) {
      throw new Error(`Question ${i + 1} has invalid answer "${q.answer}". Must be A, B, C, or D.`);
    }
    return {
      _id:      `q_${Date.now()}_${i}`,
      question: q.question.trim(),
      A:        q.A.trim(),
      B:        q.B.trim(),
      C:        q.C.trim(),
      D:        q.D.trim(),
      answer:   q.answer,
    };
  });
}

/**
 * Check if Groq is reachable (quick ping with minimal tokens)
 */
export async function checkGroqHealth() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.startsWith('gsk_your')) {
    return { ok: false, error: 'GROQ_API_KEY not configured' };
  }
  try {
    const client = getClient();
    await client.chat.completions.create({
      model:       process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      messages:    [{ role: 'user', content: 'Hi' }],
      max_tokens:  5,
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
