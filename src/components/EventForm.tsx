import React, { useState } from 'react';
import { type Category, type CalendarEvent } from '../types';

interface EventFormProps {
  categories: Category[];
  onSubmit: (event: Omit<CalendarEvent, 'id'> & { id?: string }) => void;
  onCancel: () => void;
  onDelete?: () => void;
  initialEvent?: CalendarEvent;
  initialDate?: string;
}

const toDateString = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const EventForm: React.FC<EventFormProps> = ({
  categories,
  onSubmit,
  onCancel,
  onDelete,
  initialEvent,
  initialDate,
}) => {
  const defaultDate = initialDate ?? toDateString(new Date());

  const [name, setName] = useState(initialEvent?.name ?? '');
  const [start, setStart] = useState(initialEvent ? toDateString(initialEvent.start) : defaultDate);
  const [end, setEnd] = useState(initialEvent ? toDateString(initialEvent.end) : defaultDate);
  const [categoryId, setCategoryId] = useState(initialEvent?.categoryId ?? categories[0]?.id ?? '');

  const isEditing = !!initialEvent;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !start || !end || !categoryId) return;

    onSubmit({
      ...(isEditing ? { id: initialEvent.id } : {}),
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
          autoFocus
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
          />
        </div>
      </div>
      <div className="form-group">
        <label>Category</label>
        <div className="category-toggle-group">
          {categories.map(cat => {
            const isSelected = categoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                className={`category-toggle-btn${isSelected ? ' selected' : ''}`}
                style={isSelected
                  ? { backgroundColor: cat.color, borderColor: cat.color, color: '#fff' }
                  : { borderColor: cat.color, color: cat.color }
                }
                onClick={() => setCategoryId(cat.id)}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>
      <div className="form-actions">
        {isEditing && onDelete && (
          <button type="button" className="delete-btn delete-btn--form" onClick={onDelete}>
            Delete
          </button>
        )}
        <button type="button" className="secondary-btn" onClick={onCancel}>Cancel</button>
        <button type="submit" className="primary-btn">
          {isEditing ? 'Update Event' : 'Save Event'}
        </button>
      </div>
    </form>
  );
};

export default EventForm;
