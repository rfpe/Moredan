import { useState, useMemo, useEffect } from 'react';
import './App.css'
import { generateYearData, getMonthSpans } from './utils/calendar';
import { type Category, type CalendarEvent } from './types';
import Modal from './components/Modal';
import EventForm from './components/EventForm';
import CategoryForm from './components/CategoryForm';

function App() {
  const [currentYear, setCurrentYear] = useState(() => {
    const saved = localStorage.getItem('moredan_current_year');
    return saved ? parseInt(saved, 10) : 2026;
  });

  const yearData = useMemo(() => generateYearData(currentYear), [currentYear]);
  
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
  const [selectedDay, setSelectedDay] = useState<{ month: number, day: number } | null>(null);

  useEffect(() => {
    localStorage.setItem('moredan_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('moredan_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('moredan_current_year', currentYear.toString());
  }, [currentYear]);

  const toggleCategory = (id: string) => {
    const newVisible = new Set(visibleCategories);
    if (newVisible.has(id)) {
      newVisible.delete(id);
    } else {
      newVisible.add(id);
    }
    setVisibleCategories(newVisible);
  };

  const handleAddEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: Math.random().toString(36).substr(2, 9),
    };
    setEvents([...events, newEvent]);
    setIsEventModalOpen(false);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const handleAddCategory = (catData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...catData,
      id: Math.random().toString(36).substr(2, 9),
    };
    setCategories([...categories, newCat]);
    setVisibleCategories(new Set([...visibleCategories, newCat.id]));
  };

  const handleDeleteCategory = (id: string) => {
    if (categories.length <= 1) return;
    setCategories(categories.filter(c => c.id !== id));
    setEvents(events.filter(e => e.categoryId !== id));
    const newVisible = new Set(visibleCategories);
    newVisible.delete(id);
    setVisibleCategories(newVisible);
  };

  const getEventsForDay = (monthIndex: number, day: number) => {
    return events.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      const currentDate = new Date(currentYear, monthIndex, day);
      
      currentDate.setHours(0, 0, 0, 0);
      eventStart.setHours(0, 0, 0, 0);
      eventEnd.setHours(0, 0, 0, 0);

      return currentDate >= eventStart && currentDate <= eventEnd && visibleCategories.has(event.categoryId);
    });
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
          <button className="primary-btn" onClick={() => setIsEventModalOpen(true)}>Add Event</button>
          <button className="secondary-btn" onClick={() => setIsCategoryModalOpen(true)}>Categories</button>
        </div>
      </header>
      
      <main className="calendar-container">
        {yearData.map((month) => {
          const monthSpans = getMonthSpans(events, month.index, currentYear, visibleCategories);
          const maxOffset = monthSpans.length > 0 ? Math.max(...monthSpans.map(s => s.rowOffset)) : 0;
          const rowHeight = 40 + (maxOffset + 1) * 22;

          return (
            <div 
              key={month.name} 
              className="month-row" 
              style={{ minHeight: `${rowHeight}px` }}
            >
              <div className="month-label">{month.name}</div>
              
              {/* Background Grid */}
              {month.days.map((day) => (
                <div 
                  key={day.dayNumber} 
                  className={`day-cell ${day.isWeekend ? 'weekend' : ''}`}
                  onClick={() => setSelectedDay({ month: month.index, day: day.dayNumber })}
                >
                  <span className="day-number">{day.dayNumber}</span>
                  <span className="day-weekday">{day.weekday}</span>
                </div>
              ))}

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
                        setSelectedDay({ month: month.index, day: new Date(event!.start).getDate() });
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
        onClose={() => setIsEventModalOpen(false)} 
        title="Add New Event"
      >
        <EventForm 
          categories={categories} 
          onSubmit={handleAddEvent} 
          onCancel={() => setIsEventModalOpen(false)} 
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

      <Modal
        isOpen={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        title={selectedDay ? `${yearData[selectedDay.month].name} ${selectedDay.day}, ${currentYear}` : ''}
      >
        <div className="day-detail">
          {selectedDay && getEventsForDay(selectedDay.month, selectedDay.day).length === 0 && (
            <p className="no-events">No events scheduled for this day.</p>
          )}
          {selectedDay && getEventsForDay(selectedDay.month, selectedDay.day).map(event => {
            const category = categories.find(c => c.id === event.categoryId);
            return (
              <div key={event.id} className="detail-event-item">
                <span className="color-dot" style={{ backgroundColor: category?.color }}></span>
                <div className="event-info">
                  <span className="event-name">{event.name}</span>
                  <span className="event-category">{category?.name}</span>
                </div>
                <button className="delete-btn" onClick={() => handleDeleteEvent(event.id)}>&times;</button>
              </div>
            );
          })}
          <button 
            className="primary-btn full-width" 
            style={{ marginTop: '1rem' }}
            onClick={() => {
              setSelectedDay(null);
              setIsEventModalOpen(true);
            }}
          >
            Add Event
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default App
