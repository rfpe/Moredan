import { useState, useMemo, useEffect, useRef } from 'react';
import './App.css'
import { generateYearData, getMonthSpans, getWeekStart, getMonthOffset, getISOWeekNumber, computeGlobalRowOffsets, getWeekViewData, getMonthViewData, type EventSpan, type WeekEventBar, type WeekEventDot } from './utils/calendar';
import { DEMO_CATEGORIES, generateDemoEvents } from './utils/demoData';
import { type Category, type CalendarEvent } from './types';
import { getTranslations } from './i18n';
import Modal from './components/Modal';
import EventForm from './components/EventForm';
import CategoryForm from './components/CategoryForm';
import SettingsModal from './components/SettingsModal';

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
  const yearData = useMemo(() => generateYearData(currentYear, locale), [currentYear, locale]);
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

  const VIEW_MODES = ['day', 'week', 'month'] as const;
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
        start:    e.start.toISOString().split('T')[0],
        end:      e.end.toISOString().split('T')[0],
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

  const handleDeleteCategory = (id: string) => {
    if (categories.length <= 1) return;
    setCategories(prev => prev.filter(c => c.id !== id));
    setEvents(prev => prev.filter(e => e.categoryId !== id));
    setVisibleCategories(prev => {
      const next = new Set(prev);
      next.delete(id);
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

  const handleDayCellClick = (monthIndex: number, dayNumber: number) => {
    const m = String(monthIndex + 1).padStart(2, '0');
    const d = String(dayNumber).padStart(2, '0');
    openAddEvent(`${currentYear}-${m}-${d}`);
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
          {categories.map(cat => {
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
              onClick={() => setVisibleCategories(new Set(categories.map(c => c.id)))}
            >
              {t.all}
            </button>
            <button
              type="button"
              className="category-bulk-btn"
              onClick={() => setVisibleCategories(new Set())}
            >
              {t.none}
            </button>
          </div>
        </div>

        <div className="controls">
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
              disabled={viewMode === 'month'}
              title="Zoom out"
            >－</button>
          </div>
          <button className="primary-btn" onClick={() => openAddEvent()}>{t.addEvent}</button>
          <button className="secondary-btn" onClick={() => setIsCategoryModalOpen(true)}>{t.categories}</button>
          <button className="secondary-btn" onClick={handleExportXLSX}>{t.exportXlsx}</button>
          <button className="icon-btn" onClick={() => setIsSettingsModalOpen(true)} title={t.settings}>⚙</button>
        </div>
      </header>

      <main className="calendar-container">
        {/* ── Month view ────────────────────────────────────────────────────── */}
        {viewMode === 'month' && (() => {
          const { cells, bars } = getMonthViewData(effectiveEvents, currentYear, visibleCategories, globalRowOffsets);
          const maxBarOffset = bars.length > 0 ? Math.max(...bars.map(b => b.rowOffset)) : -1;
          const rowHeight = 60 + (maxBarOffset + 1) * 22;
          return (
            <div
              className="month-row month-row--year"
              style={{ minHeight: `${rowHeight}px` }}
            >
              <div className="month-label">{currentYear}</div>
              {cells.map((cell, m) => {
                const monthName = yearData[m].name;
                return (
                  <div key={m} className="month-overview-cell">
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
                      top: `${36 + bar.rowOffset * 22}px`,
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
                  <div key={week.isoWeek} className="week-cell">
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
                            onClick={() => { if (event) openEditEvent(event); }}
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

          return (
            <div
              key={month.name}
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
                const date = new Date(currentYear, month.index, day.dayNumber);
                const isWeekStart = date.getDay() === weekStart;
                const weekNum = showWeekNumbers && isWeekStart ? getISOWeekNumber(date) : null;
                return (
                  <div
                    key={day.dayNumber}
                    className={`day-cell ${day.isWeekend ? 'weekend' : ''}`}
                    data-month={month.index}
                    data-day={day.dayNumber}
                    onClick={() => handleDayCellClick(month.index, day.dayNumber)}
                  >
                    <span className="day-number">{day.dayNumber}</span>
                    {!weekdayAlign && <span className="day-weekday">{narrowWeekday ? day.weekdayNarrow : day.weekday}</span>}
                    {weekNum !== null && <span className="week-number-badge">{weekNum}</span>}
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
          );
        })}
      </main>

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
          onAdd={handleAddCategory}
          onDelete={handleDeleteCategory}
          onCancel={() => setIsCategoryModalOpen(false)}
          t={t}
        />
      </Modal>
    </div>
  );
}

export default App;
