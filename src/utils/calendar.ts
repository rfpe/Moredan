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
    months.push({
      name: new Date(year, m).toLocaleString('default', { month: 'long' }),
      daysInMonth,
      firstDay,
      index: m
    });
  }
  return months;
};
