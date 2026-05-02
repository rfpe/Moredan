// ISO 8601: week 1 is the week containing the first Thursday of the year.
export const getISOWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7; // Mon=1 … Sun=7
  d.setUTCDate(d.getUTCDate() + 4 - day); // shift to nearest Thursday
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

export const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

// Returns 0 for Sunday-first, 1 for Monday-first locales.
export const getWeekStart = (locale: string): number => {
  try {
    const loc = new Intl.Locale(locale) as any;
    const firstDay = loc.weekInfo?.firstDay ?? loc.getWeekInfo?.()?.firstDay;
    if (firstDay !== undefined) {
      // Intl firstDay: 1=Mon … 7=Sun. Normalize to JS convention: 0=Sun, 1=Mon.
      return firstDay === 7 ? 0 : 1;
    }
  } catch {}
  // Fallback: Sunday-first for these regions, Monday for the rest.
  const sundayFirst = ['en-US', 'en-CA', 'zh-CN', 'ja-JP', 'ko-KR', 'ar-SA'];
  return sundayFirst.includes(locale) ? 0 : 1;
};

// Number of empty offset cells before day 1 in weekday-alignment mode.
export const getMonthOffset = (year: number, month: number, weekStart: number): number => {
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun … 6=Sat
  return (firstDayOfWeek - weekStart + 7) % 7;
};

export const generateYearData = (year: number, locale: string = 'default') => {
  const months = [];
  for (let m = 0; m < 12; m++) {
    const daysInMonth = getDaysInMonth(year, m);
    const name = new Date(year, m).toLocaleString(locale, { month: 'short' });

    const days = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, m, d);
      const dayOfWeek = date.getDay();
      days.push({
        dayNumber: d,
        weekday: date.toLocaleString(locale, { weekday: 'short' }),
        weekdayNarrow: date.toLocaleString(locale, { weekday: 'narrow' }),
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6
      });
    }

    months.push({
      name,
      days,
      index: m
    });
  }
  return months;
};

export interface EventSpan {
  eventId: string;
  startColumn: number;
  endColumn: number;
  rowOffset: number;
  isStartContinuation: boolean;
  isEndContinuation: boolean;
}

// Assigns globally consistent row offsets to multi-month events so snaking
// connections appear at the same height in every month segment.
export const computeGlobalRowOffsets = (
  events: any[],
  visibleCategoryIds: Set<string>
): Map<string, number> => {
  const multiMonth = events.filter(e => {
    if (!visibleCategoryIds.has(e.categoryId)) return false;
    const s = new Date(e.start); s.setHours(0, 0, 0, 0);
    const en = new Date(e.end); en.setHours(0, 0, 0, 0);
    return s.getMonth() !== en.getMonth() || s.getFullYear() !== en.getFullYear();
  });

  const sorted = [...multiMonth].sort((a, b) => {
    const sd = new Date(a.start).getTime() - new Date(b.start).getTime();
    if (sd !== 0) return sd;
    const aDur = new Date(a.end).getTime() - new Date(a.start).getTime();
    const bDur = new Date(b.end).getTime() - new Date(b.start).getTime();
    return bDur - aDur;
  });

  const rowRanges: Array<Array<{ start: Date; end: Date }>> = [];
  const result = new Map<string, number>();

  for (const event of sorted) {
    const eStart = new Date(event.start); eStart.setHours(0, 0, 0, 0);
    const eEnd = new Date(event.end); eEnd.setHours(0, 0, 0, 0);
    let row = 0;
    while (true) {
      if (!rowRanges[row]) rowRanges[row] = [];
      const conflict = rowRanges[row].some(r => eStart <= r.end && eEnd >= r.start);
      if (!conflict) {
        rowRanges[row].push({ start: eStart, end: eEnd });
        result.set(event.id, row);
        break;
      }
      row++;
    }
  }

  return result;
};

export const getMonthSpans = (
  events: any[],
  monthIndex: number,
  year: number,
  visibleCategoryIds: Set<string>,
  weekdayAlign: boolean = false,
  weekStart: number = 1,
  globalRowOffsets: Map<string, number> = new Map()
): EventSpan[] => {
  const monthStart = new Date(year, monthIndex, 1);
  const monthEnd = new Date(year, monthIndex + 1, 0);
  const daysInMonth = monthEnd.getDate();
  const offset = weekdayAlign ? getMonthOffset(year, monthIndex, weekStart) : 0;

  // 1. Filter and project events onto this month
  const spans: Omit<EventSpan, 'rowOffset'>[] = [];

  events.forEach(event => {
    if (!visibleCategoryIds.has(event.categoryId)) return;

    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);

    eventStart.setHours(0, 0, 0, 0);
    eventEnd.setHours(0, 0, 0, 0);

    if (eventStart <= monthEnd && eventEnd >= monthStart) {
      const startDay = eventStart < monthStart ? 1 : eventStart.getDate();
      const endDay = eventEnd > monthEnd ? daysInMonth : eventEnd.getDate();

      // +1 for month label column, +offset for empty weekday cells
      spans.push({
        eventId: event.id,
        startColumn: startDay + 1 + offset,
        endColumn: endDay + 2 + offset,
        isStartContinuation: eventStart < monthStart,
        isEndContinuation: eventEnd > monthEnd
      });
    }
  });

  // 2. Greedy Stacking — multi-month events use their pre-assigned global row;
  //    single-month events fill in gaps with a local greedy pass.
  const positionedSpans: EventSpan[] = [];
  const rows: Array<Array<{ start: number; end: number }>> = [];

  // Pass 1: place global (multi-month) events first to reserve their rows
  const globalSpans = spans.filter(s => globalRowOffsets.has(s.eventId));
  const localSpans = spans.filter(s => !globalRowOffsets.has(s.eventId));

  globalSpans.forEach(span => {
    const rowIndex = globalRowOffsets.get(span.eventId)!;
    if (!rows[rowIndex]) rows[rowIndex] = [];
    rows[rowIndex].push({ start: span.startColumn, end: span.endColumn });
    positionedSpans.push({ ...span, rowOffset: rowIndex });
  });

  // Pass 2: local greedy for single-month events, skipping rows already taken
  const sortedLocal = [...localSpans].sort((a, b) => {
    if (a.startColumn !== b.startColumn) return a.startColumn - b.startColumn;
    return (b.endColumn - b.startColumn) - (a.endColumn - a.startColumn);
  });

  sortedLocal.forEach(span => {
    let rowIndex = 0;
    while (true) {
      if (!rows[rowIndex]) rows[rowIndex] = [];
      const hasConflict = rows[rowIndex].some(
        existing => span.startColumn < existing.end && span.endColumn > existing.start
      );
      if (!hasConflict) {
        rows[rowIndex].push({ start: span.startColumn, end: span.endColumn });
        positionedSpans.push({ ...span, rowOffset: rowIndex });
        break;
      }
      rowIndex++;
    }
  });

  return positionedSpans;
};
