import type { Batch, Rule } from '@/storage/store';
import { STANDARD_LAYER_RULES } from './poultry';

export type SetupAnswers = {
  birdType: string;
  caretakerSchedule: 'student' | 'worker';
  birdCount: number;
  birdAgeDays: number;
  checkupsPerDay: number;
  feedingsPerDay: number;
};

let nextRuleId = 0;
const nextId = () => `rule-${++nextRuleId}`;

/** Turn setup answers + the standard schedule into batches + care rules. */
export function generateFlock(answers: SetupAnswers): {
  batches: Batch[];
  rules: Rule[];
} {
  const now = new Date();
  const hatchDate = new Date(now);
  hatchDate.setUTCDate(now.getUTCDate() - answers.birdAgeDays);
  const hatchDateISO = hatchDate.toISOString().split('T')[0];

  const batch: Batch = {
    id: 'batch-1',
    label: 'Batch 1',
    birdCount: answers.birdCount,
    hatchDate: hatchDateISO,
  };

  const rules: Rule[] = STANDARD_LAYER_RULES.map((std) => ({
    id: nextId(),
    batchId: batch.id,
    ...std,
  }));

  return { batches: [batch], rules };
}
