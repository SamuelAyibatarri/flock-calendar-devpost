import type { Batch, Rule } from '@/storage/store';

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Add N days to an ISO date string (UTC). */
export function addDays(dateStr: string, n: number): string {
  const d = parseDate(dateStr);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().split('T')[0];
}

/** Difference in days between two ISO date strings (UTC). */
export function daysBetween(a: string, b: string): number {
  const da = parseDate(a).getTime();
  const db = parseDate(b).getTime();
  return Math.round((db - da) / (1000 * 60 * 60 * 24));
}

/**
 * Is this rule due on the given date, relative to its batch's hatch date?
 * - intervalDays: due every N days starting from hatch date
 * - startOffsetDays (+ optional durationDays): due starting N days after hatch
 *   (spanning durationDays days when set)
 */
export function isRuleDueOn(
  rule: Rule,
  hatchDate: string,
  date: string,
): boolean {
  const offset = daysBetween(hatchDate, date);
  if (offset < 0) return false;

  // Multi-day task starting at startOffsetDays
  if (rule.startOffsetDays !== undefined) {
    const start = rule.startOffsetDays;
    const end = rule.durationDays !== undefined ? start + rule.durationDays - 1 : start;
    if (offset >= start && offset <= end) return true;
    // A task with only startOffsetDays (no duration, no interval) is a one-off
    if (rule.intervalDays === undefined && rule.durationDays === undefined) {
      return offset === start;
    }
  }

  // Recurring interval from hatch date
  if (rule.intervalDays !== undefined) {
    return offset % rule.intervalDays === 0;
  }

  return false;
}
