import React, { useState } from 'react';
import { type Category } from '../types';
import type { Translations } from '../i18n';

interface CategoryFormProps {
  categories: Category[];
  onAdd: (category: Omit<Category, 'id'>) => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
  t: Translations;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ categories, onAdd, onDelete, onCancel, t }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !color) return;
    onAdd({ name, color });
    setName('');
  };

  return (
    <div className="category-manager">
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
            <input 
              type="color" 
              value={color} 
              onChange={e => setColor(e.target.value)} 
              required 
            />
          </div>
        </div>
        <button type="submit" className="primary-btn">{t.addCategory}</button>
      </form>

      <div className="category-list">
        <h3>{t.existingCategories}</h3>
        {categories.map(cat => (
          <div key={cat.id} className="category-item">
            <span className="color-dot" style={{ backgroundColor: cat.color }}></span>
            <span className="category-name">{cat.name}</span>
            <button 
              className="delete-btn" 
              onClick={() => onDelete(cat.id)}
              disabled={categories.length <= 1}
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button className="secondary-btn" onClick={onCancel}>{t.close}</button>
      </div>
    </div>
  );
};

export default CategoryForm;
