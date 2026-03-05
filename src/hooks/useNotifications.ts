import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notificationService';

// Types définis localement pour éviter les problèmes d'import
interface AppNotification {
  id: string;
  type: 'commande' | 'stock' | 'validation' | 'paiement' | 'message' | 'system';
  titre: string;
  message: string;
  userId: string;
  userRole: 'CLIENT' | 'VENDEUR' | 'ADMIN';
  data?: any;
  lu: boolean;
  dateCreation: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actions?: Array<{
    label: string;
    action: string;
    style: 'primary' | 'secondary' | 'danger';
  }>;
}

interface NotificationStats {
  total: number;
  nonLues: number;
  parType: Record<string, number>;
}

interface UseNotificationsOptions {
  userId: string;
  userRole: 'CLIENT' | 'VENDEUR' | 'ADMIN';
  autoInit?: boolean;
  enableSound?: boolean;
  enableBrowserNotifications?: boolean;
}

interface UseNotificationsReturn {
  notifications: AppNotification[];
  stats: NotificationStats;
  connectionStatus: 'connected' | 'disconnected' | 'fallback';
  loading: boolean;
  hasPermission: boolean;
  // Actions
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  requestPermission: () => Promise<boolean>;
  // Utilitaires
  getUnreadCount: () => number;
  getNotificationsByType: (type: string) => AppNotification[];
  isConnected: () => boolean;
}

export const useNotifications = (options: UseNotificationsOptions): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({ total: 0, nonLues: 0, parType: {} });
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'fallback'>('disconnected');
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  // Initialisation
  useEffect(() => {
    if (options.autoInit !== false) {
      initializeNotifications();
    }
    
    return () => {
      notificationService.disconnect();
    };
  }, [options.userId, options.userRole]);

  const initializeNotifications = useCallback(async () => {
    setLoading(true);
    
    try {
      // Initialiser le service
      notificationService.initialize(options.userId, options.userRole);

      // Demander permission si activée
      if (options.enableBrowserNotifications !== false) {
        const permission = await notificationService.requestPermission();
        setHasPermission(permission);
      }

      // Configurer les listeners
      setupEventListeners();

      // Charger les données initiales
      await Promise.all([
        loadNotifications(),
        loadStats()
      ]);

    } catch (error) {
      console.error('Erreur initialisation notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [options.userId, options.userRole, options.enableBrowserNotifications]);

  const setupEventListeners = useCallback(() => {
    // Connexion
    notificationService.on('connection', (data: { status: string }) => {
      setConnectionStatus(data.status as any);
    });

    // Nouvelle notification
    notificationService.on('notification', (notification: AppNotification) => {
      setNotifications(prev => [notification, ...prev]);
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        nonLues: prev.nonLues + 1,
        parType: {
          ...prev.parType,
          [notification.type]: (prev.parType[notification.type] || 0) + 1
        }
      }));

      // Son si activé
      if (options.enableSound !== false) {
        playNotificationSound(notification.priority);
      }
    });

    // Notification lue
    notificationService.on('notification_read', (notificationId: string) => {
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, lu: true } : n)
      );
      setStats(prev => ({ ...prev, nonLues: Math.max(0, prev.nonLues - 1) }));
    });

    // Toutes lues
    notificationService.on('all_notifications_read', () => {
      setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
      setStats(prev => ({ ...prev, nonLues: 0 }));
    });

    // Mise à jour stats
    notificationService.on('stats_update', (newStats: NotificationStats) => {
      setStats(newStats);
    });
  }, [options.enableSound]);

  const loadNotifications = useCallback(async (page = 0) => {
    try {
      const data = await notificationService.getNotifications(page, 20);
      
      if (page === 0) {
        setNotifications(data);
      } else {
        setNotifications(prev => [...prev, ...data]);
      }
      
      setCurrentPage(page);
      return data;
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
      return [];
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const data = await notificationService.getStats();
      setStats(data);
      return data;
    } catch (error) {
      console.error('Erreur chargement stats:', error);
      return stats;
    }
  }, [stats]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationService.markAsRead(id);
    } catch (error) {
      console.error('Erreur marquage lu:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
    } catch (error) {
      console.error('Erreur marquage tout lu:', error);
    }
  }, []);

  const loadMore = useCallback(async () => {
    const nextPage = currentPage + 1;
    await loadNotifications(nextPage);
  }, [currentPage, loadNotifications]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadNotifications(0),
        loadStats()
      ]);
    } finally {
      setLoading(false);
    }
  }, [loadNotifications, loadStats]);

  const requestPermission = useCallback(async () => {
    const permission = await notificationService.requestPermission();
    setHasPermission(permission);
    return permission;
  }, []);

  // Utilitaires
  const getUnreadCount = useCallback(() => {
    return notifications.filter(n => !n.lu).length;
  }, [notifications]);

  const getNotificationsByType = useCallback((type: string) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  const isConnected = useCallback(() => {
    return connectionStatus === 'connected';
  }, [connectionStatus]);

  const playNotificationSound = (priority: string) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Fréquence selon priorité
      const frequency = priority === 'urgent' ? 800 : priority === 'high' ? 600 : 400;
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('Impossible de jouer le son de notification:', error);
    }
  };

  return {
    notifications,
    stats,
    connectionStatus,
    loading,
    hasPermission,
    markAsRead,
    markAllAsRead,
    loadMore,
    refresh,
    requestPermission,
    getUnreadCount,
    getNotificationsByType,
    isConnected
  };
};

// Hook simplifié pour usage basique
export const useNotificationCount = (userId: string, userRole: 'CLIENT' | 'VENDEUR' | 'ADMIN') => {
  const { stats, connectionStatus } = useNotifications({
    userId,
    userRole,
    enableSound: false,
    enableBrowserNotifications: false
  });

  return {
    count: stats.nonLues,
    total: stats.total,
    isConnected: connectionStatus === 'connected'
  };
};

// Hook pour notifications spécifiques à un type
export const useNotificationsByType = (
  userId: string, 
  userRole: 'CLIENT' | 'VENDEUR' | 'ADMIN',
  type: string
) => {
  const { notifications, getNotificationsByType, markAsRead } = useNotifications({
    userId,
    userRole
  });

  const typeNotifications = getNotificationsByType(type);
  const unreadCount = typeNotifications.filter(n => !n.lu).length;

  return {
    notifications: typeNotifications,
    unreadCount,
    markAsRead
  };
};