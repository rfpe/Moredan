import React, { useState } from 'react';
import { type Category, type CalendarEvent, type EventAttribute } from '../types';
import type { Translations } from '../i18n';
import DatePicker from './DatePicker';

interface EventFormProps {
  categories: Category[];
  onSubmit: (event: Omit<CalendarEvent, 'id'> & { id?: string }) => void;
  onCancel: () => void;
  onDelete?: () => void;
  initialEvent?: CalendarEvent;
  initialDate?: string;
  t: Translations;
  locale: string;
  eventAttributes: EventAttribute[];
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
  t,
  locale,
  eventAttributes,
}) => {
  const defaultDate = initialDate ?? toDateString(new Date());

  const [name, setName] = useState(initialEvent?.name ?? '');
  const [start, setStart] = useState(initialEvent ? toDateString(initialEvent.start) : defaultDate);
  const [end, setEnd] = useState(initialEvent ? toDateString(initialEvent.end) : defaultDate);
  const [categoryId, setCategoryId] = useState(initialEvent?.categoryId ?? categories[0]?.id ?? '');
  const [attrValues, setAttrValues] = useState<Record<string, string>>(
    () => initialEvent?.attributes ?? {}
  );

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
      attributes: attrValues,
    });
  };

  const sortedAttrs = [...eventAttributes].sort((a, b) => a.order - b.order);

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>{t.eventName}</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          placeholder={t.eventNamePlaceholder}
          autoFocus
        />
      </div>
      <div className="form-row">
        <DatePicker
          value={start}
          onChange={v => { setStart(v); if (v > end) setEnd(v); }}
          locale={locale}
          t={t}
          label={t.startDate}
        />
        <DatePicker
          value={end}
          onChange={setEnd}
          min={start}
          locale={locale}
          t={t}
          label={t.endDate}
        />
      </div>
      <div className="form-group">
        <label>{t.category}</label>
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
      {sortedAttrs.map(attr => (
        <div className="form-group" key={attr.id}>
          <label>{attr.name}</label>
          {attr.type === 'textarea' ? (
            <textarea
              rows={3}
              value={attrValues[attr.id] ?? ''}
              onChange={e => setAttrValues(prev => ({ ...prev, [attr.id]: e.target.value }))}
            />
          ) : (
            <input
              type={attr.type === 'url' ? 'url' : 'text'}
              placeholder={attr.type === 'url' ? 'https://' : ''}
              value={attrValues[attr.id] ?? ''}
              onChange={e => setAttrValues(prev => ({ ...prev, [attr.id]: e.target.value }))}
            />
          )}
        </div>
      ))}
      <div className="form-actions">
        {isEditing && onDelete && (
          <button type="button" className="delete-btn delete-btn--form" onClick={onDelete}>
            {t.delete}
          </button>
        )}
        <button type="button" className="secondary-btn" onClick={onCancel}>{t.cancel}</button>
        <button type="submit" className="primary-btn">
          {isEditing ? t.updateEvent : t.saveEvent}
        </button>
      </div>
    </form>
  );
};

export default EventForm;
