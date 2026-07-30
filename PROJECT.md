# Kifayat AI — Complete Project Documentation

**Live:** [https://kifayat-ai-nine.vercel.app/](https://kifayat-ai-nine.vercel.app/)

---

## Table of Contents

1. [Overview](#1-overview)
2. [System Architecture](#2-system-architecture)
3. [Agent: بینا (Bina) — Vision AI](#3-agent-بینا-bina--vision-ai)
4. [Agent: تلاش کار (Talashkaar) — Web Search](#4-agent-تلاش-کار-talashkaar--web-search)
5. [Agent: منصف (Munsif) — Scoring & Validation](#5-agent-منصف-munsif--scoring--validation)
6. [Analysis Pipeline Flow](#6-analysis-pipeline-flow)
7. [Anti-Hallucination & Accuracy](#7-anti-hallucination--accuracy)
8. [UI Components](#8-ui-components)
9. [State Management](#9-state-management)
10. [API Reference](#10-api-reference)
11. [Data Models](#11-data-models)
12. [Merchant Database](#12-merchant-database)
13. [Tech Stack](#13-tech-stack)
14. [Environment Variables](#14-environment-variables)

---

## 1. Overview

Kifayat AI is a price intelligence platform for the Pakistani market. A user uploads a product photo and enters the price they found it for. The system:

1. Analyzes the image with vision AI to identify the brand, model, category and features
2. Searches 34+ Pakistani e-commerce stores for matching products
3. Computes a Kifayat Score (0–100) comparing the user's price against the web average
4. Returns a verdict: Must Buy, Fair Value, or Overpriced
5. Shows cheaper alternatives and savings insights

All prices are in Pakistani Rupees (PKR). The system uses named agents inspired by Urdu terminology for each stage of processing.

---

## 2. System Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Upload     │────▶│  بینا (Bina)     │────▶│  تلاش کار        │
│  Image +    │     │  Vision AI       │     │  (Talashkaar)    │
│  Price      │     │  (Groq API)      │     │  Web Search      │
└─────────────┘     └──────────────────┘     │  (SerpAPI)       │
                                             └────────┬─────────┘
                                                      ▼
                                             ┌──────────────────┐
                                             │  منصف (Munsif)   │
                                             │  Scoring Engine  │
                                             └────────┬─────────┘
                                                      ▼
                                             ┌──────────────────┐
                                             │   ScanResult     │
                                             │   → UI Display   │
                                             └──────────────────┘
```

Each stage can fail independently. The pipeline degrades gracefully:

- Bina fails → Talashkaar runs alone with user-provided `details` as search query
- Talashkaar fails → System returns Bina-only estimates (marked as `ai_vision` source)
- Both fail → Estimated mock data is returned (marked as `estimated` source with `low` confidence)

---

## 3. Agent: بینا (Bina) — Vision AI

**File:** `src/lib/apis/groq.ts`

### Purpose
Analyzes a product image using Groq's LLM vision capabilities to extract structured product information for the Pakistani market.

### Model
`qwen/qwen3.6-27b` — a multimodal model capable of understanding images and returning structured JSON.

### API Key Rotation
Supports up to 10 API keys for load balancing and quota management:
- `GROQ_API_KEY` — primary key (tried first)
- `GROQ_API_KEY_1` through `GROQ_API_KEY_10` — rotation pool

Keys are loaded in order and rotated on 429 (rate limit) or 402 (quota exceeded) errors. On non-quota errors, rotation stops immediately to avoid burning through all keys on a systemic failure.

### Prompt Design

The system prompt sets Bina as a "precise Pakistani product classifier" with strict output rules:

```
You are a precise Pakistani product classifier.
Output ONLY a JSON object. No analysis. No thinking. No markdown.
Extract exact model numbers when visible.
```

The user prompt includes:

- **Category:** Must be suitable for the Pakistani market (e.g., Mobile Phone, Kurti, Sneakers, Wrist Watch, Perfume, LED TV, Laptop, Cricket Bat, Leather Bag)
- **Brand:** Must match exactly as known in Pakistan, or return "Unknown"
- **Exact Model:** Model number, variant, color, size (critical field)
- **Features:** Visually observable attributes only (up to 4)
- **Estimated Fair Price:** Numeric value in PKR (1 USD ≈ 280 PKR)
- **Confidence:** high/medium/low (low if image is blurry/dark)
- **isLuxury:** true/false

### JSON Parsing

The raw LLM response goes through `extractJson()` — a robust parser that:
1. Strips `<think>` tags (thinking wrappers)
2. Strips markdown code fences
3. Falls back to brace-delimited JSON extraction
4. Handles truncated responses by finding the last complete `{}`

### Response Structure

```typescript
interface GroqAnalysis {
  success: boolean;
  category?: string;        // e.g., "Mobile Phone"
  brand?: string;           // e.g., "Samsung" or undefined
  exactModel?: string;      // e.g., "Galaxy S24 Ultra"
  features?: string[];      // e.g., ["Dual SIM", "AMOLED Display"]
  estimatedPrice?: number;  // in PKR
  modelConfidence?: 'high' | 'medium' | 'low';
  isLuxury?: boolean;
  rawAnalysis?: string;     // full LLM response (first 2000 chars)
}
```

---

## 4. Agent: تلاش کار (Talashkaar) — Web Search

**File:** `src/lib/apis/serpapi.ts`

### Purpose
Searches the web for actual prices of the identified product across Pakistani e-commerce stores.

### Two Search Strategies

#### Primary: Google Lens (`searchGoogleLensPakistan`)
- **Engine:** `google_lens` via SerpAPI
- Sends the base64 image for visual similarity matching
- Country set to `pk`
- Returns both `visual_matches` and `shopping_results`
- Deduplicates by product URL
- Filters results through the merchant database (only Pakistani stores pass)
- If Lens returns 0 filtered results → falls back to Shopping search
- Timeout: 15 seconds

#### Fallback: Google Shopping (`fallbackShoppingSearch`)
- **Engine:** `google_shopping` via SerpAPI
- Search query: `"{brand} {model} {category} Pakistan"`
- Geo-location: `gl=pk`
- Google domain: `google.com.pk`
- Returns up to 8 results
- Timeout: 10 seconds

### Merchant Filtering

Every search result is run through `identifyMerchantFromLink()` which:
1. Extracts the domain from the product URL
2. Checks the domain against 34 known Pakistani merchants
3. If no match, checks the source name
4. If the domain contains `.pk`, `pakistan`, or `pk`, it passes through as a generic Pakistani store
5. International stores without `.pk` are rejected

### Response Structure

```typescript
interface SerpapiPriceMatch {
  title: string;
  merchant: string;           // e.g., "Daraz"
  merchantDomain: string;     // e.g., "daraz.pk"
  price: number;              // parsed PKR value
  imageUrl: string;
  productUrl: string;
  supportsCOD: boolean;       // Cash on Delivery
}
```

### Price Parsing

Raw price strings from SerpAPI are handled by `parsePriceRaw()` in `currency.ts`:
- Strips all non-numeric characters except `.` and `,`
- Handles international format variations (e.g., `1,234.56` vs `1.234,56`)
- Always produces a clean numeric value

---

## 5. Agent: منصف (Munsif) — Scoring & Validation

**File:** `src/lib/scoring.ts`, `src/lib/validator.ts`

### Purpose
Takes the outputs of Bina and Talashkaar, validates them, computes scores, and produces the final `ScanResult`.

### 5a. Price Validation (`validator.ts`)

**Category Price Ranges:** 50+ product categories with min/max PKR bounds:

| Category | Min (PKR) | Max (PKR) |
|---|---|---|
| Mobile Phone | 3,000 | 500,000 |
| Kurti | 500 | 50,000 |
| Sneakers | 1,000 | 50,000 |
| Perfume | 500 | 30,000 |
| Wrist Watch | 500 | 5,000,000 |
| LED TV | 15,000 | 1,000,000 |
| Laptop | 20,000 | 800,000 |
| Cricket Bat | 1,000 | 30,000 |
| ... | ... | ... |

Validation logic:
- Price ≤ 0 → invalid
- Unknown category → pass if 50 ≤ price ≤ 5,000,000
- Known category → pass if price > 30% of min AND price < 3× max
- Explicit flag strings returned for UI (e.g., "Price seems unreasonably high for a Mobile Phone in Pakistan")

### 5b. Outlier Rejection (`scoring.ts`)

Web prices are IQR-filtered before averaging:
1. Sort prices ascending
2. Q1 = 25th percentile index
3. Q3 = 75th percentile index
4. Average only prices between Q1 and Q3 inclusive
5. If ≤2 prices, no filtering

### 5c. Kifayat Score Computation

The score is derived from the ratio of the user's asking price to the average web price:

| Price Ratio | Score Range | Verdict |
|---|---|---|
| ≤ 70% of web avg | 80–100 | must_buy |
| 70–100% of web avg | 50–79 | fair_value |
| 100–130% of web avg | 30–49 | overpriced |
| > 130% of web avg | 0–29 | overpriced (severe) |

If no web prices are available, defaults to 50 (fair).

### 5d. Product Similarity Scoring

Each web result is scored 0–100 for relevance:

| Criterion | Max Score | Logic |
|---|---|---|
| Brand match | 35 | Title contains brand name |
| Model match | 35 | Title contains model number words (ratio) |
| Category match | 20 | Title contains category keywords (ratio) |
| Feature match | 10 | Title contains feature keywords |

A score ≥ 80 is considered "sufficiently similar" — results at this threshold are used for high-confidence pricing.

### 5e. Savings Calculation

```typescript
savingsAmount = max(0, averageWebPrice - askingPrice)
savingsPercentage = savingsAmount / averageWebPrice * 100
```

If the user's price is higher than the web average, the savings values reflect the overpriced amount (shown in red in the UI).

### 5f. Confidence Assessment

| Condition | Confidence | DataSource |
|---|---|---|
| Bina + Talashkaar success, ≥3 comparisons, ≥2 high-similarity, price valid | high | ai_vision_plus_web |
| Bina + Talashkaar success (weaker criteria) | medium | ai_vision_plus_web |
| Bina success only, price valid | medium | ai_vision |
| Talashkaar success only, ≥2 comparisons | medium | web |
| None of the above | low | estimated |

---

## 6. Analysis Pipeline Flow

**File:** `src/lib/analyze.ts`

The `analyzeProduct()` function orchestrates the full pipeline:

```
analyzeProduct(imageData, askingPrice, details)
│
├── 1. Run Bina (vision analysis)
│   ├── Success → extract category, brand, model, features, estimated price
│   └── Failure → mark groqSuccess = false
│
├── 2. IF Bina succeeded:
│   ├── Build search terms from brand + model + category
│   ├── Run Talashkaar (web search)
│   │   ├── Success → score each result for similarity
│   │   ├── ≥2 high-similarity results → use high-similarity set
│   │   └── <2 high-similarity → use all results (confidence drops)
│   └── buildResult() with Bina + Talashkaar data
│
├── 3. ELSE (Bina failed):
│   ├── Run Talashkaar with details as search query
│   ├── Success → buildResult() with Talashkaar data only
│   └── Failure → generateMockResult()
│
└── Return ScanResult
```

### Mock Data Fallback

**File:** `src/lib/mock-data.ts`

When both APIs fail, realistic mock data is generated:
- **Categories:** 8 categories cycled by random seed (Mobile Phone, Kurti, Sneakers, Perfume, Wrist Watch, Leather Bag, LED TV, Cricket Bat)
- **Brands:** Real Pakistani-relevant brands per category (e.g., Sana Safinaz, Servis, Casio, CA bats)
- **Images:** Unsplash stock product photos
- **Merchants:** Category-appropriate stores (e.g., Sneakers → Servis, Borjan, Metro, Stylo)
- **Prices:** Base prices varied by ±20% random noise
- **DataSource:** Always `"estimated"` with `"low"` confidence

---

## 7. Anti-Hallucination & Accuracy

The system has multiple safeguards to prevent incorrect outputs:

### 7a. Bina (Vision AI)

| Safeguard | Implementation |
|---|---|
| Strict output format | Prompt forces pure JSON. No markdown. No commentary. No thinking tags. |
| Brand confidence gate | Brand defaults to `"Unknown"` unless the model is certain it sees a logo or text |
| Price in PKR | Prompt explicitly sets 1 USD ≈ 280 PKR with import duty context |
| Blurry image handling | Prompt instructs `confidence: "low"` for unclear images |
| Model number extraction | Prompt emphasizes extracting model numbers/SKUs visible in the image |
| Feature constraint | Only visually observable attributes (max 4 features) |
| JSON repair | `extractJson()` handles broken JSON, markdown fences, truncated responses, and thinking tags |
| Key rotation | If a key returns a quota error, the system tries the next key automatically |

### 7b. Talashkaar (Web Search)

| Safeguard | Implementation |
|---|---|
| Merchant whitelist | Results are filtered through 34 known Pakistani merchants. Non-Pakistani stores are excluded. |
| Domain verification | Each result's URL is parsed to extract the hostname and matched against merchant domains |
| Similarity scoring | Every web result gets a 0–100 similarity score. Only ≥80 are "high similarity." |
| Lens + Shopping dual path | If Lens returns no Pakistani results, falls back to Shopping with `gl=pk` and `site:.pk` |
| Deduplication | Results are deduplicated by product URL |
| Price parsing | Handles multiple currency formats and locales |
| COD tracking | Each merchant has a known COD (Cash on Delivery) status |

### 7c. Munsif (Scoring)

| Safeguard | Implementation |
|---|---|
| Category price ranges | 50+ categories with explicit PKR min/max bounds |
| Outlier rejection | IQR filtering removes extreme price values before averaging |
| Composite confidence | Four factors combined: API success, comparison count, similarity count, price validity |
| DataSource transparency | Every result carries provenance: `ai_vision_plus_web`, `ai_vision`, `web`, or `estimated` |
| Similarity threshold | Only ≥80% similar results contribute to high-confidence pricing |
| Graceful degradation | If Bina fails, Talashkaar runs alone. If both fail, mock data (marked as estimated) is returned |

### 7d. UI Transparency

The verdict dashboard always shows:
- **Confidence badge:** High/Medium/Low with color coding
- **DataSource badge:** Where the data came from (AI Vision + Web, AI Vision Only, Web Only, Estimated)
- **Store count:** How many stores were checked
- **Exact model:** The detected model number (if available)
- **Similarity scores:** Each comparison shows its match percentage

---

## 8. UI Components

**Directory:** `src/components/`

### Header (`Header.tsx`)
- Sticky header with backdrop blur
- Logo: scan icon in gradient redbox + "KIFAYAT AI" text in Anton font
- Urdu script badge: "کفایت"
- Pakistan flag + PKR badge
- Theme toggle (dark/light) — uses Zustand store with localStorage persistence
- History button with saved deals count badge

### UploadSection (`UploadSection.tsx`)
- Hero heading: "NEVER OVERPAY AGAIN" with red gradient
- Drag-and-drop zone with dashed border
- Upload Photo button (file picker)
- Take Photo button (camera capture via `capture='environment'`)
- Image preview with clear button and gradient overlay
- Asking price input (numeric, PKR suffix, ₨ prefix)
- Optional details input (brand, store, or tag info)
- "RUN KIFAYAT SCAN" button with shimmer animation

### AnalyzingState (`AnalyzingState.tsx`)
- Three-step animated progress display:
  1. Bina — analyzing visual features
  2. Talashkaar — searching Pakistani stores
  3. Munsif — calculating score and validating
- Each step transitions at 1.8s intervals
- Rotating loader icon

### VerdictDashboard (`VerdictDashboard.tsx`)
- Pakistan badge + confidence badge + data source badge
- Detected model display
- KifayatScoreGauge (circular progress) + price comparison grid
- Savings/overpriced callout
- AI Vision Analysis section (brand, category, features)
- Cheaper Options section (top 4, sorted by price, with merchant links)

### KifayatScoreGauge (`KifayatScoreGauge.tsx`)
- SVG circular gauge (radius 52, circumference ~327)
- Animated score counter (1.2s count-up)
- Color-coded: ≥80 emerald, ≥50 amber, <50 red
- Animated verdict badge

### ComparisonGrid (`ComparisonGrid.tsx`)
- Grid of price comparison cards (responsive: 1/2/3 columns)
- Each card: product image, title, merchant, price, similarity score, COD badge, external link
- Cheapest result highlighted with "Best" badge and emerald ring
- Glass-card hover effect with red tint

### HistoryDrawer (`HistoryDrawer.tsx`)
- Slide-in sidebar from the right (spring animation)
- Saved deals section (heart-toggle persistence)
- Recent scans section
- Click to re-view any past scan
- Empty state with icon and message

### ShaderAnimation (`ui/shader-lines.tsx`)
- Three.js WebGL animated background
- Dynamic shader with mosaic grid scanlines
- Red-biased color output (R×1.4, G×0.15, B×0.1)
- Runs on canvas, does not block interaction
- Auto-resizes to container dimensions

---

## 9. State Management

**File:** `src/store/useStore.ts`

Built with **Zustand** and persisted to `localStorage`.

### State Shape

```typescript
interface HistoryState {
  theme: 'light' | 'dark';           // persisted as 'ka-theme'
  scanState: ScanState;              // 'idle' | 'uploading' | 'analyzing' | 'complete' | 'error'
  currentResult: ScanResult | null;  // active scan result
  history: ScanResult[];             // last 50 scans, persisted as 'ka-history'
  savedIds: string[];                // saved scan IDs, persisted as 'ka-saved'
  isHistoryOpen: boolean;            // drawer toggle
}
```

### Actions

| Action | Description |
|---|---|
| `rehydrate()` | Loads all persisted state from localStorage on mount |
| `setTheme(theme)` | Updates theme, persists to localStorage, toggles `dark` class on `<html>` |
| `setScanState(state)` | Transitions the scan lifecycle |
| `setCurrentResult(result)` | Sets the active scan for display |
| `addToHistory(result)` | Prepends to history array, caps at 50, persists |
| `toggleSaved(id)` | Toggles a scan ID in the saved set, persists |
| `toggleHistory()` | Opens/closes the history drawer |

### Persistence Keys

| Key | Content |
|---|---|
| `ka-theme` | `"light"` or `"dark"` |
| `ka-history` | `ScanResult[]` (max 50) |
| `ka-saved` | `string[]` (saved scan IDs) |

---

## 10. API Reference

### `POST /api/analyze`

**Endpoint:** `/api/analyze`

**Request Body:**
```typescript
{
  imageData: string;       // base64-encoded image (data URI)
  askingPrice: number;     // user's price in PKR
  details?: string;        // optional: brand, store, or context
}
```

**Response:** `ScanResult` (see Data Models)

**Error Responses:**
- `400` — Missing or invalid `imageData` or `askingPrice`
- `500` — Internal error during analysis

**Example (fetch):**
```typescript
const res = await fetch('/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    imageData: 'data:image/jpeg;base64,...',
    askingPrice: 25000,
    details: 'Samsung Galaxy S24',
  }),
});
const result = await res.json();
```

---

## 11. Data Models

**File:** `src/types/index.ts`

### ScanResult

```typescript
interface ScanResult {
  id: string;                        // "scan-{timestamp}-{random}"
  timestamp: number;                 // Date.now()
  imageData: string;                 // original base64 image
  askingPrice: number;               // user's price in PKR
  kifayatScore: number;              // 0–100
  category: string;                  // e.g., "Mobile Phone"
  brand: string;                     // e.g., "Samsung" or "Unknown"
  exactModel: string;                // e.g., "Galaxy S24 Ultra"
  features: string[];                // e.g., ["Dual SIM", "5G Support"]
  averageWebPrice: number;           // IQR-averaged web price in PKR
  savingsAmount: number;             // savings in PKR
  savingsPercentage: number;         // savings as % of web avg
  verdict: 'must_buy' | 'fair_value' | 'overpriced';
  comparisons: ComparisonItem[];     // web price matches
  details?: string;                  // user-provided context
  confidence: 'high' | 'medium' | 'low';
  dataSource: DataSource;            // see below
  webPriceCount: number;             // number of web prices found
  groqRawAnalysis: string;           // raw AI response (first 2000 chars)
}
```

### ComparisonItem

```typescript
interface ComparisonItem {
  id: string;                    // "web-{index}" or "comp-{index}"
  title: string;                 // product listing title
  merchant: string;              // merchant name (e.g., "Daraz")
  merchantDomain: string;        // domain (e.g., "daraz.pk")
  price: number;                 // price in PKR
  imageUrl: string;              // product thumbnail
  productUrl: string;            // link to product page
  similarityScore: number;       // 0–100 similarity rating
  isLowerPrice: boolean;         // cheaper than askingPrice
  dataSource: DataSource;        // provenance of this price
  supportsCOD: boolean;          // Cash on Delivery available
}
```

### DataSource Enum

```typescript
type DataSource = 
  | 'ai_vision_plus_web'   // Bina + Talashkaar both succeeded
  | 'ai_vision'             // Bina only (no web prices)
  | 'web'                   // Talashkaar only (Bina failed)
  | 'estimated';            // Both failed, mock data used
```

### ScanState Enum

```typescript
type ScanState = 
  | 'idle'        // initial state
  | 'uploading'   // image being uploaded
  | 'analyzing'   // pipeline running
  | 'complete'    // result ready
  | 'error';      // pipeline failed
```

---

## 12. Merchant Database

**File:** `src/lib/merchants.ts`

34 Pakistani e-commerce merchants organized by category:

| Merchant | Domain | Category | COD | Priority |
|---|---|---|---|---|
| Daraz | daraz.pk | marketplace | ✓ | 1 |
| PriceOye | priceoye.pk | electronics | ✓ | 2 |
| Shophive | shophive.pk | electronics | ✓ | 3 |
| Mega | mega.pk | electronics | ✓ | 4 |
| HomeShopping | homeshopping.pk | general | ✓ | 5 |
| Symbios | symbios.pk | electronics | ✓ | 6 |
| Telemart | telemart.pk | electronics | ✓ | 7 |
| GOTO | goto.com.pk | general | ✓ | 8 |
| iShopping | ishop.pk | general | ✓ | 9 |
| CZone | czone.com.pk | electronics | ✓ | 10 |
| Sapphire | sapphireonline.pk | fashion | ✓ | 11 |
| Gul Ahmed | gulahmedshop.com | fashion | ✓ | 12 |
| Junaid Jamshed | junaidjamshed.com | fashion | ✓ | 13 |
| Bonanza | bonanzagt.com | fashion | ✓ | 14 |
| Limelight | limelight.pk | fashion | ✓ | 15 |
| Sana Safinaz | sanasafinaz.com | fashion | ✓ | 16 |
| Maria B | maria-b.pk | fashion | ✓ | 17 |
| Nishat Linens | nishatlinen.com | fashion | ✓ | 18 |
| Alkaram | alkaramstudio.com | fashion | ✓ | 19 |
| Servis | servis.com.pk | fashion | ✓ | 20 |
| Borjan | borjan.pk | fashion | ✓ | 21 |
| Metro Shoes | metroshoes.com.pk | fashion | ✓ | 22 |
| Stylo | stylo.pk | fashion | ✓ | 23 |
| Jafferjees | jafferjees.com | fashion | ✗ | 24 |
| Daachi | daachi.com.pk | fashion | ✓ | 25 |
| Insight | insightout.com.pk | fashion | ✓ | 26 |
| Scents | scents.com.pk | general | ✓ | 27 |
| Dawlance | dawlance.com.pk | electronics | ✗ | 28 |
| Haier | haierpk.com | electronics | ✗ | 29 |
| Orient | orientelectronics.com | electronics | ✗ | 30 |
| PEL | pel.com.pk | electronics | ✗ | 31 |
| QMobile | qmobile.com.pk | electronics | ✓ | 32 |
| Zebronics | zebronics.com.pk | electronics | ✓ | 33 |
| HF Car Accessories | hfcaraccessories.com | general | ✓ | 34 |

Merchant matching uses domain-based identification. Any URL containing `.pk`, `pakistan`, or a known merchant subdomain is classified as a Pakistani store. Results from non-Pakistani sources are excluded from the price comparison.

---

## 13. Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 16.2.12 (App Router) |
| Build Tool | Turbopack |
| Language | TypeScript |
| UI Library | React 19.2.4 |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| State Management | Zustand |
| Icons | Lucide React |
| Background | Three.js (WebGL shader) |
| Vision AI | Groq API (qwen/qwen3.6-27b) |
| Web Search | SerpAPI (Google Lens + Shopping) |
| Fonts | Anton, Outfit, JetBrains Mono |
| UI Primitives | Radix UI (Dialog, Dropdown, Select, Slot) |
| Utilities | clsx, tailwind-merge |

---

## 14. Environment Variables

Required for the analysis pipeline to function:

```bash
# Groq API key(s) for vision analysis (Bina)
# Add up to 10 keys for automatic rotation on quota limits
GROQ_API_KEY=gsk_...
GROQ_API_KEY_1=gsk_...
GROQ_API_KEY_2=gsk_...
# ... up to GROQ_API_KEY_10

# SerpAPI key for web search (Talashkaar)
SERPAPI_API_KEY=...
```

Without these keys, all scans return estimated mock data (`confidence: "low"`, `dataSource: "estimated"`).
