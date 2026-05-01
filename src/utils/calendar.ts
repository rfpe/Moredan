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
