import React, { useState } from 'react';
import { type Category } from '../types';

interface CategoryFormProps {
  categories: Category[];
  onAdd: (category: Omit<Category, 'id'>) => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ categories, onAdd, onDelete, onCancel }) => {
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
            <label>Category Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
              placeholder="e.g. Travel"
            />
          </div>
          <div className="form-group">
            <label>Color</label>
            <input 
              type="color" 
              value={color} 
              onChange={e => setColor(e.target.value)} 
              required 
            />
          </div>
        </div>
        <button type="submit" className="primary-btn">Add Category</button>
      </form>

      <div className="category-list">
        <h3>Existing Categories</h3>
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
        <button className="secondary-btn" onClick={onCancel}>Close</button>
      </div>
    </div>
  );
};

export default CategoryForm;
