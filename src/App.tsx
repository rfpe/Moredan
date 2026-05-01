import { useState, useMemo } from 'react';
import './App.css'
import { generateYearData } from './utils/calendar';
import { Category, CalendarEvent } from './types';

function App() {
  const currentYear = 2026;
  const yearData = useMemo(() => generateYearData(currentYear), [currentYear]);
  
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Work', color: '#3b82f6' },
    { id: '2', name: 'Personal', color: '#10b981' },
    { id: '3', name: 'Urgent', color: '#ef4444' },
  ]);

  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: 'e1', name: 'Project Kickoff', start: new Date(2026, 0, 15), end: new Date(2026, 0, 15), categoryId: '1' },
    { id: 'e2', name: 'Vacation', start: new Date(2026, 5, 10), end: new Date(2026, 5, 20), categoryId: '2' },
    { id: 'e3', name: 'Deadline', start: new Date(2026, 0, 15), end: new Date(2026, 0, 15), categoryId: '3' },
  ]);

  const [visibleCategories, setVisibleCategories] = useState<Set<string>>(new Set(categories.map(c => c.id)));

  const toggleCategory = (id: string) => {
    const newVisible = new Set(visibleCategories);
    if (newVisible.has(id)) {
      newVisible.delete(id);
    } else {
      newVisible.add(id);
    }
    setVisibleCategories(newVisible);
  };

  const getEventsForDay = (monthIndex: number, day: number) => {
    return events.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      const currentDate = new Date(currentYear, monthIndex, day);
      
      // Normalize dates to remove time for comparison
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
          <button className="primary-btn">Add Event</button>
          <button className="secondary-btn">Categories</button>
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
                  <div key={day} className="day-cell">
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
    </div>
  )
}

export default App
