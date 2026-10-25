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

  const rules: Rule[] = STANDARD_LAYER_RULES.map((std) => {
    let timesPerDay = std.timesPerDay;
    
    if (std.kind === 'feed' && answers.feedingsPerDay) {
      timesPerDay = answers.feedingsPerDay;
    }
    if (std.kind === 'checkup' && answers.checkupsPerDay) {
      timesPerDay = answers.checkupsPerDay;
    }

    const ruleTitle = timesPerDay && timesPerDay > 1 
      ? `${std.title} (${timesPerDay}x)` 
      : std.title;

    return {
      id: nextId(),
      batchId: batch.id,
      ...std,
      title: ruleTitle,
      timesPerDay
    };
  });

  return { batches: [batch], rules };
}