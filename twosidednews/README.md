# TwoSidedNews AI 🗞️⚖️

An AI-powered web app + Chrome extension that analyzes any news topic from **both sides** using Grok LLM and NewsAPI.

## Features

- 🧠 **AI Query Generation** — Grok generates optimized FOR/AGAINST search queries
- 📡 **Live Article Fetching** — NewsAPI fetches 20+ articles per topic
- ⚖️ **Stance Verification** — LLM classifies each article as FOR/AGAINST/NEUTRAL
- 📰 **Side-by-Side View** — Blue (FOR) vs Red (AGAINST) layout
- 🔍 **Neutral Analysis** — AI fact-checker compares both sides
- 🗳️ **Voting System** — Users vote on which side they agree with
- 🔄 **Article Comparison** — Compare any two articles with AI
- 📈 **Trending News** — Live headlines from NewsAPI
- 🔌 **Chrome Extension** — Analyze any page directly from your browser

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB (Mongoose) |
| LLM | Grok API (xAI) |
| News | NewsAPI |

---

## Project Structure

```
twosidednews/
├── backend/
│   ├── server.js              # Express app entry point
│   ├── models/
│   │   └── Analysis.js        # Mongoose schema
│   ├── routes/
│   │   ├── analyze.js         # POST /api/analyze (core pipeline)
│   │   ├── compare.js         # POST /api/compare
│   │   ├── votes.js           # POST/GET /api/votes
│   │   └── trending.js        # GET /api/trending
│   └── services/
│       ├── grokService.js     # All LLM calls (Grok API)
│       ├── newsService.js     # NewsAPI + article processing
│       └── urlExtractor.js    # Extract topic from URL
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.jsx   # Search + trending
│   │   │   ├── ResultsPage.jsx # FOR vs AGAINST results
│   │   │   └── ComparePage.jsx # Article comparison
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── ArticleCard.jsx
│   │   │   ├── AnalysisPanel.jsx
│   │   │   ├── VoteBar.jsx
│   │   │   ├── LoadingState.jsx
│   │   │   └── TrendingSection.jsx
│   │   └── utils/
│   │       └── api.js         # Axios API client
│   └── index.html
└── extension/
    ├── manifest.json          # MV3 manifest
    ├── popup.html             # Extension popup UI
    ├── popup.js               # Popup logic
    ├── content.js             # Page content extractor
    └── background.js          # Service worker
```

---

## Setup & Installation

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- [Grok API key](https://console.x.ai/) (xAI)
- [NewsAPI key](https://newsapi.org/) (free tier: 100 req/day)

---

### 1. Backend Setup

```bash
cd backend
npm install

# Copy and fill in environment variables
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/twosidednews
GROK_API_KEY=xai-your-key-here
GROK_API_URL=https://api.x.ai/v1
NEWS_API_KEY=your-newsapi-key-here
FRONTEND_URL=http://localhost:5173
```

```bash
# Start backend
npm run dev
# or: npm start
```

Backend runs at: `http://localhost:5000`

---

### 2. Frontend Setup

```bash
cd frontend
npm install

# Optional: set API URL (vite proxy handles this automatically)
cp .env.example .env
```

```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

### 3. Chrome Extension Setup

1. Open Chrome → `chrome://extensions/`
2. Enable **Developer Mode** (top right)
3. Click **Load unpacked**
4. Select the `extension/` folder

> **Note:** The extension calls `http://localhost:5000` so your backend must be running.

**Icon setup (optional):**
```bash
cd extension
node generate-icons.js
# Then convert the SVGs to PNGs
```

---

## API Reference

### POST `/api/analyze`
Runs the full pipeline: topic → queries → articles → stance → analysis.

**Request:**
```json
{ "input": "US-China trade war" }
```

**Response:**
```json
{
  "topic": "US-China trade war",
  "for_articles": [...],
  "against_articles": [...],
  "center_analysis": "...",
  "queries": { "for_query": "...", "against_query": "..." },
  "total_analyzed": 14
}
```

### POST `/api/compare`
Compare two articles using AI.

**Request:**
```json
{
  "article1": { "title": "...", "source": "...", "summary": "..." },
  "article2": { "title": "...", "source": "...", "summary": "..." }
}
```

### POST `/api/votes`
Submit a vote.

**Request:**
```json
{ "side": "for", "topic": "US-China trade war", "analysisId": "..." }
```

### GET `/api/votes/:id`
Get vote counts for an analysis.

### GET `/api/trending`
Get trending headlines. Query param: `?category=technology`

---

## AI Pipeline (How It Works)

```
User Input (topic or URL)
       ↓
  [URL? Extract topic]
       ↓
  Grok: Generate FOR query + AGAINST query
       ↓
  NewsAPI: Fetch 12 articles per query (parallel)
       ↓
  Deduplicate by URL + title similarity
       ↓
  Score articles (keyword match + recency)
       ↓
  Top 16 articles → Grok batch stance classification
       ↓
  Filter: FOR articles | AGAINST articles
       ↓
  Top 3 per side
       ↓
  Grok: Generate neutral analysis
       ↓
  Return results to frontend
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROK_API_KEY` | ✅ | xAI Grok API key |
| `NEWS_API_KEY` | ✅ | NewsAPI.org API key |
| `MONGODB_URI` | ⚠️ Optional | MongoDB connection string (app works without it) |
| `PORT` | No | Backend port (default: 5000) |
| `GROK_API_URL` | No | Grok API base URL (default: https://api.x.ai/v1) |
| `FRONTEND_URL` | No | Frontend URL for CORS (default: http://localhost:5173) |

---

## Common Issues

**"GROK_API_KEY not set"** → Add your xAI API key to `backend/.env`

**"NEWS_API_KEY not set"** → Add your NewsAPI key to `backend/.env`

**MongoDB errors** → The app works without MongoDB; votes use in-memory storage as fallback

**No articles found** → Try a more specific topic; NewsAPI free tier limits to 100 req/day

**Extension can't connect** → Make sure backend is running on port 5000

---

## License

MIT — Built for hackathons, learning, and balanced news consumption.
