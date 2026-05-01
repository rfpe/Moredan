export const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

export const generateYearData = (year: number) => {
  const months = [];
  for (let m = 0; m < 12; m++) {
    const daysInMonth = getDaysInMonth(year, m);
    const firstDay = getFirstDayOfMonth(year, m);
    const name = new Date(year, m).toLocaleString('default', { month: 'short' });
    
    const days = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, m, d);
      const dayOfWeek = date.getDay();
      days.push({
        dayNumber: d,
        weekday: date.toLocaleString('default', { weekday: 'narrow' }),
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

export const getMonthSpans = (
  events: any[],
  monthIndex: number,
  year: number,
  visibleCategoryIds: Set<string>
): EventSpan[] => {
  const monthStart = new Date(year, monthIndex, 1);
  const monthEnd = new Date(year, monthIndex + 1, 0);
  const daysInMonth = monthEnd.getDate();

  // 1. Filter and project events onto this month
  const spans: Omit<EventSpan, 'rowOffset'>[] = [];
  
  events.forEach(event => {
    if (!visibleCategoryIds.has(event.categoryId)) return;

    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    
    // Normalize to start of day for comparison
    eventStart.setHours(0, 0, 0, 0);
    eventEnd.setHours(0, 0, 0, 0);

    // Check if event overlaps with this month
    if (eventStart <= monthEnd && eventEnd >= monthStart) {
      const startDay = eventStart < monthStart ? 1 : eventStart.getDate();
      const endDay = eventEnd > monthEnd ? daysInMonth : eventEnd.getDate();

      spans.push({
        eventId: event.id,
        startColumn: startDay + 1, // +1 for month label column
        endColumn: endDay + 2,   // grid end is exclusive, +1 for label, +1 for inclusive day
        isStartContinuation: eventStart < monthStart,
        isEndContinuation: eventEnd > monthEnd
      });
    }
  });

  // 2. Greedy Stacking
  // Sort by start column then duration (longer first)
  const sortedSpans = [...spans].sort((a, b) => {
    if (a.startColumn !== b.startColumn) return a.startColumn - b.startColumn;
    return (b.endColumn - b.startColumn) - (a.endColumn - a.startColumn);
  });

  const positionedSpans: EventSpan[] = [];
  const rows: number[][] = []; // Array of end positions per row

  sortedSpans.forEach(span => {
    let rowIndex = 0;
    while (true) {
      if (!rows[rowIndex]) rows[rowIndex] = [];
      
      // Check if this row is free for the span's duration
      const hasConflict = rows[rowIndex].some(rowEnd => span.startColumn < rowEnd);
      
      if (!hasConflict) {
        rows[rowIndex].push(span.endColumn);
        positionedSpans.push({ ...span, rowOffset: rowIndex });
        break;
      }
      rowIndex++;
    }
  });

  return positionedSpans;
};
