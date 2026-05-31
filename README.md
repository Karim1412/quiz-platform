# QuizCraft — AI Quiz Platform for Teachers

A full-stack web application that lets teachers upload any educational document (PDF, DOCX, or TXT) and instantly generate polished multiple-choice quizzes using the `quiz_service` FastAPI backend.

---

## 🗂 Project Structure

```
quiz-platform/                   ← This frontend project
├── public/
│   └── favicon.svg
├── src/
│   ├── api/
│   │   └── quizApi.js           ← Axios client for the FastAPI backend
│   ├── components/
│   │   ├── Layout.jsx           ← Navbar + page shell
│   │   ├── MCQCard.jsx          ← Editable question card
│   │   ├── Notification.jsx     ← Toast stack
│   │   └── Spinner.jsx          ← Loading indicators
│   ├── context/
│   │   ├── NotificationContext.jsx
│   │   └── QuizContext.jsx      ← Shared quiz state (questions + meta)
│   ├── pages/
│   │   ├── UploadPage.jsx       ← File upload + settings
│   │   └── ResultPage.jsx       ← Review, edit, export
│   ├── utils/
│   │   ├── fileParser.js        ← PDF / DOCX / TXT text extraction
│   │   └── exportUtils.js       ← PDF + DOCX + JSON download
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env.example
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js

quiz_service/                    ← Existing FastAPI backend (unchanged)
├── app.py
├── config.py
├── services/
│   ├── llm_service.py
│   └── text_processor.py
├── utils/
│   └── json_parser.py
└── requirements.txt
```

---

## ⚡ Quick Start

### 1 — Start the FastAPI backend

```bash
cd quiz_service
pip install -r requirements.txt
cp .env.example .env          # then add your GROQ_API_KEY
python app.py                 # runs on http://localhost:8000
```

Verify it's working:
```bash
curl http://localhost:8000/health
# → {"status":"ok","service":"ai-quiz-generator"}
```

### 2 — Start the frontend

```bash
cd quiz-platform
cp .env.example .env          # VITE_API_URL=http://localhost:8000
npm install
npm run dev                   # → http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔧 Environment Variables

### `quiz-platform/.env`
```env
VITE_API_URL=http://localhost:8000
```

### `quiz_service/.env`
```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
LLM_TEMPERATURE=0.2
LLM_MAX_TOKENS=2048
LLM_MAX_RETRIES=3
LLM_RETRY_DELAY=2.0
MAX_CHUNK_TOKENS=3000
OVERLAP_TOKENS=200
CHARS_PER_TOKEN=4.0
APP_HOST=0.0.0.0
APP_PORT=8000
APP_DEBUG=false
LOG_LEVEL=INFO
MAX_QUESTIONS=20
MIN_QUESTIONS=1
```

Get a free Groq API key at [console.groq.com](https://console.groq.com).

---

## 🌐 Production Build

```bash
# Frontend
cd quiz-platform
npm run build          # outputs to dist/
npm run preview        # preview the production build locally

# Serve with nginx, Vercel, Netlify, etc.
# The backend URL is baked in at build time via VITE_API_URL.
```

For Docker or a server deployment, make sure:
- The FastAPI backend is reachable from the browser (CORS is already open on `*`)
- `VITE_API_URL` points to the public backend URL before running `npm run build`

---

## ✨ Features

| Feature | Details |
|---|---|
| **File upload** | Drag & drop or click — PDF, DOCX, TXT (up to 20 MB) |
| **Text extraction** | Client-side via `pdfjs-dist` (PDF) and `mammoth` (DOCX) |
| **Difficulty selector** | Easy / Medium / Hard with descriptive labels |
| **Question count** | Slider from 1–20 |
| **Loading state** | Full-screen overlay with step messages |
| **Edit questions** | Inline edit of question text, all options, correct answer |
| **Delete questions** | Per-card delete with confirmation |
| **Show answers** | Toggle correct-answer highlighting across all cards |
| **Answer distribution** | Bar chart in the stats panel |
| **Export PDF** | Formatted quiz + answer key, colour-coded options |
| **Export DOCX** | Styled Word document with table-based options |
| **Export JSON** | Raw data for LMS/gradebook integrations |
| **Error handling** | Human-readable toasts for network, validation, and parse errors |

---

## 🧩 Key Architecture Decisions

### Client-side text extraction
Parsing happens in the browser using dynamic imports — `pdfjs-dist` and `mammoth` are loaded on demand, keeping the initial bundle small. No file is uploaded to a server; only the extracted plain text reaches the FastAPI backend.

### No extra backend
The Node.js/Express layer is intentionally omitted. The React app talks directly to the existing `quiz_service`. Export (PDF/DOCX) is generated fully in the browser using `jsPDF` and the `docx` library.

### Context over Redux
Two lightweight React contexts (`NotificationContext`, `QuizContext`) replace a heavier state library. The quiz state is passed by reference so the Results page always reflects edits in real time.

### Chunked bundle
`vite.config.js` splits `pdfjs-dist` and the export libraries into separate chunks, so teachers on slower connections don't download parsing code they may never use.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| UI framework | React 18 |
| Styling | Tailwind CSS 3 |
| Routing | React Router 6 |
| HTTP client | Axios |
| PDF parsing | pdfjs-dist 4 |
| DOCX parsing | mammoth |
| PDF export | jsPDF 2 |
| DOCX export | docx 9 |
| Build tool | Vite 5 |
| Backend | FastAPI + Groq (LLaMA 3) |
