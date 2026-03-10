/**
 * Date helpers — current month range, first day, etc.
 */
export function getCurrentMonthRange(): { fromDate: string; toDate: string } {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    fromDate: from.toISOString().slice(0, 10),
    toDate: to.toISOString().slice(0, 10),
  };
}

export function getFirstDayOfMonth(year: number, month: number): string {
  const d = new Date(year, month, 1);
  return d.toISOString().slice(0, 10);
}

export function getCurrentMonth(): string {
  const now = new Date();
  return getFirstDayOfMonth(now.getFullYear(), now.getMonth());
}

const LOCALE_MAP: Record<string, string> = { pl: 'pl-PL', en: 'en-US' };

export function formatDate(dateStr: string, locale: string = 'pl'): string {
  const l = LOCALE_MAP[locale] ?? 'pl-PL';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(l, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatMonth(dateStr: string, locale: string = 'pl'): string {
  const l = LOCALE_MAP[locale] ?? 'pl-PL';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(l, {
    month: 'long',
    year: 'numeric',
  });
}

export function getMonthRange(monthFirstDay: string): { fromDate: string; toDate: string } {
  const d = new Date(monthFirstDay + 'T00:00:00');
  const from = new Date(d.getFullYear(), d.getMonth(), 1);
  const to = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return {
    fromDate: from.toISOString().slice(0, 10),
    toDate: to.toISOString().slice(0, 10),
  };
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

/** Get date range bounds for a multi-month range (start and end dates) */
export function getRangeBounds(startMonth: string, endMonth: string): { fromDate: string; toDate: string } {
  const start = new Date(startMonth + 'T00:00:00');
  const end = new Date(endMonth + 'T00:00:00');
  const from = new Date(start.getFullYear(), start.getMonth(), 1);
  const to = new Date(end.getFullYear(), end.getMonth() + 1, 0);
  return {
    fromDate: from.toISOString().slice(0, 10),
    toDate: to.toISOString().slice(0, 10),
  };
}

/** Months between start and end inclusive (YYYY-MM-01) */
export function getMonthsInRange(startMonth: string, endMonth: string): string[] {
  const start = new Date(startMonth + 'T00:00:00');
  const end = new Date(endMonth + 'T00:00:00');
  const months: string[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    months.push(getFirstDayOfMonth(cur.getFullYear(), cur.getMonth()));
    cur.setMonth(cur.getMonth() + 1);
  }
  return months;
}

/** Last N months including current (YYYY-MM-01 strings) */
export function getRecentMonths(count: number): string[] {
  const now = new Date();
  const months: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(getFirstDayOfMonth(m.getFullYear(), m.getMonth()));
  }
  return months;
}

export function isDateBefore(a: string, b: string): boolean {
  return a < b;
}

export function isDateAfter(a: string, b: string): boolean {
  return a > b;
}

/** Get dates to generate for recurring transaction between fromDate and today (or end_date) */
export function getRecurringDatesToGenerate(
  frequency: 'daily' | 'weekly' | 'monthly',
  lastGenOrStart: string,
  endDate: string | null,
  upToDate: string
): string[] {
  const dates: string[] = [];
  const today = upToDate;
  let current = lastGenOrStart;

  if (frequency === 'daily') {
    current = addDays(current, 1);
    while (current <= today && (!endDate || current <= endDate)) {
      dates.push(current);
      current = addDays(current, 1);
    }
  } else if (frequency === 'weekly') {
    current = addDays(current, 7);
    while (current <= today && (!endDate || current <= endDate)) {
      dates.push(current);
      current = addDays(current, 7);
    }
  } else if (frequency === 'monthly') {
    current = addMonths(current, 1);
    while (current <= today && (!endDate || current <= endDate)) {
      dates.push(current);
      current = addMonths(current, 1);
    }
  }

  return dates;
}
