import { useState, useMemo, useEffect } from 'react';
import './App.css'
import { generateYearData } from './utils/calendar';
import { Category, CalendarEvent } from './types';
import Modal from './components/Modal';
import EventForm from './components/EventForm';
import CategoryForm from './components/CategoryForm';

function App() {
  const currentYear = 2026;
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
          <h1>Moredan {currentYear}</h1>
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
      
      <main className="calendar-grid">
        {yearData.map((month) => (
          <div key={month.name} className="month-container">
            <div className="month-title">{month.name}</div>
            <div className="days-grid">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                <div key={d} className="day-cell day-header">{d}</div>
              ))}
              
              {/* Empty cells for padding */}
              {Array.from({ length: month.firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="day-cell empty"></div>
              ))}
              
              {/* Actual days */}
              {Array.from({ length: month.daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayEvents = getEventsForDay(month.index, day);
                return (
                  <div 
                    key={day} 
                    className={`day-cell ${dayEvents.length > 0 ? 'has-events' : ''}`}
                    onClick={() => setSelectedDay({ month: month.index, day })}
                  >
                    <span className="day-number">{day}</span>
                    <div className="event-indicators">
                      {dayEvents.map(event => {
                        const category = categories.find(c => c.id === event.categoryId);
                        return (
                          <div 
                            key={event.id} 
                            className="event-dot" 
                            style={{ backgroundColor: category?.color }}
                            title={event.name}
                          ></div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
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
