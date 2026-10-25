import type { Rule } from '@/storage/store';

/** Standard age-based layer-care schedule. Values are offsets from hatch date. */
export const STANDARD_LAYER_RULES: Omit<Rule, 'id' | 'batchId'>[] = [
  { kind: 'checkup', title: 'Morning checkup', intervalDays: 1, timesPerDay: 1 },
  { kind: 'feed', title: 'Feed birds', intervalDays: 1, timesPerDay: 1 },
  { kind: 'water', title: 'Refill water', intervalDays: 1, timesPerDay: 1 },
  { kind: 'eggs', title: 'Pick eggs', intervalDays: 1, timesPerDay: 1 },
  { kind: 'cleaning', title: 'Clean cage', intervalDays: 7 },
  { kind: 'vaccine', title: 'Newcastle vaccine', startOffsetDays: 14, intervalDays: 60 },
  { kind: 'deworm', title: 'Deworming', startOffsetDays: 4, durationDays: 3, intervalDays: 60 },
];
