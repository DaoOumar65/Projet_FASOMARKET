import { api } from './api';
import type { Notification } from '../types';

export type { Notification };

const isAuthenticated = (): boolean => {
  const user = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  return !!(user && token);
};

const getUserRole = (): string | null => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role;
    if (!role) return null;
    
    // Mapper les rôles vers les endpoints API
    const roleMapping: { [key: string]: string } = {
      'CLIENT': 'client',
      'VENDOR': 'vendeur',
      'ADMIN': 'admin'
    };
    
    return roleMapping[role] || null;
  } catch {
    return null;
  }
};

export const notificationService = {
  // Récupérer les notifications
  getNotifications: async (): Promise<Notification[]> => {
    if (!isAuthenticated()) return [];
    
    const role = getUserRole();
    if (!role) return [];
    
    try {
      const response = await api.get(`/api/${role}/notifications`);
      return response.data || [];
    } catch (error) {
      console.error('Erreur récupération notifications:', error);
      return [];
    }
  },

  // Marquer comme lue
  markAsRead: async (id: number): Promise<void> => {
    if (!isAuthenticated()) return;
    
    const role = getUserRole();
    if (!role) return;
    
    try {
      await api.put(`/api/${role}/notifications/${id}/lue`);
    } catch (error) {
      console.error('Erreur marquage notification:', error);
      // Continuer silencieusement pour le fallback
    }
  },

  // Compteur non lues
  getUnreadCount: async (): Promise<number> => {
    if (!isAuthenticated()) return 0;
    
    const role = getUserRole();
    if (!role) return 0;
    
    try {
      const response = await api.get(`/api/${role}/notifications/compteur`);
      return response.data || 0;
    } catch (error) {
      console.error('Erreur compteur notifications:', error);
      return 0;
    }
  }
};