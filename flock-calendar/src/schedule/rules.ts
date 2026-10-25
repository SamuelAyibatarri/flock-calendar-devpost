import type { Rule } from '@/storage/store';

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

  // Explicit one-off task: due on its exact date
  if (rule.dueDate) {
    return date === rule.dueDate;
  }

  // Multi-day recurring task (e.g. deworming every 60 days across 3 days)
  if (rule.intervalDays !== undefined && rule.durationDays !== undefined) {
    const start = rule.startOffsetDays ?? 0;
    if (offset < start) return false;
    const cycle = (offset - start) % rule.intervalDays;
    return cycle >= 0 && cycle < rule.durationDays;
  }

  // Multi-day one-off task starting at startOffsetDays
  if (rule.startOffsetDays !== undefined && rule.intervalDays === undefined) {
    const start = rule.startOffsetDays;
    const end = rule.durationDays !== undefined ? start + rule.durationDays - 1 : start;
    return offset >= start && offset <= end;
  }

  // Recurring interval from hatch date (with optional startOffsetDays)
  if (rule.intervalDays !== undefined) {
    const start = rule.startOffsetDays ?? 0;
    if (offset < start) return false;
    return (offset - start) % rule.intervalDays === 0;
  }

  return false;
}
