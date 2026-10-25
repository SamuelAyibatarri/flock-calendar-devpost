import Constants from 'expo-constants';
import type { Batch, RuleKind } from '@/storage/store';
import { daysBetween } from '@/schedule/rules';

const MODEL = 'gemini-3.5-flash-lite';
const TIMEOUT_MS = 25000;

export function getGeminiKey(): string | null {
  const extra = (Constants.expoConfig?.extra as any)?.GEMINI_API_KEY;
  const env = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  return extra || env || null;
}

export type AiTaskSuggestion = {
  title: string;
  daysFromNow: number;
  kind: RuleKind;
};

export type AiConsultationResult = {
  ok: boolean;
  analysis: string;
  dosageTip?: string;
  suggestedTasks: AiTaskSuggestion[];
  source: 'gemini' | 'offline_expert';
};

export async function askFlockAi(
  userQuery: string,
  batches: Batch[],
  todayStr: string
): Promise<AiConsultationResult> {
  const key = getGeminiKey();
  if (!key) {
    return getOfflineFallbackAdvice(userQuery, batches);
  }

  const batchInfo = batches
    .map((b) => `${b.label}: ${b.birdCount} layers, hatched on ${b.hatchDate}`)
    .join('; ');

  const prompt = `You are Flock AI, an expert Veterinary & Poultry Management Advisor assisting a layer chicken farmer.
Today's date is: ${todayStr}.
Farm's current flock batches:
${batchInfo || 'No batches registered yet.'}

Farmer's question or issue:
"${userQuery}"

Provide:
1. Direct, practical veterinary assessment and actionable steps (2-3 short paragraphs). If medication/deworming/vitamins are involved, include specific dosage calculations based on the batch bird counts and water withdrawal rules.
2. If this issue warrants a multi-day recovery or treatment routine, provide a structured list of calendar tasks.

You MUST respond strictly with valid JSON conforming to this schema (no extra preamble):
{
  "analysis": "A concise, veterinary-grounded explanation and immediate advice.",
  "dosageTip": "Exact dosage instructions (e.g. mix 20g in 16L of water for 80 layers) or null",
  "suggestedTasks": [
    {
      "title": "Short descriptive task title",
      "daysFromNow": 0,
      "kind": "deworm" | "vaccine" | "custom" | "checkup" | "cleaning"
    }
  ]
}`;

  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
          },
        }),
        signal: ctl.signal,
      }
    );

    clearTimeout(timer);

    if (!res.ok) {
      console.warn('[FlockAI] Gemini request returned status', res.status);
      return getOfflineFallbackAdvice(userQuery, batches);
    }

    const j = await res.json();
    const text: string =
      j?.candidates?.[0]?.content?.parts
        ?.map((p: any) => p?.text || '')
        .join('')
        ?.trim() || '';

    const cleanJson = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const parsed = JSON.parse(cleanJson);
    return {
      ok: true,
      analysis: parsed.analysis || 'Analysis complete.',
      dosageTip: parsed.dosageTip || undefined,
      suggestedTasks: Array.isArray(parsed.suggestedTasks) ? parsed.suggestedTasks : [],
      source: 'gemini',
    };
  } catch (err: any) {
    console.warn('[FlockAI] Fallback triggered:', err?.message || err);
    return getOfflineFallbackAdvice(userQuery, batches);
  }
}

/** Offline fallback rules so the farmer always gets accurate guidance even without internet */
function getOfflineFallbackAdvice(
  userQuery: string,
  batches: Batch[]
): AiConsultationResult {
  const q = userQuery.toLowerCase();
  const totalBirds = batches.reduce((acc, b) => acc + b.birdCount, 0) || 80;
  const dailyWaterLiters = Math.round(totalBirds * 0.2); // ~200ml per layer/day

  if (q.includes('deworm') || q.includes('worm') || q.includes('dosage')) {
    return {
      ok: true,
      analysis: `For ${totalBirds} layers, standard Piperazine or Levamisole deworming protocol requires approx ${dailyWaterLiters} Liters of morning water. Withdraw ordinary drinking water for 2 hours beforehand so birds drink the medicated water eagerly.`,
      dosageTip: `Mix dewormer according to package for ${dailyWaterLiters}L of water. Administer over 2-3 consecutive mornings, then follow up with 2 days of multivitamins.`,
      suggestedTasks: [
        { title: `Deworming Day 1 (${totalBirds} layers)`, daysFromNow: 0, kind: 'deworm' },
        { title: `Deworming Day 2 (${totalBirds} layers)`, daysFromNow: 1, kind: 'deworm' },
        { title: `Post-deworming Multivitamins & Electrolytes`, daysFromNow: 2, kind: 'custom' },
      ],
      source: 'offline_expert',
    };
  }

  if (q.includes('egg') || q.includes('drop') || q.includes('production')) {
    return {
      ok: true,
      analysis: `Sudden drops in egg production are commonly caused by heat stress, sudden water shortages, lighting disruption, or early stage respiratory challenges. Check ventilation and ensure layers receive at least 16 hours of consistent light daily.`,
      dosageTip: `Provide water-soluble electrolytes and Vitamin C during peak afternoon heat. Increase dietary calcium (oyster shells/limestone grit).`,
      suggestedTasks: [
        { title: 'Inspect drinkers & water pressure', daysFromNow: 0, kind: 'checkup' },
        { title: 'Administer Stress-pack / Electrolytes in water', daysFromNow: 0, kind: 'custom' },
        { title: 'Supplement Limestone / Oyster shell grit', daysFromNow: 1, kind: 'feed' },
        { title: 'Audit egg collection count vs baseline', daysFromNow: 2, kind: 'checkup' },
      ],
      source: 'offline_expert',
    };
  }

  if (q.includes('newcastle') || q.includes('vaccin') || q.includes('lasota')) {
    return {
      ok: true,
      analysis: `Newcastle Lasota booster is recommended every 60 days for commercial layers. Only vaccinate healthy birds. Never use chlorinated tap water as chlorine inactivates live vaccines.`,
      dosageTip: `Mix vaccine in ${Math.round(dailyWaterLiters * 0.4)}L of cool, chlorine-free water with skimmed milk powder (2g/L) as a stabilizer.`,
      suggestedTasks: [
        { title: `Newcastle Lasota Booster (${totalBirds} birds)`, daysFromNow: 0, kind: 'vaccine' },
        { title: `Post-vaccine Multivitamins`, daysFromNow: 1, kind: 'custom' },
      ],
      source: 'offline_expert',
    };
  }

  return {
    ok: true,
    analysis: `Care advice for ${totalBirds} layers: Ensure clean, cool water at all times (approx ${dailyWaterLiters}L daily). Maintain dry litter to prevent coccidiosis, and isolate any lethargic birds immediately.`,
    dosageTip: `Daily water requirement: ~${dailyWaterLiters} Liters for ${totalBirds} birds.`,
    suggestedTasks: [
      { title: 'Thorough coop inspection & litter check', daysFromNow: 0, kind: 'checkup' },
      { title: 'Refresh water troughs & check intake', daysFromNow: 0, kind: 'water' },
    ],
    source: 'offline_expert',
  };
}

export function generateBriefing(batches: Batch[], todayStr: string): string {
  if (batches.length === 0) {
    return 'Welcome to Flock Calendar! Add your first batch to start generating schedules.';
  }
  const totalBirds = batches.reduce((sum, b) => sum + b.birdCount, 0);
  const firstBatch = batches[0];
  const ageWeeks = Math.max(0, Math.floor(daysBetween(firstBatch.hatchDate, todayStr) / 7));

  if (ageWeeks < 18) {
    return `Grower stage (Week ${ageWeeks}): ${totalBirds} pullets developing. Focus on balanced grower mash and bone development before point of lay.`;
  }
  if (ageWeeks <= 42) {
    return `Peak Laying Stage (Week ${ageWeeks}): ${totalBirds} layers in active production. Prioritize cool water and calcium supplementation.`;
  }
  return `Mature Flock (Week ${ageWeeks}): ${totalBirds} layers tracked across ${batches.length} batch${batches.length > 1 ? 'es' : ''}. Keep vaccination and deworming cycles strict.`;
}
