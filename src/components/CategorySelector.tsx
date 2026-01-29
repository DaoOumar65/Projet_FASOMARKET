import React, { useState, useEffect } from 'react';
import { Category } from '../types/category';
import { categoryService } from '../services/categoryService';

interface Props {
  value: string;
  onChange: (categoryId: string) => void;
  className?: string;
}

export const CategorySelector: React.FC<Props> = ({ value, onChange, className = '' }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoryService.getActiveCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <select disabled className={`${className} opacity-50`}>
        <option>Chargement...</option>
      </select>
    );
  }

  return (
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className={`px-3 py-2 border border-gray-300 rounded-md ${className}`}
    >
      <option value="">Sélectionner une catégorie</option>
      {categories.map(cat => (
        <option key={cat.id} value={cat.id}>
          {cat.icone} {cat.nom}
        </option>
      ))}
    </select>
  );
};