import React, { useState } from 'react';
import { type Category } from '../types';
import type { Translations } from '../i18n';

interface Props {
  categories: Category[];
  eventCounts: Record<string, number>;
  onAdd: (category: Omit<Category, 'id'>) => void;
  onEdit: (id: string, data: Omit<Category, 'id'>) => void;
  onDelete: (id: string, reassign: boolean) => void;
  onReorder: (id: string, direction: 'up' | 'down') => void;
  onCancel: () => void;
  t: Translations;
}

const CategoryForm: React.FC<Props> = ({
  categories, eventCounts, onAdd, onEdit, onDelete, onReorder, onCancel, t
}) => {
  const [name, setName]   = useState('');
  const [color, setColor] = useState('#3b82f6');

  const [editingId, setEditingId]     = useState<string | null>(null);
  const [editName, setEditName]       = useState('');
  const [editColor, setEditColor]     = useState('');

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({ name: name.trim(), color });
    setName('');
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color);
    setConfirmDeleteId(null);
  };

  const saveEdit = () => {
    if (!editName.trim() || !editingId) return;
    onEdit(editingId, { name: editName.trim(), color: editColor });
    setEditingId(null);
  };

  const startDelete = (id: string) => {
    setConfirmDeleteId(id);
    setEditingId(null);
  };

  return (
    <div className="category-manager">
      {/* Add new category */}
      <form className="category-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>{t.categoryName}</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder={t.categoryNamePlaceholder}
            />
          </div>
          <div className="form-group">
            <label>{t.color}</label>
            <input type="color" value={color} onChange={e => setColor(e.target.value)} required />
          </div>
        </div>
        <button type="submit" className="primary-btn">{t.addCategory}</button>
      </form>

      {/* Existing categories */}
      <div className="category-list">
        <h3>{t.existingCategories}</h3>
        {categories.map((cat, idx) => {
          if (confirmDeleteId === cat.id) {
            const count = eventCounts[cat.id] ?? 0;
            return (
              <div key={cat.id} className="category-item category-item--confirm">
                <span className="color-dot" style={{ backgroundColor: cat.color }} />
                <span className="category-confirm-msg">
                  {count > 0
                    ? `"${cat.name}" has ${count} event${count !== 1 ? 's' : ''}.`
                    : `Delete "${cat.name}"?`}
                </span>
                <div className="category-confirm-actions">
                  {count > 0 && (
                    <button className="danger-btn" onClick={() => { onDelete(cat.id, false); setConfirmDeleteId(null); }}>
                      Delete events
                    </button>
                  )}
                  {count > 0 && (
                    <button className="secondary-btn" onClick={() => { onDelete(cat.id, true); setConfirmDeleteId(null); }}>
                      Keep as Uncategorized
                    </button>
                  )}
                  {count === 0 && (
                    <button className="danger-btn" onClick={() => { onDelete(cat.id, false); setConfirmDeleteId(null); }}>
                      Delete
                    </button>
                  )}
                  <button className="secondary-btn" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                </div>
              </div>
            );
          }

          if (editingId === cat.id) {
            return (
              <div key={cat.id} className="category-item category-item--editing">
                <input type="color" value={editColor} onChange={e => setEditColor(e.target.value)} className="category-color-input" />
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="category-name-input"
                  autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingId(null); }}
                />
                <button className="primary-btn category-action-btn" onClick={saveEdit}>Save</button>
                <button className="secondary-btn category-action-btn" onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            );
          }

          return (
            <div key={cat.id} className="category-item">
              <span className="color-dot" style={{ backgroundColor: cat.color }} />
              <span className="category-name">{cat.name}</span>
              <div className="category-item-actions">
                <button
                  className="category-icon-btn"
                  onClick={() => onReorder(cat.id, 'up')}
                  disabled={idx === 0}
                  title="Move up"
                >↑</button>
                <button
                  className="category-icon-btn"
                  onClick={() => onReorder(cat.id, 'down')}
                  disabled={idx === categories.length - 1}
                  title="Move down"
                >↓</button>
                <button className="category-icon-btn" onClick={() => startEdit(cat)} title="Edit">✎</button>
                <button
                  className="delete-btn"
                  onClick={() => startDelete(cat.id)}
                  disabled={categories.length <= 1}
                  title="Delete"
                >&times;</button>
              </div>
            </div>
          );
        })}
        {categories.length > 10 && (
          <p className="category-order-hint">Top 10 categories appear in the header. Reorder to change which ones.</p>
        )}
      </div>

      <div className="form-actions">
        <button className="secondary-btn" onClick={onCancel}>{t.close}</button>
      </div>
    </div>
  );
};

export default CategoryForm;
