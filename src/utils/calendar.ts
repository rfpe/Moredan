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

// Returns the Monday of the ISO week containing `date`.
const isoWeekMonday = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay() || 7; // Mon=1 … Sun=7
  d.setDate(d.getDate() - (day - 1));
  return d;
};

export interface WeekCell {
  // ISO week number
  isoWeek: number;
  // Monday of this ISO week
  weekStart: Date;
  // Sunday of this ISO week
  weekEnd: Date;
  // Column index within the month row (1-based, after the label column)
  column: number;
}

export interface WeekEventBar {
  kind: 'bar';
  eventId: string;
  startColumn: number;
  endColumn: number;
  rowOffset: number;
  isStartContinuation: boolean;
  isEndContinuation: boolean;
}

export interface WeekEventDot {
  kind: 'dot' | 'pill';
  eventId: string;
  column: number;
  dotIndex: number;
}

export type WeekEventSpan = WeekEventBar | WeekEventDot;

export interface WeekViewMonth {
  weeks: WeekCell[];
  spans: WeekEventSpan[];
}

// Returns up to 6 ISO weeks that overlap the given month, plus event spans.
export const getWeekViewData = (
  events: any[],
  monthIndex: number,
  year: number,
  visibleCategoryIds: Set<string>,
  globalRowOffsets: Map<string, number> = new Map()
): WeekViewMonth => {
  const monthStart = new Date(year, monthIndex, 1);
  const monthEnd   = new Date(year, monthIndex + 1, 0);

  // Collect all ISO week Mondays that overlap this month
  const weeks: WeekCell[] = [];
  let cursor = isoWeekMonday(monthStart);
  while (cursor <= monthEnd) {
    const weekEnd = new Date(cursor);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weeks.push({
      isoWeek:   getISOWeekNumber(cursor),
      weekStart: new Date(cursor),
      weekEnd,
      column:    weeks.length + 2, // +2: col 1 = label, cols 2+ = weeks
    });
    cursor = new Date(cursor);
    cursor.setDate(cursor.getDate() + 7);
  }

  // For each event, determine its presence in this month at week granularity
  const bars: Omit<WeekEventBar, 'rowOffset'>[] = [];
  const dotsByColumn = new Map<number, string[]>(); // column → eventIds

  events.forEach(event => {
    if (!visibleCategoryIds.has(event.categoryId)) return;

    const eStart = new Date(event.start); eStart.setHours(0, 0, 0, 0);
    const eEnd   = new Date(event.end);   eEnd.setHours(0, 0, 0, 0);

    if (eStart > monthEnd || eEnd < monthStart) return;

    // Which week cells does this event touch within this month?
    const touchedWeeks = weeks.filter(w => eStart <= w.weekEnd && eEnd >= w.weekStart);
    if (touchedWeeks.length === 0) return;

    // Sub-week event (fits entirely within one week cell) → dot
    if (touchedWeeks.length === 1) {
      const col = touchedWeeks[0].column;
      if (!dotsByColumn.has(col)) dotsByColumn.set(col, []);
      dotsByColumn.get(col)!.push(event.id);
      return;
    }

    // Multi-week → bar
    const startCol = touchedWeeks[0].column;
    const endCol   = touchedWeeks[touchedWeeks.length - 1].column + 1; // exclusive

    bars.push({
      kind: 'bar',
      eventId: event.id,
      startColumn: startCol,
      endColumn:   endCol,
      isStartContinuation: eStart < monthStart,
      isEndContinuation:   eEnd   > monthEnd,
    });
  });

  // Greedy stacking for bars (same pattern as getMonthSpans)
  const positionedBars: WeekEventBar[] = [];
  const rows: Array<Array<{ start: number; end: number }>> = [];

  const globalBars = bars.filter(b => globalRowOffsets.has(b.eventId));
  const localBars  = bars.filter(b => !globalRowOffsets.has(b.eventId));

  globalBars.forEach(bar => {
    const rowIndex = globalRowOffsets.get(bar.eventId)!;
    if (!rows[rowIndex]) rows[rowIndex] = [];
    rows[rowIndex].push({ start: bar.startColumn, end: bar.endColumn });
    positionedBars.push({ ...bar, rowOffset: rowIndex });
  });

  [...localBars]
    .sort((a, b) => a.startColumn !== b.startColumn
      ? a.startColumn - b.startColumn
      : (b.endColumn - b.startColumn) - (a.endColumn - a.startColumn))
    .forEach(bar => {
      let rowIndex = 0;
      while (true) {
        if (!rows[rowIndex]) rows[rowIndex] = [];
        const conflict = rows[rowIndex].some(
          r => bar.startColumn < r.end && bar.endColumn > r.start
        );
        if (!conflict) {
          rows[rowIndex].push({ start: bar.startColumn, end: bar.endColumn });
          positionedBars.push({ ...bar, rowOffset: rowIndex });
          break;
        }
        rowIndex++;
      }
    });

  // Build dot spans with per-column index for vertical stacking
  const dots: WeekEventDot[] = [];
  dotsByColumn.forEach((eventIds, column) => {
    eventIds.forEach((eventId, i) => {
      dots.push({ kind: 'dot', eventId, column, dotIndex: i });
    });
  });

  return { weeks, spans: [...positionedBars, ...dots] };
};

// Returns all ISO weeks for the year (weeks whose Thursday falls in `year`), plus event spans.
export const getYearWeekViewData = (
  events: any[],
  year: number,
  visibleCategoryIds: Set<string>,
  globalRowOffsets: Map<string, number> = new Map()
): WeekViewMonth => {
  const yearStart = new Date(year, 0, 1);
  const yearEnd   = new Date(year, 11, 31);

  // ISO week 1 is the week whose Thursday is Jan 4 or later
  const weeks: WeekCell[] = [];
  let cursor = isoWeekMonday(new Date(year, 0, 4));
  while (true) {
    const thursday = new Date(cursor);
    thursday.setDate(thursday.getDate() + 3);
    if (thursday.getFullYear() !== year) break;
    const weekEnd = new Date(cursor);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weeks.push({
      isoWeek:   getISOWeekNumber(cursor),
      weekStart: new Date(cursor),
      weekEnd,
      column:    weeks.length + 2, // col 1 = label, cols 2+ = weeks
    });
    cursor = new Date(cursor);
    cursor.setDate(cursor.getDate() + 7);
  }

  const bars: Omit<WeekEventBar, 'rowOffset'>[] = [];
  const dotsByColumn = new Map<number, Array<{ eventId: string; durationDays: number }>>();

  events.forEach(event => {
    if (!visibleCategoryIds.has(event.categoryId)) return;
    const eStart = new Date(event.start); eStart.setHours(0, 0, 0, 0);
    const eEnd   = new Date(event.end);   eEnd.setHours(0, 0, 0, 0);
    if (eStart > yearEnd || eEnd < yearStart) return;

    const touchedWeeks = weeks.filter(w => eStart <= w.weekEnd && eEnd >= w.weekStart);
    if (touchedWeeks.length === 0) return;

    if (touchedWeeks.length === 1) {
      const col = touchedWeeks[0].column;
      if (!dotsByColumn.has(col)) dotsByColumn.set(col, []);
      const durationDays = Math.round((eEnd.getTime() - eStart.getTime()) / 86400000);
      dotsByColumn.get(col)!.push({ eventId: event.id, durationDays });
      return;
    }

    bars.push({
      kind: 'bar',
      eventId: event.id,
      startColumn: touchedWeeks[0].column,
      endColumn:   touchedWeeks[touchedWeeks.length - 1].column + 1,
      isStartContinuation: eStart < weeks[0].weekStart,
      isEndContinuation:   eEnd   > weeks[weeks.length - 1].weekEnd,
    });
  });

  const positionedBars: WeekEventBar[] = [];
  const rows: Array<Array<{ start: number; end: number }>> = [];

  // Compact global row offsets to only the rows that actually appear in this year,
  // preventing sparse gaps (e.g. rows 0, 5, 10) from inflating the view height.
  const globalBars = bars.filter(b => globalRowOffsets.has(b.eventId));
  const localBars  = bars.filter(b => !globalRowOffsets.has(b.eventId));

  const usedGlobalOffsets = [...new Set(globalBars.map(b => globalRowOffsets.get(b.eventId)!))]
    .sort((a, b) => a - b);
  const compactedOffset = new Map(usedGlobalOffsets.map((orig, i) => [orig, i]));

  globalBars.forEach(bar => {
    const rowIndex = compactedOffset.get(globalRowOffsets.get(bar.eventId)!)!;
    if (!rows[rowIndex]) rows[rowIndex] = [];
    rows[rowIndex].push({ start: bar.startColumn, end: bar.endColumn });
    positionedBars.push({ ...bar, rowOffset: rowIndex });
  });

  [...localBars]
    .sort((a, b) => a.startColumn !== b.startColumn
      ? a.startColumn - b.startColumn
      : (b.endColumn - b.startColumn) - (a.endColumn - a.startColumn))
    .forEach(bar => {
      let rowIndex = 0;
      while (true) {
        if (!rows[rowIndex]) rows[rowIndex] = [];
        const conflict = rows[rowIndex].some(
          r => bar.startColumn < r.end && bar.endColumn > r.start
        );
        if (!conflict) {
          rows[rowIndex].push({ start: bar.startColumn, end: bar.endColumn });
          positionedBars.push({ ...bar, rowOffset: rowIndex });
          break;
        }
        rowIndex++;
      }
    });

  const dots: WeekEventDot[] = [];
  dotsByColumn.forEach((items, column) => {
    items.forEach(({ eventId, durationDays }, i) => {
      dots.push({ kind: durationDays >= 1 ? 'pill' : 'dot', eventId, column, dotIndex: i });
    });
  });

  return { weeks, spans: [...positionedBars, ...dots] };
};

export interface MonthViewBar {
  kind: 'bar';
  eventId: string;
  startColumn: number; // 1-based month column (Jan=1 … Dec=12), offset by label col
  endColumn: number;   // exclusive
  rowOffset: number;
  isStartContinuation: boolean;
  isEndContinuation: boolean;
}

export interface MonthViewIndicator {
  // Per-category summary inside a single month cell
  categoryId: string;
  hasDot:  boolean; // any event < 7 days in this month
  hasPill: boolean; // any event ≥ 7 days that doesn't cross month boundary
}

export interface MonthViewData {
  // One entry per month (index 0–11)
  cells: Array<{ indicators: MonthViewIndicator[] }>;
  bars: MonthViewBar[];
}

export const getMonthViewData = (
  events: any[],
  year: number,
  visibleCategoryIds: Set<string>,
  globalRowOffsets: Map<string, number> = new Map()
): MonthViewData => {
  const cells: Array<{ indicators: MonthViewIndicator[] }> = Array.from({ length: 12 }, () => ({ indicators: [] }));

  // Per-month, per-category accumulator
  const dotCategories:  Array<Set<string>> = Array.from({ length: 12 }, () => new Set());
  const pillCategories: Array<Set<string>> = Array.from({ length: 12 }, () => new Set());
  const barCandidates: Omit<MonthViewBar, 'rowOffset'>[] = [];

  events.forEach(event => {
    if (!visibleCategoryIds.has(event.categoryId)) return;

    const eStart = new Date(event.start); eStart.setHours(0, 0, 0, 0);
    const eEnd   = new Date(event.end);   eEnd.setHours(0, 0, 0, 0);

    const durationDays = Math.round((eEnd.getTime() - eStart.getTime()) / 86400000);
    const crossesMonthBoundary = eStart.getMonth() !== eEnd.getMonth() || eStart.getFullYear() !== eEnd.getFullYear();

    if (crossesMonthBoundary) {
      // Multi-month → bar spanning month columns
      // Clamp to the current year
      const yearStart = new Date(year, 0, 1);
      const yearEnd   = new Date(year, 11, 31);
      if (eStart > yearEnd || eEnd < yearStart) return;

      const startMonth = eStart < yearStart ? 0 : eStart.getMonth();
      const endMonth   = eEnd   > yearEnd   ? 11 : eEnd.getMonth();

      barCandidates.push({
        kind: 'bar',
        eventId: event.id,
        startColumn: startMonth + 2, // +2: col 1 = label
        endColumn:   endMonth   + 3, // exclusive
        isStartContinuation: eStart < yearStart,
        isEndContinuation:   eEnd   > yearEnd,
      });
    } else {
      // Single-month — determine which month and whether dot or pill
      if (eStart.getFullYear() !== year) return;
      const m = eStart.getMonth();
      if (durationDays < 7) {
        dotCategories[m].add(event.categoryId);
      } else {
        pillCategories[m].add(event.categoryId);
      }
    }
  });

  // Build per-cell indicator lists (union of dot + pill category sets)
  for (let m = 0; m < 12; m++) {
    const allCats = new Set([...dotCategories[m], ...pillCategories[m]]);
    allCats.forEach(catId => {
      cells[m].indicators.push({
        categoryId: catId,
        hasDot:  dotCategories[m].has(catId),
        hasPill: pillCategories[m].has(catId),
      });
    });
  }

  // Greedy stacking for bars
  const bars: MonthViewBar[] = [];
  const rows: Array<Array<{ start: number; end: number }>> = [];

  const globalBars = barCandidates.filter(b => globalRowOffsets.has(b.eventId));
  const localBars  = barCandidates.filter(b => !globalRowOffsets.has(b.eventId));

  globalBars.forEach(bar => {
    const rowIndex = globalRowOffsets.get(bar.eventId)!;
    if (!rows[rowIndex]) rows[rowIndex] = [];
    rows[rowIndex].push({ start: bar.startColumn, end: bar.endColumn });
    bars.push({ ...bar, rowOffset: rowIndex });
  });

  [...localBars]
    .sort((a, b) => a.startColumn !== b.startColumn
      ? a.startColumn - b.startColumn
      : (b.endColumn - b.startColumn) - (a.endColumn - a.startColumn))
    .forEach(bar => {
      let rowIndex = 0;
      while (true) {
        if (!rows[rowIndex]) rows[rowIndex] = [];
        const conflict = rows[rowIndex].some(r => bar.startColumn < r.end && bar.endColumn > r.start);
        if (!conflict) {
          rows[rowIndex].push({ start: bar.startColumn, end: bar.endColumn });
          bars.push({ ...bar, rowOffset: rowIndex });
          break;
        }
        rowIndex++;
      }
    });

  return { cells, bars };
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
