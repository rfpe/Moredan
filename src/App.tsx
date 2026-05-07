import { useState, useMemo, useEffect, useRef } from 'react';
import './App.css'
import { generateYearData, getMonthSpans, getWeekStart, getMonthOffset, getISOWeekNumber, computeGlobalRowOffsets, getWeekViewData, getYearWeekViewData, getMonthViewData, type EventSpan, type WeekEventBar, type WeekEventDot } from './utils/calendar';
import { DEMO_CATEGORIES, generateDemoEvents } from './utils/demoData';
import { type Category, type CalendarEvent } from './types';
import { getTranslations } from './i18n';
import Modal from './components/Modal';
import EventForm from './components/EventForm';
import CategoryForm from './components/CategoryForm';
import SettingsModal from './components/SettingsModal';
import CellOverlay from './components/CellOverlay';

function App() {
  const [currentYear, setCurrentYear] = useState(() => {
    const saved = localStorage.getItem('moredan_current_year');
    return saved ? parseInt(saved, 10) : 2026;
  });

  const [locale, setLocale] = useState<string>(() => {
    return localStorage.getItem('moredan_locale') ?? navigator.language;
  });

  const [weekdayAlign, setWeekdayAlign] = useState<boolean>(() => {
    return localStorage.getItem('moredan_weekday_align') === 'true';
  });

  const [showWeekNumbers, setShowWeekNumbers] = useState<boolean>(() => {
    return localStorage.getItem('moredan_show_week_numbers') === 'true';
  });

  const weekStart = useMemo(() => getWeekStart(locale), [locale]);
  const yearData     = useMemo(() => generateYearData(currentYear,     locale), [currentYear, locale]);
  const prevYearData = useMemo(() => generateYearData(currentYear - 1, locale), [currentYear, locale]);
  const nextYearData = useMemo(() => generateYearData(currentYear + 1, locale), [currentYear, locale]);
  const t = useMemo(() => getTranslations(locale), [locale]);

  const [windowWidth, setWindowWidth] = useState(() => window.innerWidth);
  useEffect(() => {
    const handler = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  const narrowWeekday = windowWidth <= 1300;

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('moredan_categories');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Work', color: '#3b82f6' },
      { id: '2', name: 'Personal', color: '#10b981' },
      { id: '3', name: 'Urgent', color: '#ef4444' },
    ];
  });

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('moredan_events');
    if (saved) {
      return JSON.parse(saved).map((e: any) => ({
        ...e,
        start: new Date(e.start),
        end: new Date(e.end)
      }));
    }
    return [];
  });

  const [visibleCategories, setVisibleCategories] = useState<Set<string>>(new Set(categories.map(c => c.id)));

  const globalRowOffsets = useMemo(
    () => computeGlobalRowOffsets(events, visibleCategories),
    [events, visibleCategories]
  );

  // ── Drag state ──────────────────────────────────────────────────────────────
  const dragStateRef = useRef<{
    eventId: string;
    calendarEvent: CalendarEvent;
    durationMs: number;
    clickOffsetDays: number;
    previewStart: Date | null;
    previewEnd: Date | null;
  } | null>(null);
  const dragOccurredRef = useRef(false);
  const [dragEventId, setDragEventId] = useState<string | null>(null);
  const [dragPreview, setDragPreview] = useState<{
    eventId: string; newStart: Date; newEnd: Date;
  } | null>(null);

  // Swap the dragging event's dates for preview dates so getMonthSpans
  // re-renders the bar at its new position on every mousemove.
  const effectiveEvents = useMemo(() => {
    if (!dragPreview) return events;
    return events.map(e =>
      e.id === dragPreview.eventId
        ? { ...e, start: dragPreview.newStart, end: dragPreview.newEnd }
        : e
    );
  }, [events, dragPreview]);

  const VIEW_MODES = ['day', 'week', 'yearweek', 'month', 'vertical'] as const;
  type ViewMode = typeof VIEW_MODES[number];

  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    window.innerWidth <= 768 ? 'week' : 'day'
  );
  const userOverrodeViewRef = useRef(false);

  useEffect(() => {
    if (userOverrodeViewRef.current) return;
    setViewMode(windowWidth <= 768 ? 'week' : 'day');
  }, [windowWidth]);

  const zoomIn = () => {
    const idx = VIEW_MODES.indexOf(viewMode);
    if (idx > 0) { userOverrodeViewRef.current = true; setViewMode(VIEW_MODES[idx - 1]); }
  };
  const zoomOut = () => {
    const idx = VIEW_MODES.indexOf(viewMode);
    if (idx < VIEW_MODES.length - 1) { userOverrodeViewRef.current = true; setViewMode(VIEW_MODES[idx + 1]); }
  };

  // ── Vertical layout spans ────────────────────────────────────────────────
  type VerticalSpan = {
    eventId: string;
    monthIndex: number;
    dayStart: number;
    dayEnd: number;
    stackCol: number;
    isStartCont: boolean;
    isEndCont: boolean;
  };

  const verticalSpans = useMemo((): VerticalSpan[] => {
    if (viewMode !== 'vertical') return [];
    const result: VerticalSpan[] = [];
    for (let m = 0; m < 12; m++) {
      const monthStart = new Date(currentYear, m, 1);
      monthStart.setHours(0, 0, 0, 0);
      const daysInMonth = new Date(currentYear, m + 1, 0).getDate();
      const monthEnd = new Date(currentYear, m, daysInMonth);
      monthEnd.setHours(23, 59, 59, 999);

      const monthEvents = effectiveEvents
        .filter(e => {
          if (!visibleCategories.has(e.categoryId)) return false;
          const s = new Date(e.start); s.setHours(0, 0, 0, 0);
          const en = new Date(e.end); en.setHours(23, 59, 59, 999);
          return s <= monthEnd && en >= monthStart;
        })
        .sort((a, b) => a.start.getTime() - b.start.getTime());

      const slots: { dayStart: number; dayEnd: number }[][] = [];

      for (const event of monthEvents) {
        const s = new Date(event.start); s.setHours(0, 0, 0, 0);
        const en = new Date(event.end); en.setHours(0, 0, 0, 0);
        const isStartCont = s < monthStart;
        const isEndCont = en > monthEnd;
        const dayStart = isStartCont ? 1 : s.getDate();
        const dayEnd = isEndCont ? daysInMonth : en.getDate();

        let stackCol = 0;
        while (true) {
          if (!slots[stackCol]) { slots[stackCol] = []; break; }
          if (!slots[stackCol].some(sl => dayStart <= sl.dayEnd && dayEnd >= sl.dayStart)) break;
          stackCol++;
        }
        slots[stackCol] ??= [];
        slots[stackCol].push({ dayStart, dayEnd });
        result.push({ eventId: event.id, monthIndex: m, dayStart, dayEnd, stackCol, isStartCont, isEndCont });
      }
    }
    return result;
  }, [effectiveEvents, visibleCategories, currentYear, viewMode]);

  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const scrollToTodayRef = useRef(false);
  useEffect(() => {
    if (!scrollToTodayRef.current) return;
    scrollToTodayRef.current = false;
    const cell = document.querySelector(
      `[data-month="${today.getMonth()}"][data-day="${today.getDate()}"]`
    ) as HTMLElement | null;
    cell?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [viewMode, currentYear, today]);

  const [showPrevYear, setShowPrevYear] = useState(true);
  const [showNextYear, setShowNextYear] = useState(true);

  const [fontScale, setFontScale] = useState<number>(() =>
    parseFloat(localStorage.getItem('moredan_font_scale') ?? '1')
  );
  useEffect(() => {
    localStorage.setItem('moredan_font_scale', String(fontScale));
  }, [fontScale]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importPreview, setImportPreview] = useState<{
    events: CalendarEvent[];
    newCategories: Array<{ id: string; name: string; color: string }>;
  } | null>(null);

  const handleImportXLSX = async (file: File) => {
    const ExcelJS = (await import('exceljs')).default;
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await file.arrayBuffer());
    const ws = wb.worksheets[0];
    if (!ws) return;

    const newCatMap = new Map<string, string>(); // color -> id
    const newCatList: Array<{ id: string; name: string; color: string }> = [];

    const resolveCategory = (name: string, color: string): string => {
      // Match existing category by name (case-insensitive)
      const existing = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
      if (existing) return existing.id;
      // Match a newly created category for this import by color+name
      const key = `${name}::${color}`;
      if (newCatMap.has(key)) return newCatMap.get(key)!;
      const id = Math.random().toString(36).substr(2, 9);
      newCatMap.set(key, id);
      newCatList.push({ id, name: name || 'Uncategorized', color: color || '#94a3b8' });
      return id;
    };

    const importedEvents: CalendarEvent[] = [];
    ws.eachRow((row, rowNum) => {
      if (rowNum === 1) return; // skip header
      const name      = String(row.getCell(1).value ?? '').trim();
      const startRaw  = row.getCell(2).value;
      const endRaw    = row.getCell(3).value;
      const catName   = String(row.getCell(4).value ?? '').trim();
      const catColor  = String(row.getCell(5).value ?? '#94a3b8').trim();
      if (!name) return;
      // ExcelJS Date objects are UTC midnight; extract UTC parts to avoid
      // local-timezone day shift. String dates like "2026-05-15" are also
      // parsed as UTC by new Date(), so same treatment applies.
      const parseXlsxDate = (raw: unknown): Date | null => {
        let d: Date;
        if (raw instanceof Date) {
          d = new Date(raw.getUTCFullYear(), raw.getUTCMonth(), raw.getUTCDate());
        } else {
          const str = String(raw).trim();
          const parts = str.split('-').map(Number);
          if (parts.length === 3 && parts.every(n => !isNaN(n))) {
            d = new Date(parts[0], parts[1] - 1, parts[2]);
          } else {
            d = new Date(str);
            if (isNaN(d.getTime())) return null;
            d = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
          }
        }
        d.setHours(0, 0, 0, 0);
        return d;
      };
      const start = parseXlsxDate(startRaw);
      const end   = parseXlsxDate(endRaw);
      if (!start || !end) return;
      const categoryId = resolveCategory(catName, catColor);
      importedEvents.push({ id: Math.random().toString(36).substr(2, 9), name, start, end, categoryId });
    });

    if (importedEvents.length === 0) return;
    setImportPreview({ events: importedEvents, newCategories: newCatList });
  };

  const commitImport = () => {
    if (!importPreview) return;
    const { events: newEvents, newCategories } = importPreview;
    if (newCategories.length > 0) {
      setCategories(prev => [...prev, ...newCategories]);
      setVisibleCategories(prev => new Set([...prev, ...newCategories.map(c => c.id)]));
    }
    setEvents(prev => [...prev, ...newEvents]);
    setImportPreview(null);
  };

  const [cellOverlay, setCellOverlay] = useState<{
    label: string;
    events: CalendarEvent[];
    prefillDate?: string;
    position: { top: number; left: number };
  } | null>(null);

  const openCellOverlay = (
    label: string,
    events: CalendarEvent[],
    anchorEl: HTMLElement,
    prefillDate?: string
  ) => {
    const rect = anchorEl.getBoundingClientRect();
    setCellOverlay({ label, events, prefillDate, position: { top: rect.bottom + 4, left: rect.left } });
  };

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [prefillDate, setPrefillDate] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('moredan_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('moredan_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('moredan_current_year', currentYear.toString());
  }, [currentYear]);

  useEffect(() => {
    localStorage.setItem('moredan_locale', locale);
  }, [locale]);

  useEffect(() => {
    localStorage.setItem('moredan_weekday_align', String(weekdayAlign));
  }, [weekdayAlign]);

  useEffect(() => {
    localStorage.setItem('moredan_show_week_numbers', String(showWeekNumbers));
  }, [showWeekNumbers]);

  const handleClearData = () => {
    if (!window.confirm('Clear all events and reset categories to defaults?')) return;
    setEvents([]);
    setCategories([
      { id: '1', name: 'Work', color: '#3b82f6' },
      { id: '2', name: 'Personal', color: '#10b981' },
      { id: '3', name: 'Urgent', color: '#ef4444' },
    ]);
    setVisibleCategories(new Set(['1', '2', '3']));
    setIsSettingsModalOpen(false);
  };

  const handleLoadDemoData = () => {
    setCategories(DEMO_CATEGORIES);
    setEvents(generateDemoEvents(currentYear));
    setVisibleCategories(new Set(DEMO_CATEGORIES.map(c => c.id)));
    setIsSettingsModalOpen(false);
  };

  // Format a Date using local calendar date, avoiding UTC-offset day shift.
  const localDateStr = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const handleExportXLSX = async () => {
    const ExcelJS = (await import('exceljs')).default;
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Events');
    ws.columns = [
      { header: 'Name',      key: 'name',     width: 32 },
      { header: 'Start Date',key: 'start',    width: 12 },
      { header: 'End Date',  key: 'end',      width: 12 },
      { header: 'Category',  key: 'category', width: 16 },
      { header: 'Color',     key: 'color',    width: 10 },
    ];
    events.forEach(e => {
      const cat = categories.find(c => c.id === e.categoryId);
      ws.addRow({
        name:     e.name,
        start:    localDateStr(e.start),
        end:      localDateStr(e.end),
        category: cat?.name ?? '',
        color:    cat?.color ?? '',
      });
    });
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moredan-${currentYear}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleCategory = (id: string) => {
    const newVisible = new Set(visibleCategories);
    if (newVisible.has(id)) {
      newVisible.delete(id);
    } else {
      newVisible.add(id);
    }
    setVisibleCategories(newVisible);
  };

  const openAddEvent = (date?: string) => {
    setEditingEvent(null);
    setPrefillDate(date ?? null);
    setIsEventModalOpen(true);
  };

  const openEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setPrefillDate(null);
    setIsEventModalOpen(true);
  };

  const closeEventModal = () => {
    setIsEventModalOpen(false);
    setEditingEvent(null);
    setPrefillDate(null);
  };

  const handleAddEvent = (eventData: Omit<CalendarEvent, 'id'> & { id?: string }) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: Math.random().toString(36).substr(2, 9),
    };
    setEvents(prev => [...prev, newEvent]);
    closeEventModal();
  };

  const handleUpdateEvent = (eventData: Omit<CalendarEvent, 'id'> & { id?: string }) => {
    if (!eventData.id) return;
    setEvents(prev => prev.map(e => e.id === eventData.id ? { ...eventData, id: eventData.id! } : e));
    closeEventModal();
  };

  const handleSubmitEvent = (eventData: Omit<CalendarEvent, 'id'> & { id?: string }) => {
    if (eventData.id) {
      handleUpdateEvent(eventData);
    } else {
      handleAddEvent(eventData);
    }
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    closeEventModal();
  };

  const handleAddCategory = (catData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...catData,
      id: Math.random().toString(36).substr(2, 9),
    };
    setCategories(prev => [...prev, newCat]);
    setVisibleCategories(prev => new Set([...prev, newCat.id]));
  };

  const handleEditCategory = (id: string, data: Omit<Category, 'id'>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const handleDeleteCategory = (id: string, reassign: boolean) => {
    if (categories.length <= 1) return;
    if (reassign) {
      const UNCAT_ID = 'uncategorized';
      const hasUncat = categories.some(c => c.id === UNCAT_ID);
      if (!hasUncat) {
        setCategories(prev => [
          ...prev.filter(c => c.id !== id),
          { id: UNCAT_ID, name: 'Uncategorized', color: '#94a3b8' },
        ]);
        setVisibleCategories(prev => {
          const next = new Set(prev);
          next.delete(id);
          next.add(UNCAT_ID);
          return next;
        });
      } else {
        setCategories(prev => prev.filter(c => c.id !== id));
        setVisibleCategories(prev => {
          const next = new Set(prev);
          next.delete(id);
          next.add(UNCAT_ID);
          return next;
        });
      }
      setEvents(prev => prev.map(e => e.categoryId === id ? { ...e, categoryId: UNCAT_ID } : e));
    } else {
      setCategories(prev => prev.filter(c => c.id !== id));
      setEvents(prev => prev.filter(e => e.categoryId !== id));
      setVisibleCategories(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleReorderCategory = (id: string, direction: 'up' | 'down') => {
    setCategories(prev => {
      const idx = prev.findIndex(c => c.id === id);
      if (idx < 0) return prev;
      if (direction === 'up' && idx === 0) return prev;
      if (direction === 'down' && idx === prev.length - 1) return prev;
      const next = [...prev];
      const swap = direction === 'up' ? idx - 1 : idx + 1;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  };

  // Attach / detach document-level drag listeners whenever a drag session starts.
  useEffect(() => {
    if (!dragEventId) return;
    document.body.classList.add('drag-active');

    const onMouseMove = (e: MouseEvent) => {
      if (!dragStateRef.current) return;
      dragOccurredRef.current = true;

      // pointer-events:none is set on all bars via body.drag-active, so
      // elementFromPoint reaches the day cell underneath.
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const cell = el?.closest('[data-day]') as HTMLElement | null;
      if (!cell) return;

      const monthIdx = parseInt(cell.dataset.month ?? '0');
      const dayNum   = parseInt(cell.dataset.day   ?? '1');
      const { eventId, durationMs, clickOffsetDays } = dragStateRef.current;

      const hoveredDate = new Date(currentYear, monthIdx, dayNum);
      const newStart = new Date(hoveredDate.getTime() - clickOffsetDays * 86400000);
      const newEnd   = new Date(newStart.getTime() + durationMs);

      // Don't let the event leave the current year.
      if (newStart < new Date(currentYear, 0, 1) || newEnd > new Date(currentYear, 11, 31)) return;

      dragStateRef.current.previewStart = newStart;
      dragStateRef.current.previewEnd   = newEnd;
      setDragPreview({ eventId, newStart, newEnd });
    };

    const onMouseUp = () => {
      document.body.classList.remove('drag-active');
      if (!dragOccurredRef.current && dragStateRef.current) {
        openEditEvent(dragStateRef.current.calendarEvent);
      } else if (dragStateRef.current?.previewStart && dragStateRef.current?.previewEnd) {
        const { eventId, previewStart, previewEnd } = dragStateRef.current;
        setEvents(prev => prev.map(e =>
          e.id === eventId ? { ...e, start: previewStart!, end: previewEnd! } : e
        ));
      }
      dragStateRef.current = null;
      setDragEventId(null);
      setDragPreview(null);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup',   onMouseUp);
    return () => {
      document.body.classList.remove('drag-active');
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup',   onMouseUp);
    };
  }, [dragEventId, currentYear]);

  const handleBarMouseDown = (
    e: React.MouseEvent,
    event: CalendarEvent,
    span: EventSpan,
    monthIndex: number
  ) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    const eventStart = new Date(event.start); eventStart.setHours(0, 0, 0, 0);
    const eventEnd   = new Date(event.end);   eventEnd.setHours(0, 0, 0, 0);
    const durationMs = eventEnd.getTime() - eventStart.getTime();

    // Figure out which day inside the bar the user clicked, so the bar follows
    // the cursor at the same relative position rather than snapping to day 1.
    const barRect    = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const relX       = Math.max(0, e.clientX - barRect.left);
    const daysInMonth  = new Date(currentYear, monthIndex + 1, 0).getDate();
    const barStartDay  = span.isStartContinuation ? 1 : eventStart.getDate();
    const barEndDay    = span.isEndContinuation   ? daysInMonth : eventEnd.getDate();
    const barDays      = Math.max(1, barEndDay - barStartDay + 1);
    const dayIndexInBar   = Math.floor((relX / barRect.width) * barDays);
    const clickedDay      = barStartDay + dayIndexInBar;
    const clickedDate     = new Date(currentYear, monthIndex, clickedDay);
    clickedDate.setHours(0, 0, 0, 0);
    const clickOffsetDays = Math.round(
      (clickedDate.getTime() - eventStart.getTime()) / 86400000
    );

    dragOccurredRef.current = false;
    dragStateRef.current = { eventId: event.id, calendarEvent: event, durationMs, clickOffsetDays, previewStart: null, previewEnd: null };
    setDragEventId(event.id);
  };

  const handleDayCellClick = (monthIndex: number, dayNumber: number, anchorEl: HTMLElement) => {
    const day = new Date(currentYear, monthIndex, dayNumber);
    day.setHours(0, 0, 0, 0);
    const dayEvents = effectiveEvents.filter(e => {
      if (!visibleCategories.has(e.categoryId)) return false;
      const s = new Date(e.start); s.setHours(0, 0, 0, 0);
      const en = new Date(e.end);  en.setHours(0, 0, 0, 0);
      return s <= day && en >= day;
    });
    const m = String(monthIndex + 1).padStart(2, '0');
    const d = String(dayNumber).padStart(2, '0');
    const prefill = `${currentYear}-${m}-${d}`;
    const label = day.toLocaleDateString(locale, { month: 'short', day: 'numeric', weekday: 'short' });
    if (dayEvents.length > 0) {
      openCellOverlay(label, dayEvents, anchorEl, prefill);
    } else {
      openAddEvent(prefill);
    }
  };

  const handleWeekCellClick = (isoWeek: number, weekStart: Date, weekEnd: Date, anchorEl: HTMLElement) => {
    const wStart = new Date(weekStart); wStart.setHours(0, 0, 0, 0);
    const wEnd   = new Date(weekEnd);   wEnd.setHours(0, 0, 0, 0);
    const weekEvents = effectiveEvents.filter(e => {
      if (!visibleCategories.has(e.categoryId)) return false;
      const s = new Date(e.start); s.setHours(0, 0, 0, 0);
      const en = new Date(e.end);  en.setHours(0, 0, 0, 0);
      return s <= wEnd && en >= wStart;
    });
    const label = `W${isoWeek} · ${wStart.toLocaleDateString(locale, { month: 'short', day: 'numeric' })}–${wEnd.toLocaleDateString(locale, { month: 'short', day: 'numeric' })}`;
    const prefill = weekStart.toISOString().split('T')[0];
    openCellOverlay(label, weekEvents, anchorEl, prefill);
  };

  const handleMonthCellClick = (monthIndex: number, anchorEl: HTMLElement) => {
    const mStart = new Date(currentYear, monthIndex, 1);     mStart.setHours(0, 0, 0, 0);
    const mEnd   = new Date(currentYear, monthIndex + 1, 0); mEnd.setHours(0, 0, 0, 0);
    const monthEvents = effectiveEvents.filter(e => {
      if (!visibleCategories.has(e.categoryId)) return false;
      const s = new Date(e.start); s.setHours(0, 0, 0, 0);
      const en = new Date(e.end);  en.setHours(0, 0, 0, 0);
      return s <= mEnd && en >= mStart;
    });
    const label = mStart.toLocaleDateString(locale, { month: 'long' });
    const m = String(monthIndex + 1).padStart(2, '0');
    openCellOverlay(label, monthEvents, anchorEl, `${currentYear}-${m}-01`);
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="title-section">
          <h1>Moredan</h1>
          <div className="year-selector">
            <button onClick={() => setCurrentYear(prev => prev - 1)}>&lt;</button>
            <span>{currentYear}</span>
            <button onClick={() => setCurrentYear(prev => prev + 1)}>&gt;</button>
          </div>
        </div>

        <div className="category-filters">
          {categories.slice(0, 10).map(cat => {
            const isActive = visibleCategories.has(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                className={`category-filter-btn${isActive ? ' active' : ''}`}
                style={isActive
                  ? { backgroundColor: cat.color, borderColor: cat.color, color: '#fff' }
                  : { borderColor: cat.color, color: cat.color }
                }
                onClick={() => toggleCategory(cat.id)}
              >
                {cat.name}
              </button>
            );
          })}
          <div className="category-filter-actions">
            <button
              type="button"
              className="category-bulk-btn"
              onClick={() => {
                const allVisible = categories.every(c => visibleCategories.has(c.id));
                setVisibleCategories(allVisible ? new Set() : new Set(categories.map(c => c.id)));
              }}
            >
              {categories.every(c => visibleCategories.has(c.id)) ? t.none : t.all}
            </button>
          </div>
        </div>

        <div className="controls">
          <div className="font-size-toggle">
            <button
              onClick={() => setFontScale(s => Math.max(0.75, +(s - 0.1).toFixed(1)))}
              disabled={fontScale <= 0.75}
              title="Decrease font size"
            >A-</button>
            <button
              onClick={() => setFontScale(s => Math.min(1.5, +(s + 0.1).toFixed(1)))}
              disabled={fontScale >= 1.5}
              title="Increase font size"
            >A+</button>
          </div>
          <div className="view-toggle">
            <button
              className="view-toggle-btn"
              onClick={zoomIn}
              disabled={viewMode === 'day'}
              title="Zoom in"
            >＋</button>
            <span className="view-toggle-label">{viewMode}</span>
            <button
              className="view-toggle-btn"
              onClick={zoomOut}
              disabled={viewMode === 'vertical'}
              title="Zoom out"
            >－</button>
          </div>
          <button className="secondary-btn" onClick={() => {
            userOverrodeViewRef.current = true;
            setViewMode('day');
            setCurrentYear(today.getFullYear());
            scrollToTodayRef.current = true;
          }}>Today</button>
          <button className="primary-btn" onClick={() => openAddEvent()}>{t.addEvent}</button>
          <button className="secondary-btn" onClick={() => setIsCategoryModalOpen(true)}>{t.categories}</button>
          <button className="secondary-btn" onClick={() => fileInputRef.current?.click()}>{t.importXlsx}</button>
          <button className="secondary-btn" onClick={handleExportXLSX}>{t.exportXlsx}</button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            style={{ display: 'none' }}
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) handleImportXLSX(file);
              e.target.value = '';
            }}
          />
          <button className="icon-btn" onClick={() => setIsSettingsModalOpen(true)} title={t.settings}>⚙</button>
        </div>
      </header>

      <main className="calendar-container" style={{ '--font-scale': fontScale } as React.CSSProperties}>
        {/* ── Month view ────────────────────────────────────────────────────── */}
        {viewMode === 'month' && (() => {
          const renderYearRow = (
            year: number,
            yData: typeof yearData,
            isCollapsed: boolean,
            onToggle: (() => void) | null
          ) => {
            if (isCollapsed) {
              return (
                <div key={year} className="month-row month-row--year-collapsed">
                  <div className="month-label month-label--collapsed">
                    <span>{year}</span>
                    <button className="year-row-toggle" onClick={onToggle!} title="Show year">+</button>
                  </div>
                </div>
              );
            }
            const { cells, bars } = getMonthViewData(effectiveEvents, year, visibleCategories, globalRowOffsets);
            const maxBarOffset = bars.length > 0 ? Math.max(...bars.map(b => b.rowOffset)) : -1;
            const maxIndicatorRows = Math.max(0, ...cells.map(c => c.indicators.length));
            const barsTopOffset = 4 + 16 + maxIndicatorRows * 11 + 6;
            const rowHeight = barsTopOffset + (maxBarOffset + 1) * 22;
            return (
              <div
                key={year}
                className="month-row month-row--year"
                style={{ minHeight: `${rowHeight}px` }}
              >
                <div className="month-label month-label--year">
                  <span>{year}</span>
                  {onToggle && (
                    <button className="year-row-toggle" onClick={onToggle} title="Hide year">×</button>
                  )}
                </div>
                {cells.map((cell, m) => {
                  const monthName = yData[m].name;
                  return (
                    <div key={m} className="month-overview-cell" onClick={(e) => handleMonthCellClick(m, e.currentTarget)}>
                      <span className="month-overview-name">{monthName}</span>
                      <div className="month-overview-indicators">
                        {cell.indicators.map(ind => {
                          const cat = categories.find(c => c.id === ind.categoryId);
                          return (
                            <div key={ind.categoryId} className="month-overview-ind-row">
                              {ind.hasDot && (
                                <div className="event-dot" style={{ backgroundColor: cat?.color }} title={cat?.name} />
                              )}
                              {ind.hasPill && (
                                <div className="event-pill" style={{ backgroundColor: cat?.color }} title={cat?.name} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {bars.map(bar => {
                  const event = effectiveEvents.find(e => e.id === bar.eventId);
                  const category = categories.find(c => c.id === event?.categoryId);
                  return (
                    <div
                      key={bar.eventId}
                      className="event-bar"
                      style={{
                        gridColumnStart: bar.startColumn,
                        gridColumnEnd:   bar.endColumn,
                        gridRow: 1,
                        top: `${barsTopOffset + bar.rowOffset * 22}px`,
                        backgroundColor: category?.color,
                      }}
                      title={event?.name}
                      onClick={() => { if (event) openEditEvent(event); }}
                    >
                      <span className="event-title">{event?.name}</span>
                      {bar.isEndContinuation && (
                        <div className="snake-nub snake-nub--end" style={{ backgroundColor: category?.color }} />
                      )}
                      {bar.isStartContinuation && (
                        <div className="snake-nub snake-nub--start" style={{ backgroundColor: category?.color }} />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          };

          return (
            <>
              {renderYearRow(currentYear - 1, prevYearData, !showPrevYear, () => setShowPrevYear(v => !v))}
              {renderYearRow(currentYear,     yearData,     false,         null)}
              {renderYearRow(currentYear + 1, nextYearData, !showNextYear, () => setShowNextYear(v => !v))}
            </>
          );
        })()}

        {/* ── Week view ─────────────────────────────────────────────────────── */}
        {viewMode === 'week' && yearData.map((month) => {
          const { weeks, spans } = getWeekViewData(effectiveEvents, month.index, currentYear, visibleCategories, globalRowOffsets);
          const bars = spans.filter((s): s is WeekEventBar => s.kind === 'bar');
          const dots = spans.filter((s): s is WeekEventDot => s.kind === 'dot');
          const maxBarOffset = bars.length > 0 ? Math.max(...bars.map(b => b.rowOffset)) : -1;
          const rowHeight = 40 + (maxBarOffset + 1) * 22;

          return (
            <div
              key={month.name}
              className="month-row month-row--week"
              style={{
                minHeight: `${rowHeight}px`,
                gridTemplateColumns: `60px repeat(6, 1fr)`,
              }}
            >
              <div className="month-label">{month.name}</div>

              {/* Week cells */}
              {Array.from({ length: 6 }, (_, i) => {
                const week = weeks[i];
                return week ? (
                  <div
                    key={week.isoWeek}
                    className="week-cell"
                    onClick={(e) => handleWeekCellClick(week.isoWeek, week.weekStart, week.weekEnd, e.currentTarget)}
                  >
                    <span className="week-cell-label">W{week.isoWeek}</span>
                    {/* Dots for sub-week events */}
                    <div className="week-cell-dots">
                      {dots.filter(d => d.column === week.column).map(dot => {
                        const event = effectiveEvents.find(e => e.id === dot.eventId);
                        const category = categories.find(c => c.id === event?.categoryId);
                        return (
                          <div
                            key={dot.eventId}
                            className="event-dot"
                            style={{ backgroundColor: category?.color }}
                            title={event?.name}
                          />
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div key={`filler-${i}`} className="week-cell week-cell--filler" />
                );
              })}

              {/* Bar spans for multi-week events */}
              {bars.map((bar) => {
                const event = effectiveEvents.find(e => e.id === bar.eventId);
                const category = categories.find(c => c.id === event?.categoryId);
                return (
                  <div
                    key={`${month.index}-${bar.eventId}`}
                    className="event-bar"
                    style={{
                      gridColumnStart: bar.startColumn,
                      gridColumnEnd: bar.endColumn,
                      gridRow: 1,
                      top: `${20 + bar.rowOffset * 22}px`,
                      backgroundColor: category?.color,
                    }}
                    title={event?.name}
                    onClick={() => { if (event) openEditEvent(event); }}
                  >
                    <span className="event-title">{event?.name}</span>
                    {bar.isEndContinuation && (
                      <div className="snake-nub snake-nub--end" style={{ backgroundColor: category?.color }} />
                    )}
                    {bar.isStartContinuation && (
                      <div className="snake-nub snake-nub--start" style={{ backgroundColor: category?.color }} />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* ── Year-week view ────────────────────────────────────────────────── */}
        {viewMode === 'yearweek' && (() => {
          const { weeks, spans } = getYearWeekViewData(effectiveEvents, currentYear, visibleCategories, globalRowOffsets);
          const bars = spans.filter((s): s is WeekEventBar => s.kind === 'bar');
          const dots = spans.filter((s): s is WeekEventDot => s.kind === 'dot');
          const maxBarOffset = bars.length > 0 ? Math.max(...bars.map(b => b.rowOffset)) : -1;
          const rowHeight = 40 + (maxBarOffset + 1) * 22;

          // Group weeks into month spans using ISO Thursday rule
          const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          type MonthSpan = { monthIndex: number; startCol: number; endCol: number };
          const monthSpans: MonthSpan[] = [];
          for (const week of weeks) {
            const thu = new Date(week.weekStart);
            thu.setDate(thu.getDate() + 3);
            const monthIndex = thu.getMonth();
            const last = monthSpans[monthSpans.length - 1];
            if (last && last.monthIndex === monthIndex) {
              last.endCol = week.column + 1;
            } else {
              monthSpans.push({ monthIndex, startCol: week.column, endCol: week.column + 1 });
            }
          }

          const gridCols = `60px repeat(${weeks.length}, 1fr)`;
          const minGridWidth = `${60 + weeks.length * 28}px`;
          return (
            <div className="yearweek-wrapper">
              <div className="yearweek-month-header" style={{ gridTemplateColumns: gridCols, minWidth: minGridWidth }}>
                <div className="yearweek-month-header__spacer" />
                {monthSpans.map((ms) => (
                  <div
                    key={ms.monthIndex}
                    className="yearweek-month-header__label"
                    style={{ gridColumnStart: ms.startCol, gridColumnEnd: ms.endCol }}
                  >
                    {MONTH_NAMES[ms.monthIndex]}
                  </div>
                ))}
              </div>
            <div
              className="month-row month-row--yearweek"
              style={{
                minHeight: `${rowHeight}px`,
                gridTemplateColumns: gridCols,
                minWidth: minGridWidth,
              }}
            >
              <div className="month-label">{currentYear}</div>

              {weeks.map((week) => (
                <div
                  key={week.isoWeek}
                  className="week-cell"
                  onClick={(e) => handleWeekCellClick(week.isoWeek, week.weekStart, week.weekEnd, e.currentTarget)}
                >
                  <span className="week-cell-label">W{week.isoWeek}</span>
                  <div className="week-cell-dots">
                    {dots.filter(d => d.column === week.column).map(dot => {
                      const event = effectiveEvents.find(e => e.id === dot.eventId);
                      const category = categories.find(c => c.id === event?.categoryId);
                      return (
                        <div
                          key={dot.eventId}
                          className="event-dot"
                          style={{ backgroundColor: category?.color }}
                          title={event?.name}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}

              {bars.map((bar) => {
                const event = effectiveEvents.find(e => e.id === bar.eventId);
                const category = categories.find(c => c.id === event?.categoryId);
                return (
                  <div
                    key={bar.eventId}
                    className="event-bar"
                    style={{
                      gridColumnStart: bar.startColumn,
                      gridColumnEnd: bar.endColumn,
                      gridRow: 1,
                      top: `${20 + bar.rowOffset * 22}px`,
                      backgroundColor: category?.color,
                    }}
                    title={event?.name}
                    onClick={() => { if (event) openEditEvent(event); }}
                  >
                    <span className="event-title">{event?.name}</span>
                    {bar.isEndContinuation && (
                      <div className="snake-nub snake-nub--end" style={{ backgroundColor: category?.color }} />
                    )}
                    {bar.isStartContinuation && (
                      <div className="snake-nub snake-nub--start" style={{ backgroundColor: category?.color }} />
                    )}
                  </div>
                );
              })}
            </div>
            </div>
          );
        })()}

        {/* ── Day view ──────────────────────────────────────────────────────── */}
        {/* Weekday header row — only in weekday-alignment mode */}
        {viewMode === 'day' && weekdayAlign && (() => {
          // Anchor date: a known Sunday (Jan 5 2025) to derive weekday names by index
          const anchor = new Date(2025, 0, 5);
          return (
            <div className="weekday-header-row">
              <div className="month-label" />
              {Array.from({ length: 42 }, (_, i) => {
                const dayIndex = (weekStart + i) % 7;
                const date = new Date(anchor);
                date.setDate(anchor.getDate() + dayIndex);
                return (
                  <div key={i} className="weekday-header-cell">
                    {date.toLocaleString(locale, { weekday: narrowWeekday ? 'narrow' : 'short' })}
                  </div>
                );
              })}
            </div>
          );
        })()}

        {viewMode === 'day' && yearData.map((month) => {
          const monthSpans = getMonthSpans(effectiveEvents, month.index, currentYear, visibleCategories, weekdayAlign, weekStart, globalRowOffsets);
          const maxOffset = monthSpans.length > 0 ? Math.max(...monthSpans.map(s => s.rowOffset)) : 0;
          const rowHeight = 40 + (maxOffset + 1) * 22;
          const offset = weekdayAlign ? getMonthOffset(currentYear, month.index, weekStart) : 0;

          const weekNumCols: (number | null)[] = (() => {
            if (!showWeekNumbers) return [];
            const cols = weekdayAlign ? 42 : 31;
            const result: (number | null)[] = Array(cols).fill(null);
            if (weekdayAlign) {
              for (let col = 0; col < cols; col++) {
                const date = new Date(currentYear, month.index, 1 - offset + col);
                if (date.getDay() === weekStart) result[col] = getISOWeekNumber(date);
              }
            } else {
              month.days.forEach(day => {
                const date = new Date(currentYear, month.index, day.dayNumber);
                if (date.getDay() === weekStart) result[day.dayNumber - 1] = getISOWeekNumber(date);
              });
            }
            return result;
          })();

          return (
            <div key={month.name}>
              {showWeekNumbers && (
                <div className={`week-number-row${weekdayAlign ? ' week-number-row--weekday' : ''}`}>
                  <div className="week-number-row-label" />
                  {weekNumCols.map((wn, i) => (
                    <div key={i} className="week-number-row-cell">
                      {wn !== null && <span className="week-number-badge">W{wn}</span>}
                    </div>
                  ))}
                </div>
              )}
              <div
                className={`month-row${weekdayAlign ? ' month-row--weekday' : ''}`}
                style={{ minHeight: `${rowHeight}px` }}
              >
              <div className="month-label">{month.name}</div>

              {/* Offset cells (empty weekday slots before day 1) */}
              {Array.from({ length: offset }, (_, i) => (
                <div key={`offset-${i}`} className="day-cell day-cell--offset" />
              ))}

              {/* Background Grid */}
              {month.days.map((day) => {
                const isToday = currentYear === today.getFullYear()
                  && month.index === today.getMonth()
                  && day.dayNumber === today.getDate();
                return (
                  <div
                    key={day.dayNumber}
                    className={`day-cell${day.isWeekend ? ' weekend' : ''}${isToday ? ' day-cell--today' : ''}`}
                    data-month={month.index}
                    data-day={day.dayNumber}
                    onClick={(e) => handleDayCellClick(month.index, day.dayNumber, e.currentTarget)}
                  >
                    <span className="day-number">{day.dayNumber}</span>
                    {!weekdayAlign && <span className="day-weekday">{narrowWeekday ? day.weekdayNarrow : day.weekday}</span>}
                  </div>
                );
              })}

              {/* Filler cells (pad short months to 31 columns) */}
              {!weekdayAlign && Array.from({ length: 31 - month.days.length }, (_, i) => (
                <div key={`filler-${i}`} className="day-cell day-cell--filler" />
              ))}

              {/* Event Spans — abs-pos direct grid children; containing block = grid area */}
              {monthSpans.map((span) => {
                const event = effectiveEvents.find(e => e.id === span.eventId);
                const category = categories.find(c => c.id === event?.categoryId);

                return (
                  <div
                    key={`${month.index}-${span.eventId}`}
                    className={`event-bar${dragEventId === span.eventId ? ' is-dragging' : ''}`}
                    style={{
                      gridColumnStart: span.startColumn,
                      gridColumnEnd: span.endColumn,
                      gridRow: 1,
                      top: `${20 + span.rowOffset * 22}px`,
                      backgroundColor: category?.color,
                    }}
                    title={event?.name}
                    onMouseDown={(e) => {
                      if (event) handleBarMouseDown(e, event, span, month.index);
                    }}
                  >
                    <span className="event-title">{event?.name}</span>
                    {span.isEndContinuation && (
                      <div className="snake-nub snake-nub--end" style={{ backgroundColor: category?.color }} />
                    )}
                    {span.isStartContinuation && (
                      <div className="snake-nub snake-nub--start" style={{ backgroundColor: category?.color }} />
                    )}
                  </div>
                );
              })}
            </div>
            </div>
          );
        })}
        {/* ── Vertical layout ───────────────────────────────────────────────── */}
        {viewMode === 'vertical' && (() => {
          const CELL_H = 26;
          const BAR_W  = 88;
          const BAR_GAP = 3;

          const maxStack = Array.from({ length: 12 }, (_, m) => {
            const mSpans = verticalSpans.filter(s => s.monthIndex === m);
            return mSpans.length > 0 ? Math.max(...mSpans.map(s => s.stackCol)) + 1 : 1;
          });

          return (
            <div className="vertical-layout">
              {/* Sticky day-label column */}
              <div className="vertical-day-col">
                <div className="vertical-month-header" />
                {Array.from({ length: 31 }, (_, i) => (
                  <div key={i} className="vertical-day-label" style={{ height: CELL_H }}>{i + 1}</div>
                ))}
              </div>

              {yearData.map((month, m) => {
                const daysInMonth = new Date(currentYear, m + 1, 0).getDate();
                const colWidth = maxStack[m] * (BAR_W + BAR_GAP);
                const mSpans = verticalSpans.filter(s => s.monthIndex === m);

                return (
                  <div key={m} className="vertical-month" style={{ width: colWidth }}>
                    <div className="vertical-month-header">{month.name}</div>
                    <div className="vertical-month-body" style={{ height: 31 * CELL_H }}>
                      {Array.from({ length: 31 }, (_, i) => {
                        const day = i + 1;
                        const valid = day <= daysInMonth;
                        const date = valid ? new Date(currentYear, m, day) : null;
                        const isToday = date
                          && currentYear === today.getFullYear()
                          && m === today.getMonth()
                          && day === today.getDate();
                        const isWeekend = date && (date.getDay() === 0 || date.getDay() === 6);
                        return (
                          <div
                            key={i}
                            className={[
                              'vertical-day-cell',
                              !valid        ? 'vertical-day-cell--filler' : '',
                              isToday       ? 'day-cell--today' : '',
                              isWeekend     ? 'weekend' : '',
                            ].filter(Boolean).join(' ')}
                            style={{ top: i * CELL_H, height: CELL_H }}
                            data-month={m}
                            data-day={day}
                            onClick={valid ? e => handleDayCellClick(m, day, e.currentTarget) : undefined}
                          />
                        );
                      })}

                      {mSpans.map(span => {
                        const event = effectiveEvents.find(e => e.id === span.eventId);
                        const category = categories.find(c => c.id === event?.categoryId);
                        return (
                          <div
                            key={`${m}-${span.eventId}`}
                            className="vertical-event-bar"
                            style={{
                              top:    (span.dayStart - 1) * CELL_H + 1,
                              height: (span.dayEnd - span.dayStart + 1) * CELL_H - 2,
                              left:   span.stackCol * (BAR_W + BAR_GAP),
                              width:  BAR_W,
                              backgroundColor: category?.color,
                            }}
                            title={event?.name}
                            onClick={() => { if (event) openEditEvent(event); }}
                          >
                            <span className="vertical-event-title">{event?.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </main>

      {cellOverlay && (
        <CellOverlay
          label={cellOverlay.label}
          events={cellOverlay.events}
          categories={categories}
          position={cellOverlay.position}
          onEdit={(ev) => { setCellOverlay(null); openEditEvent(ev); }}
          onAdd={() => { setCellOverlay(null); openAddEvent(cellOverlay.prefillDate ?? undefined); }}
          onClose={() => setCellOverlay(null)}
        />
      )}

      <Modal
        isOpen={isEventModalOpen}
        onClose={closeEventModal}
        title={editingEvent ? t.editEvent : t.addEvent}
      >
        <EventForm
          categories={categories}
          onSubmit={handleSubmitEvent}
          onCancel={closeEventModal}
          onDelete={editingEvent ? () => handleDeleteEvent(editingEvent.id) : undefined}
          initialEvent={editingEvent ?? undefined}
          initialDate={prefillDate ?? undefined}
          t={t}
        />
      </Modal>

      <Modal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        title={t.settings}
      >
        <SettingsModal
          locale={locale}
          onLocaleChange={setLocale}
          weekdayAlign={weekdayAlign}
          onWeekdayAlignChange={setWeekdayAlign}
          showWeekNumbers={showWeekNumbers}
          onShowWeekNumbersChange={setShowWeekNumbers}
          onLoadDemoData={handleLoadDemoData}
          onClearData={handleClearData}
          onClose={() => setIsSettingsModalOpen(false)}
          t={t}
        />
      </Modal>

      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={t.manageCategories}
      >
        <CategoryForm
          categories={categories}
          eventCounts={Object.fromEntries(categories.map(c => [c.id, events.filter(e => e.categoryId === c.id).length]))}
          onAdd={handleAddCategory}
          onEdit={handleEditCategory}
          onDelete={handleDeleteCategory}
          onReorder={handleReorderCategory}
          onCancel={() => setIsCategoryModalOpen(false)}
          t={t}
        />
      </Modal>

      <Modal
        isOpen={!!importPreview}
        onClose={() => setImportPreview(null)}
        title="Import Events"
      >
        {importPreview && (
          <div className="import-preview">
            <p className="import-preview-summary">
              Found <strong>{importPreview.events.length}</strong> event{importPreview.events.length !== 1 ? 's' : ''}.
              {importPreview.newCategories.length > 0 && (
                <> Will create <strong>{importPreview.newCategories.length}</strong> new categor{importPreview.newCategories.length !== 1 ? 'ies' : 'y'}:</>
              )}
            </p>
            {importPreview.newCategories.length > 0 && (
              <ul className="import-preview-cats">
                {importPreview.newCategories.map(c => (
                  <li key={c.id}>
                    <span className="color-dot" style={{ backgroundColor: c.color }} />
                    {c.name}
                  </li>
                ))}
              </ul>
            )}
            <p className="import-preview-hint">Events will be appended to your calendar.</p>
            <div className="form-actions">
              <button className="primary-btn" onClick={commitImport}>Import</button>
              <button className="secondary-btn" onClick={() => setImportPreview(null)}>Cancel</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default App;
