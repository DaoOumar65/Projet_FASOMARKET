import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCheck, Trash2, Settings, Wifi, WifiOff } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import toast from 'react-hot-toast';

// Types définis localement
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

interface Props {
  userId: string;
  userRole: 'CLIENT' | 'VENDEUR' | 'ADMIN';
}

const NotificationCenter: React.FC<Props> = ({ userId, userRole }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({ total: 0, nonLues: 0, parType: {} });
  const [showPanel, setShowPanel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'fallback'>('disconnected');
  const [hasPermission, setHasPermission] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    initializeNotifications();
    return () => notificationService.disconnect();
  }, [userId, userRole]);

  const initializeNotifications = async () => {
    // Initialiser le service
    notificationService.initialize(userId, userRole);

    // Demander permission notifications browser
    const permission = await notificationService.requestPermission();
    setHasPermission(permission);

    // Écouter les événements
    notificationService.on('connection', handleConnectionChange);
    notificationService.on('notification', handleNewNotification);
    notificationService.on('notification_read', handleNotificationRead);
    notificationService.on('stats_update', handleStatsUpdate);
    notificationService.on('notification_click', handleNotificationClick);

    // Charger notifications initiales
    loadNotifications();
    loadStats();
  };

  const handleConnectionChange = (data: { status: string }) => {
    setConnectionStatus(data.status as any);
    
    if (data.status === 'connected') {
      toast.success('Notifications temps réel activées');
    } else if (data.status === 'fallback') {
      toast('Mode hors ligne - notifications simulées', { icon: '📱' });
    }
  };

  const handleNewNotification = (notification: AppNotification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 49)]);
    setStats(prev => ({
      ...prev,
      total: prev.total + 1,
      nonLues: prev.nonLues + 1,
      parType: {
        ...prev.parType,
        [notification.type]: (prev.parType[notification.type] || 0) + 1
      }
    }));

    // Son de notification
    playNotificationSound(notification.priority);

    // Toast pour notifications importantes
    if (notification.priority === 'high' || notification.priority === 'urgent') {
      toast(notification.message, {
        icon: getNotificationIcon(notification.type),
        duration: notification.priority === 'urgent' ? 8000 : 4000
      });
    }
  };

  const handleNotificationRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, lu: true } : n)
    );
    setStats(prev => ({ ...prev, nonLues: Math.max(0, prev.nonLues - 1) }));
  };

  const handleStatsUpdate = (newStats: NotificationStats) => {
    setStats(newStats);
  };

  const handleNotificationClick = (notification: AppNotification) => {
    setShowPanel(true);
    markAsRead(notification.id);
  };

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications(0, 20);
      setNotifications(data);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await notificationService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
    } catch (error) {
      console.error('Erreur marquage lu:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
      setStats(prev => ({ ...prev, nonLues: 0 }));
      toast.success('Toutes les notifications marquées comme lues');
    } catch (error) {
      console.error('Erreur marquage tout lu:', error);
    }
  };

  const playNotificationSound = (priority: string) => {
    if (audioRef.current) {
      // Différents sons selon la priorité
      const frequency = priority === 'urgent' ? 800 : priority === 'high' ? 600 : 400;
      
      // Générer un son simple avec Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    }
  };

  const getNotificationIcon = (type: string) => {
    const icons = {
      commande: '🛒',
      stock: '📦',
      validation: '✅',
      paiement: '💳',
      message: '💬',
      system: '⚙️'
    };
    return icons[type as keyof typeof icons] || '🔔';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: '#6b7280',
      medium: '#2563eb',
      high: '#f59e0b',
      urgent: '#dc2626'
    };
    return colors[priority as keyof typeof colors] || '#6b7280';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}j`;
    return date.toLocaleDateString();
  };

  return (
    <div className="notification-center">
      <audio ref={audioRef} />
      
      {/* Bouton de notification */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className={`notification-button ${stats.nonLues > 0 ? 'has-unread' : ''}`}
      >
        <Bell size={20} />
        {stats.nonLues > 0 && (
          <span className="notification-badge">
            {stats.nonLues > 99 ? '99+' : stats.nonLues}
          </span>
        )}
        
        {/* Indicateur de connexion */}
        <div className={`connection-indicator ${connectionStatus}`}>
          {connectionStatus === 'connected' ? (
            <Wifi size={12} />
          ) : connectionStatus === 'fallback' ? (
            <WifiOff size={12} />
          ) : (
            <div className="connecting-dot" />
          )}
        </div>
      </button>

      {/* Panneau de notifications */}
      {showPanel && (
        <div className="notification-panel">
          <div className="panel-header">
            <div className="header-left">
              <h3>Notifications</h3>
              <span className="connection-status">
                {connectionStatus === 'connected' && '🟢 Temps réel'}
                {connectionStatus === 'fallback' && '🟡 Mode hors ligne'}
                {connectionStatus === 'disconnected' && '🔴 Déconnecté'}
              </span>
            </div>
            
            <div className="header-actions">
              {stats.nonLues > 0 && (
                <button onClick={markAllAsRead} className="mark-all-read">
                  <CheckCheck size={16} />
                </button>
              )}
              <button onClick={() => setShowPanel(false)} className="close-panel">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className="stats-bar">
            <div className="stat-item">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.nonLues}</span>
              <span className="stat-label">Non lues</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{Object.keys(stats.parType).length}</span>
              <span className="stat-label">Types</span>
            </div>
          </div>

          {/* Liste des notifications */}
          <div className="notifications-list">
            {loading ? (
              <div className="loading-state">
                <div className="spinner" />
                <p>Chargement...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="empty-state">
                <Bell size={48} color="#d1d5db" />
                <h4>Aucune notification</h4>
                <p>Vous êtes à jour !</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.lu ? 'unread' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="notification-content">
                    <div className="notification-header">
                      <div className="notification-icon">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="notification-meta">
                        <span className="notification-title">{notification.titre}</span>
                        <span className="notification-time">
                          {formatTimeAgo(notification.dateCreation)}
                        </span>
                      </div>
                      <div
                        className="priority-indicator"
                        style={{ backgroundColor: getPriorityColor(notification.priority) }}
                      />
                    </div>
                    
                    <p className="notification-message">{notification.message}</p>
                    
                    {notification.actions && notification.actions.length > 0 && (
                      <div className="notification-actions">
                        {notification.actions.map((action, index) => (
                          <button
                            key={index}
                            className={`action-btn ${action.style}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              // Gérer l'action
                              console.log('Action:', action.action, notification.data);
                            }}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {!notification.lu && <div className="unread-dot" />}
                </div>
              ))
            )}
          </div>

          {/* Pied de panneau */}
          <div className="panel-footer">
            <button className="footer-btn">
              <Settings size={14} />
              Paramètres
            </button>
            {!hasPermission && (
              <button 
                onClick={() => notificationService.requestPermission()}
                className="footer-btn permission"
              >
                🔔 Activer notifications
              </button>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .notification-center {
          position: relative;
        }

        .notification-button {
          position: relative;
          background: none;
          border: none;
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          color: #6b7280;
        }

        .notification-button:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .notification-button.has-unread {
          color: #2563eb;
        }

        .notification-badge {
          position: absolute;
          top: 0;
          right: 0;
          background: #dc2626;
          color: white;
          border-radius: 10px;
          padding: 2px 6px;
          font-size: 10px;
          font-weight: bold;
          min-width: 16px;
          text-align: center;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .connection-indicator {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .connection-indicator.connected {
          background: #16a34a;
          color: white;
        }

        .connection-indicator.fallback {
          background: #f59e0b;
          color: white;
        }

        .connection-indicator.disconnected {
          background: #dc2626;
        }

        .connecting-dot {
          width: 6px;
          height: 6px;
          background: white;
          border-radius: 50%;
          animation: blink 1s infinite;
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.3; }
        }

        .notification-panel {
          position: absolute;
          top: 100%;
          right: 0;
          width: 380px;
          max-height: 600px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          border: 1px solid #e5e7eb;
          z-index: 1000;
          overflow: hidden;
          margin-top: 8px;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #f3f4f6;
          background: #fafafa;
        }

        .header-left h3 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
          color: #111827;
        }

        .connection-status {
          font-size: 12px;
          color: #6b7280;
        }

        .header-actions {
          display: flex;
          gap: 8px;
        }

        .mark-all-read, .close-panel {
          background: none;
          border: none;
          padding: 6px;
          border-radius: 6px;
          cursor: pointer;
          color: #6b7280;
          transition: all 0.2s;
        }

        .mark-all-read:hover, .close-panel:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .stats-bar {
          display: flex;
          padding: 12px 20px;
          background: #f9fafb;
          border-bottom: 1px solid #f3f4f6;
        }

        .stat-item {
          flex: 1;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .stat-value {
          font-size: 18px;
          font-weight: bold;
          color: #111827;
        }

        .stat-label {
          font-size: 11px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .notifications-list {
          max-height: 400px;
          overflow-y: auto;
        }

        .loading-state, .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          color: #6b7280;
        }

        .spinner {
          width: 24px;
          height: 24px;
          border: 2px solid #f3f4f6;
          border-top: 2px solid #2563eb;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 12px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .empty-state h4 {
          margin: 12px 0 4px 0;
          font-size: 16px;
          color: #374151;
        }

        .empty-state p {
          margin: 0;
          font-size: 14px;
        }

        .notification-item {
          position: relative;
          padding: 16px 20px;
          border-bottom: 1px solid #f3f4f6;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .notification-item:hover {
          background: #f9fafb;
        }

        .notification-item.unread {
          background: #eff6ff;
          border-left: 3px solid #2563eb;
        }

        .notification-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .notification-icon {
          font-size: 20px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          border-radius: 8px;
        }

        .notification-meta {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .notification-title {
          font-weight: 500;
          color: #111827;
          font-size: 14px;
        }

        .notification-time {
          font-size: 12px;
          color: #6b7280;
        }

        .priority-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .notification-message {
          margin: 0 0 12px 44px;
          font-size: 13px;
          color: #374151;
          line-height: 1.4;
        }

        .notification-actions {
          display: flex;
          gap: 8px;
          margin-left: 44px;
        }

        .action-btn {
          padding: 4px 12px;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn.primary {
          background: #2563eb;
          color: white;
        }

        .action-btn.secondary {
          background: #f3f4f6;
          color: #374151;
        }

        .action-btn.danger {
          background: #dc2626;
          color: white;
        }

        .unread-dot {
          position: absolute;
          top: 20px;
          right: 16px;
          width: 8px;
          height: 8px;
          background: #2563eb;
          border-radius: 50%;
        }

        .panel-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 20px;
          border-top: 1px solid #f3f4f6;
          background: #fafafa;
        }

        .footer-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
        }

        .footer-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .footer-btn.permission {
          background: #fef3c7;
          color: #92400e;
        }
      `}</style>
    </div>
  );
};

export default NotificationCenter;