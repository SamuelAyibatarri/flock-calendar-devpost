const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3));
const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const pad = (n: number) => String(n).padStart(2, '0');

/** Today as a UTC ISO date (YYYY-MM-DD), matching the schedule engine. */
export function todayIso(): string {
  return new Date().toISOString().split('T')[0];
}

/** Build a UTC ISO date from parts. `month` is 1-based. */
export function isoDate(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** Parse an ISO date into UTC parts. */
export function dateParts(iso: string): {
  year: number;
  month: number;
  day: number;
  weekday: number;
} {
  const [year, month, day] = iso.split('-').map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return { year, month, day, weekday };
}

/** "Fri, Oct 24" */
export function formatShort(iso: string): string {
  const { month, day, weekday } = dateParts(iso);
  return `${WEEKDAYS_SHORT[weekday]}, ${MONTHS_SHORT[month - 1]} ${day}`;
}

/** "Friday, October 24" */
export function formatLong(iso: string): string {
  const { month, day, weekday } = dateParts(iso);
  const weekdayLong = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ][weekday];
  return `${weekdayLong}, ${MONTHS[month - 1]} ${day}`;
}

/** "October 2026" */
export function formatMonth(iso: string): string {
  const { year, month } = dateParts(iso);
  return `${MONTHS[month - 1]} ${year}`;
}

export function weekdayInitial(iso: string): string {
  return WEEKDAYS_SHORT[dateParts(iso).weekday].slice(0, 1);
}
