# Kifayat AI — Smart Visual Shopping & Price Intelligence — Pakistan

**Live Demo:** [https://kifayat-ai-nine.vercel.app/](https://kifayat-ai-nine.vercel.app/)

Never overpay again. Upload a product photo, and Kifayat AI identifies the item, searches prices across 34+ Pakistani e-commerce stores, computes a Kifayat Score, and tells you if it's a steal or a scam — all in PKR.

---

## Architecture — The Three Agents

Analysis follows a layered pipeline named after Urdu terms. Each layer can independently report failure, and the system degrades gracefully by falling through to the next available layer.

### 1. بینا (Bina) — Vision AI

- **Model:** `qwen/qwen3.6-27b` via Groq API
- Accepts a base64 product image and optional user-provided details (brand, store, etc.)
- Returns structured JSON: `category`, `brand`, `exactModel`, `features`, `estimatedFairPrice` in PKR, `confidence`, and `isLuxury`
- Rotates across up to 10 API keys (`GROQ_API_KEY_1` through `GROQ_API_KEY_10`) on rate-limit or quota errors
- Prompt is locked to the Pakistani market — PKR pricing, local categories (Kurti, Shalwar Kameez, Cricket Bat, etc.), import duties, and market context
- **If Bina fails** (all keys exhausted or invalid response), the pipeline falls through to Talashkaar alone

### 2. تلاش کار (Talashkaar) — Web Search

- **Engine:** SerpAPI — Google Lens (visual matching) + Google Shopping (text fallback)
- Lens engine sends the product image for visual similarity matching across the web
- Results are filtered through `merchants.ts` — a curated list of 34+ Pakistani e-commerce stores (Daraz, PriceOye, Shophive, Sapphire, Gul Ahmed, Junaid Jamshed, Dawlance, Haier, etc.)
- If Lens fails, falls back to a Google Shopping search with `gl=pk` (Pakistan geo) and `site:.pk` filtering
- Each matched result is scored for similarity against the Bina-detected brand, model, and category
- **If Talashkaar fails**, the pipeline falls through to mock/estimated data

### 3. منصف (Munsif) — Scoring & Validation

The central scoring engine produces the final result:

| Step | What it does |
|---|---|
| **Price Validation** | Checks asking price against category-specific PKR ranges (e.g., Mobile Phone: 3,000–500,000 PKR) — rejects unrealistic entries |
| **Outlier Rejection** | Web prices are IQR-filtered (Q1–Q3) before averaging to prevent skewed results |
| **Kifayat Score** | Ratio-based 0–100 score: ≤70% of web avg → 80–100 (must buy), 70–100% → 50–79 (fair), >100% → 0–49 (overpriced) |
| **Product Similarity** | Each web result is scored 0–100 against the detected brand (+35), exact model (+35), category (+20), and features (+10). Only results ≥80% are considered high-similarity |
| **Confidence** | Composite score based on: Bina success, Talashkaar success, comparison count, high-similarity count, and price validity — produces `high`/`medium`/`low` |
| **DataSource** | Tracks provenance: `ai_vision_plus_web`, `ai_vision`, `web`, or `estimated` — always surfaced to the user |

---

## Anti-Hallucination Safeguards

The system is designed to minimize hallucinated or inaccurate outputs:

- **Bina prompt is strict:** Forces JSON-only output. No markdown, no thinking tags, no extra commentary. Broken JSON is caught and retried.
- **Brand confidence gate:** Brand is only set if the visual model is certain. Otherwise it defaults to `"Unknown"`.
- **Similarity threshold:** Only web results with ≥80% similarity score are used for high-confidence pricing. If fewer than 2 high-similarity results exist, the pool is widened but the confidence drops.
- **Price validation:** Asks outside the category's reasonable PKR range are flagged. The validation layer has explicit ranges for 50+ Pakistani product types.
- **DataSource transparency:** Every result carries a `dataSource` field showing exactly where the data came from. Users always see whether prices are from live web search, AI estimation, or fallback data.
- **Graceful degradation:** If Bina fails, Talashkaar still runs alone. If both fail, estimated mock data (realistic but marked as `confidence: "low"`, `dataSource: "estimated"`) is returned rather than crashing.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16.2.12 (App Router, Turbopack) |
| **UI** | React 19, Tailwind CSS v4, Framer Motion |
| **State** | Zustand with localStorage persistence |
| **Icons** | Lucide React |
| **Background** | Three.js (shader-based line animation) |
| **Fonts** | Anton (headings), Outfit (body), JetBrains Mono (mono) |
| **APIs** | Groq (vision), SerpAPI (Lens + Shopping) |
| **Languages** | TypeScript, CSS |

---

## Project Structure

```
src/
├── app/
│   ├── api/analyze/route.ts   # POST /api/analyze endpoint
│   ├── globals.css             # Tailwind v4 + custom theme
│   ├── layout.tsx              # Root layout (fonts, metadata)
│   └── page.tsx                # Home page
├── components/
│   ├── Header.tsx              # Sticky header + theme toggle
│   ├── UploadSection.tsx       # Image upload + price input
│   ├── AnalyzingState.tsx      # Loading animation
│   ├── VerdictDashboard.tsx    # Results display
│   ├── KifayatScoreGauge.tsx   # Circular gauge
│   ├── ComparisonGrid.tsx      # Store price cards
│   ├── HistoryDrawer.tsx       # Scan history sidebar
│   └── ui/
│       └── shader-lines.tsx    # Three.js background animation
├── lib/
│   ├── analyze.ts              # Main analysis orchestration
│   ├── apis/groq.ts            # Groq API (Bina)
│   ├── apis/serpapi.ts         # SerpAPI (Talashkaar)
│   ├── scoring.ts              # Score, verdict, savings, similarity
│   ├── validator.ts            # Price ranges, confidence assessment
│   ├── merchants.ts            # 34+ Pakistani merchant definitions
│   ├── mock-data.ts            # Realistic fallback scan data
│   ├── currency.ts             # PKR formatting + price parsing
│   └── cn.ts                   # Tailwind class merging utility
├── store/
│   └── useStore.ts             # Zustand global state
└── types/
    └── index.ts                # TypeScript type definitions
```

---

## Environment Variables

Create a `.env.local` file in the project root:

```bash
# At least one Groq API key is required. You can add up to 10 for auto-rotation.
GROQ_API_KEY=your_groq_key_here
GROQ_API_KEY_1=...
GROQ_API_KEY_2=...
# ... up to GROQ_API_KEY_10

# SerpAPI key for Google Lens + Shopping search
SERPAPI_API_KEY=your_serpapi_key_here
```

Get keys at:
- [https://console.groq.com](https://console.groq.com)
- [https://serpapi.com](https://serpapi.com)

---

## Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Vercel Deployment

Push to GitHub — Vercel auto-deploys from the repo root. No `vercel.json` needed. Set the same environment variables above in your Vercel project dashboard (Settings → Environment Variables).

---

## Built With

- **Groq** — Ultra-fast inference for vision-based product classification
- **SerpAPI** — Google Lens visual search + Shopping price aggregation
- **Unsplash** — Fallback product images when web results lack thumbnails
