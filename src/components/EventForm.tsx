import React, { useState } from 'react';
import { Category, CalendarEvent } from '../types';

interface EventFormProps {
  categories: Category[];
  onSubmit: (event: Omit<CalendarEvent, 'id'>) => void;
  onCancel: () => void;
}

const EventForm: React.FC<EventFormProps> = ({ categories, onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [start, setStart] = useState('2026-01-01');
  const [end, setEnd] = useState('2026-01-01');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !start || !end || !categoryId) return;
    
    onSubmit({
      name,
      start: new Date(start),
      end: new Date(end),
      categoryId,
    });
  };

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Event Name</label>
        <input 
          type="text" 
          value={name} 
          onChange={e => setName(e.target.value)} 
          required 
          placeholder="e.g. Vacation"
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Start Date</label>
          <input 
            type="date" 
            value={start} 
            onChange={e => setStart(e.target.value)} 
            required
            min="2026-01-01"
            max="2026-12-31"
          />
        </div>
        <div className="form-group">
          <label>End Date</label>
          <input 
            type="date" 
            value={end} 
            onChange={e => setEnd(e.target.value)} 
            required
            min={start}
            max="2026-12-31"
          />
        </div>
      </div>
      <div className="form-group">
        <label>Category</label>
        <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
      <div className="form-actions">
        <button type="button" className="secondary-btn" onClick={onCancel}>Cancel</button>
        <button type="submit" className="primary-btn">Save Event</button>
      </div>
    </form>
  );
};

export default EventForm;
