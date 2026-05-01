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

  const [events, setEvents] = useState<CalendarEvent[]>([]);
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
                return (
                  <div key={day} className="day-cell">
                    <span className="day-number">{day}</span>
                    {/* Events will be rendered here */}
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
