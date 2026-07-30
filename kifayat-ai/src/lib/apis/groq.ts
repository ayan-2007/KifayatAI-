const MODEL = 'qwen/qwen3.6-27b';

interface GroqResponse {
  choices?: { message?: { content?: string } }[];
}

export interface GroqAnalysis {
  success: boolean;
  category?: string;
  brand?: string;
  features?: string[];
  estimatedPrice?: number;
  modelConfidence?: 'high' | 'medium' | 'low';
  isLuxury?: boolean;
}

function loadKeys(): string[] {
  const keys: string[] = [];
  for (let i = 1; i <= 10; i++) {
    const k = process.env[`GROQ_API_KEY_${i}`];
    if (k) keys.push(k);
  }
  const primary = process.env.GROQ_API_KEY;
  if (primary) keys.unshift(primary);
  return keys;
}

let keyIndex = 0;

function extractJson(text: string): Record<string, unknown> | null {
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  if (!text) return null;

  try {
    const obj = JSON.parse(text);
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) return obj;
  } catch {}

  const start = text.indexOf('{');
  if (start === -1) return null;

  let depth = 0;
  let end = -1;
  for (let i = start; i < text.length; i++) {
    if (text[i] === '{') depth++;
    if (text[i] === '}') depth--;
    if (depth === 0) { end = i; break; }
  }

  if (end === -1) {
    end = text.lastIndexOf('}');
    if (end <= start) return null;
  }

  try {
    const obj = JSON.parse(text.slice(start, end + 1));
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) return obj;
  } catch {}

  return null;
}

async function sendGroqRequest(
  key: string,
  messages: { role: string; content: unknown }[]
): Promise<{ ok: true; content: string } | { ok: false; status: number }> {
  const body: Record<string, unknown> = {
    model: MODEL,
    messages,
    max_tokens: 4096,
    temperature: 0,
    frequency_penalty: 0.3,
  };

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) return { ok: false, status: res.status };

  const data: GroqResponse = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) return { ok: false, status: 0 };

  return { ok: true, content };
}

async function tryKey(
  key: string,
  imageBase64: string,
  details?: string
): Promise<{ ok: true; data: GroqAnalysis } | { ok: false; quotaExceeded: boolean }> {
  const prompt = `Analyze this product image. Return ONLY valid JSON with no markdown, no thinking tags, no extra text:
{
  "category": "product category (e.g., Smartwatch, Handbag, Sneakers, Sunglasses, Jacket, Dress, Shirt, Backpack, Headphones)",
  "brand": "brand name or Unknown",
  "features": ["feature1", "feature2", "feature3"],
  "estimatedFairPrice": <numeric estimated fair price in USD>,
  "confidence": "high|medium|low",
  "isLuxury": true|false
}
Rules:
- Be precise. Only set brand if you are CERTAIN.
- estimatedFairPrice must be in USD only.
- If unsure about price, set confidence to "low".
- Features should be visual attributes you can actually see.
${details ? `\nContext: ${details}` : ''}`;

  const messages = [
    {
      role: 'system',
      content: 'You are a precise product classifier. Output ONLY a JSON object. No analysis. No thinking. No markdown. If uncertain, set confidence to "low".',
    },
    {
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: imageBase64 } },
      ],
    },
  ];

  const result = await sendGroqRequest(key, messages);

  if (!result.ok) {
    const isQuota = result.status === 429 || result.status === 402;
    if (isQuota) console.warn('[Bina] Key exhausted, rotating...');
    else console.warn(`[Bina] Request failed (${result.status})`);
    return { ok: false, quotaExceeded: isQuota };
  }

  console.log('[Bina] Raw:', result.content.slice(0, 300));

  const parsed = extractJson(result.content);
  if (!parsed) {
    console.warn('[Bina] No valid JSON in response');
    return { ok: false, quotaExceeded: false };
  }

  const modelConfidence = parsed.confidence === 'high' ? 'high'
    : parsed.confidence === 'medium' ? 'medium'
    : 'low';

  let estimatedPrice: number | undefined;
  if (typeof parsed.estimatedFairPrice === 'number' && parsed.estimatedFairPrice > 0) {
    estimatedPrice = parsed.estimatedFairPrice;
  }

  return {
    ok: true,
    data: {
      success: true,
      category: typeof parsed.category === 'string' && parsed.category.trim()
        ? parsed.category.trim().slice(0, 50) : undefined,
      brand: typeof parsed.brand === 'string' && parsed.brand.trim() && parsed.brand !== 'Unknown'
        ? parsed.brand.trim().slice(0, 50) : undefined,
      features: Array.isArray(parsed.features)
        ? parsed.features.filter((f): f is string => typeof f === 'string').slice(0, 8)
        : [],
      estimatedPrice,
      modelConfidence,
      isLuxury: parsed.isLuxury === true,
    },
  };
}

export async function analyzeWithBina(
  imageBase64: string,
  details?: string
): Promise<GroqAnalysis> {
  const allKeys = loadKeys();
  if (allKeys.length === 0) return { success: false };

  const startIndex = keyIndex % allKeys.length;

  for (let attempt = 0; attempt < allKeys.length; attempt++) {
    const idx = (startIndex + attempt) % allKeys.length;
    const key = allKeys[idx];
    const result = await tryKey(key, imageBase64, details);

    if (result.ok) {
      keyIndex = (idx + 1) % allKeys.length;
      console.log(`[Bina] Key #${idx + 1}/${allKeys.length} succeeded`);
      return result.data;
    }

    if (!result.quotaExceeded) break;
  }

  console.warn('[Bina] All keys exhausted');
  return { success: false };
}
