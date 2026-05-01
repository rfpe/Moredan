import type { Category, CalendarEvent } from '../types';

const CAT_WORK     = 'demo-cat-work';
const CAT_PERSONAL = 'demo-cat-personal';
const CAT_URGENT   = 'demo-cat-urgent';
const CAT_TRAVEL   = 'demo-cat-travel';
const CAT_HEALTH   = 'demo-cat-health';

export const DEMO_CATEGORIES: Category[] = [
  { id: CAT_WORK,     name: 'Work',     color: '#3b82f6' },
  { id: CAT_PERSONAL, name: 'Personal', color: '#10b981' },
  { id: CAT_URGENT,   name: 'Urgent',   color: '#ef4444' },
  { id: CAT_TRAVEL,   name: 'Travel',   color: '#f59e0b' },
  { id: CAT_HEALTH,   name: 'Health',   color: '#8b5cf6' },
];

const d = (year: number, month: number, day: number) =>
  new Date(year, month - 1, day);

export const generateDemoEvents = (year: number): CalendarEvent[] => [
  // January
  { id: 'demo-01', name: 'Team standup',                              categoryId: CAT_WORK,     start: d(year,1,5),  end: d(year,1,5)  },
  { id: 'demo-02', name: '🏖️ Beach vacation',                         categoryId: CAT_TRAVEL,   start: d(year,1,15), end: d(year,2,3)  },
  { id: 'demo-03', name: '💊 Doctor checkup',                          categoryId: CAT_HEALTH,   start: d(year,1,22), end: d(year,1,22) },

  // February
  { id: 'demo-04', name: 'Q1 Planning & Budgeting Review',             categoryId: CAT_WORK,     start: d(year,2,2),  end: d(year,2,6)  },
  { id: 'demo-05', name: "🎂 Mom's Birthday",                          categoryId: CAT_PERSONAL, start: d(year,2,14), end: d(year,2,14) },

  // March
  { id: 'demo-06', name: '✈️ Conference trip',                         categoryId: CAT_TRAVEL,   start: d(year,3,10), end: d(year,3,15) },
  { id: 'demo-07', name: '🚨 Server migration',                        categoryId: CAT_URGENT,   start: d(year,3,20), end: d(year,3,20) },

  // April — full month
  { id: 'demo-08', name: 'Annual performance reviews',                 categoryId: CAT_WORK,     start: d(year,4,1),  end: d(year,4,30) },

  // April–June — multi-month
  { id: 'demo-09', name: '🏃 Marathon training',                       categoryId: CAT_HEALTH,   start: d(year,4,10), end: d(year,6,20) },

  // May
  { id: 'demo-10', name: '🏠 Home renovation',                         categoryId: CAT_PERSONAL, start: d(year,5,5),  end: d(year,5,25) },
  { id: 'demo-11', name: '⚠️ Tax deadline',                            categoryId: CAT_URGENT,   start: d(year,5,31), end: d(year,5,31) },

  // June–August — long multi-month
  { id: 'demo-12', name: 'Summer internship program',                  categoryId: CAT_WORK,     start: d(year,6,1),  end: d(year,8,31) },

  // July
  { id: 'demo-13', name: '🌍 Europe trip',                             categoryId: CAT_TRAVEL,   start: d(year,7,4),  end: d(year,7,18) },
  { id: 'demo-14', name: '👨‍👩‍👧‍👦 Family reunion',                          categoryId: CAT_PERSONAL, start: d(year,7,25), end: d(year,7,27) },

  // August
  { id: 'demo-15', name: 'Back to school prep',                        categoryId: CAT_PERSONAL, start: d(year,8,20), end: d(year,8,31) },

  // September
  { id: 'demo-16', name: '🚨 Product launch deadline',                 categoryId: CAT_URGENT,   start: d(year,9,1),  end: d(year,9,1)  },
  { id: 'demo-17', name: 'Q3 Strategy offsite',                        categoryId: CAT_WORK,     start: d(year,9,8),  end: d(year,9,10) },

  // October
  { id: 'demo-18', name: 'Annual health screening',                    categoryId: CAT_HEALTH,   start: d(year,10,5), end: d(year,10,5) },
  { id: 'demo-19', name: '🎃 Halloween party planning',                categoryId: CAT_PERSONAL, start: d(year,10,28),end: d(year,10,31)},

  // November — full month
  { id: 'demo-20', name: 'Year-end financial audit',                   categoryId: CAT_WORK,     start: d(year,11,1), end: d(year,11,30)},

  // December
  { id: 'demo-21', name: '🎁 Gift shopping',                           categoryId: CAT_PERSONAL, start: d(year,12,1), end: d(year,12,24)},
  { id: 'demo-22', name: '⚠️ Critical bug fix sprint',                 categoryId: CAT_URGENT,   start: d(year,12,10),end: d(year,12,12)},
  { id: 'demo-23', name: '✈️ Holiday travel',                          categoryId: CAT_TRAVEL,   start: d(year,12,20),end: d(year,12,31)},
];
