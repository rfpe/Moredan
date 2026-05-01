import { useState, useMemo, useEffect } from 'react';
import './App.css'
import { generateYearData, getMonthSpans, getWeekStart, getMonthOffset, getISOWeekNumber } from './utils/calendar';
import { type Category, type CalendarEvent } from './types';
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

  const handleExportCSV = () => {
    const header = ['Name', 'Start Date', 'End Date', 'Category', 'Color'];
    const rows = events.map(e => {
      const cat = categories.find(c => c.id === e.categoryId);
      return [
        `"${e.name.replace(/"/g, '""')}"`,
        e.start.toISOString().split('T')[0],
        e.end.toISOString().split('T')[0],
        `"${(cat?.name ?? '').replace(/"/g, '""')}"`,
        cat?.color ?? '',
      ].join(',');
    });
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moredan-${currentYear}.csv`;
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

  const handleDayCellClick = (monthIndex: number, dayNumber: number) => {
    const date = new Date(currentYear, monthIndex, dayNumber);
    const dateStr = date.toISOString().split('T')[0];
    openAddEvent(dateStr);
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
          {categories.map(cat => (
            <label key={cat.id} className="category-filter-item">
              <input
                type="checkbox"
                checked={visibleCategories.has(cat.id)}
                onChange={() => toggleCategory(cat.id)}
              />
              <span className="color-dot" style={{ backgroundColor: cat.color }}></span>
              {cat.name}
            </label>
          ))}
        </div>

        <div className="controls">
          <button className="primary-btn" onClick={() => openAddEvent()}>Add Event</button>
          <button className="secondary-btn" onClick={() => setIsCategoryModalOpen(true)}>Categories</button>
          <button className="secondary-btn" onClick={handleExportCSV}>Export CSV</button>
          <button className="icon-btn" onClick={() => setIsSettingsModalOpen(true)} title="Settings">⚙</button>
        </div>
      </header>

      <main className="calendar-container">
        {/* Weekday header row — only in weekday-alignment mode */}
        {weekdayAlign && (() => {
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
                    {date.toLocaleString(locale, { weekday: 'short' })}
                  </div>
                );
              })}
            </div>
          );
        })()}

        {yearData.map((month) => {
          const monthSpans = getMonthSpans(events, month.index, currentYear, visibleCategories, weekdayAlign, weekStart);
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
                    onClick={() => handleDayCellClick(month.index, day.dayNumber)}
                  >
                    <span className="day-number">{day.dayNumber}</span>
                    {!weekdayAlign && <span className="day-weekday">{day.weekday}</span>}
                    {weekNum !== null && <span className="week-number-badge">{weekNum}</span>}
                  </div>
                );
              })}

              {/* Event Spans */}
              <div className="event-row-overlay">
                {monthSpans.map((span) => {
                  const event = events.find(e => e.id === span.eventId);
                  const category = categories.find(c => c.id === event?.categoryId);

                  return (
                    <div
                      key={`${month.index}-${span.eventId}`}
                      className="event-bar"
                      style={{
                        gridColumnStart: span.startColumn,
                        gridColumnEnd: span.endColumn,
                        top: `${20 + span.rowOffset * 22}px`,
                        backgroundColor: category?.color,
                        position: 'relative',
                        gridRow: 1
                      }}
                      title={event?.name}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (event) openEditEvent(event);
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
      </main>

      <Modal
        isOpen={isEventModalOpen}
        onClose={closeEventModal}
        title={editingEvent ? 'Edit Event' : 'Add Event'}
      >
        <EventForm
          categories={categories}
          onSubmit={handleSubmitEvent}
          onCancel={closeEventModal}
          onDelete={editingEvent ? () => handleDeleteEvent(editingEvent.id) : undefined}
          initialEvent={editingEvent ?? undefined}
          initialDate={prefillDate ?? undefined}
        />
      </Modal>

      <Modal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        title="Settings"
      >
        <SettingsModal
          locale={locale}
          onLocaleChange={setLocale}
          weekdayAlign={weekdayAlign}
          onWeekdayAlignChange={setWeekdayAlign}
          showWeekNumbers={showWeekNumbers}
          onShowWeekNumbersChange={setShowWeekNumbers}
          onClose={() => setIsSettingsModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Manage Categories"
      >
        <CategoryForm
          categories={categories}
          onAdd={handleAddCategory}
          onDelete={handleDeleteCategory}
          onCancel={() => setIsCategoryModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

export default App;
