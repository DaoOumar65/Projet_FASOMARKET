import { api } from './api';
import { Category, VariantConfig } from '../types/category';

export const categoryService = {
  // Lister toutes les catégories
  getAll: () => api.get<Category[]>('/api/admin/categories'),
  
  // Créer une nouvelle catégorie
  create: (category: Omit<Category, 'id'>) => 
    api.post('/api/admin/categories', category),
  
  // Modifier une catégorie
  update: (id: string, category: Partial<Category>) =>
    api.put(`/api/admin/categories/${id}`, category),
  
  // Supprimer une catégorie
  delete: (id: string) =>
    api.delete(`/api/admin/categories/${id}`),

  // Configuration des variantes
  getVariantConfig: (categoryId: string) =>
    api.get<VariantConfig>(`/api/admin/categories/${categoryId}/variant-config`),
    
  saveVariantConfig: (categoryId: string, config: VariantConfig) =>
    api.put(`/api/admin/categories/${categoryId}/variant-config`, config),

  // Public - Catégories actives
  getActiveCategories: () => api.get<Category[]>('/api/categories')
};