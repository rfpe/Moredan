import { useEffect, useRef } from 'react';
import type { CalendarEvent, Category } from '../types';

interface Props {
  label: string;
  events: CalendarEvent[];
  categories: Category[];
  position: { top: number; left: number };
  onEdit: (event: CalendarEvent) => void;
  onAdd: () => void;
  onClose: () => void;
}

const fmt = (d: Date) =>
  d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

export default function CellOverlay({ label, events, categories, position, onEdit, onAdd, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, [onClose]);

  // Flip left if too close to right edge
  useEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    if (rect.right > window.innerWidth - 8) {
      ref.current.style.left = `${window.innerWidth - rect.width - 8}px`;
    }
    if (rect.bottom > window.innerHeight - 8) {
      ref.current.style.top = `${position.top - rect.height - 4}px`;
    }
  }, [position]);

  return (
    <div
      ref={ref}
      className="cell-overlay"
      style={{ top: position.top, left: position.left }}
    >
      <div className="cell-overlay-header">
        <span className="cell-overlay-label">{label}</span>
        <button className="cell-overlay-close" onClick={onClose}>✕</button>
      </div>

      {events.length === 0 ? (
        <p className="cell-overlay-empty">No events</p>
      ) : (
        <ul className="cell-overlay-list">
          {events.map(ev => {
            const cat = categories.find(c => c.id === ev.categoryId);
            const start = new Date(ev.start); start.setHours(0, 0, 0, 0);
            const end   = new Date(ev.end);   end.setHours(0, 0, 0, 0);
            const sameDay = start.getTime() === end.getTime();
            return (
              <li key={ev.id} className="cell-overlay-item">
                <div className="cell-overlay-dot" style={{ backgroundColor: cat?.color }} />
                <div className="cell-overlay-info">
                  <span className="cell-overlay-name">{ev.name}</span>
                  <span className="cell-overlay-dates">
                    {sameDay ? fmt(start) : `${fmt(start)} – ${fmt(end)}`}
                  </span>
                </div>
                <button className="cell-overlay-edit" onClick={() => onEdit(ev)}>Edit</button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="cell-overlay-footer">
        <button className="cell-overlay-add" onClick={onAdd}>+ Add event</button>
      </div>
    </div>
  );
}
