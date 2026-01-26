import { create } from 'zustand';
import { notificationService } from '../services/notifications';
import type { Notification } from '../types';

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    try {
      set({ loading: true });
      const notifications = await notificationService.getNotifications();
      set({ notifications, loading: false });
    } catch (error) {
      console.error('Erreur fetch notifications:', error);
      set({ loading: false });
    }
  },

  markAsRead: async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      const { notifications } = get();
      set({
        notifications: notifications.map(n => 
          n.id === id ? { ...n, lue: true } : n
        ),
        unreadCount: Math.max(0, get().unreadCount - 1)
      });
    } catch (error) {
      console.error('Erreur marquage notification:', error);
    }
  },

  fetchUnreadCount: async () => {
    // Ne pas faire d'appel API si l'utilisateur n'est pas connecté
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!user || !token) {
      set({ unreadCount: 0 });
      return;
    }
    
    try {
      const count = await notificationService.getUnreadCount();
      set({ unreadCount: count });
    } catch (error) {
      console.error('Erreur compteur notifications:', error);
      set({ unreadCount: 0 });
    }
  }
}));