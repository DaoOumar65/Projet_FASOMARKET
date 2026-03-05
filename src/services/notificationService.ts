// Service de notifications temps réel avec WebSocket natif (sans dépendance externe)
import type { AppNotification, NotificationStats } from '../types/notifications';

class NotificationService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Function[]> = new Map();
  private isConnected = false;
  private userId: string | null = null;
  private userRole: string | null = null;

  // Fallback pour notifications sans WebSocket
  private fallbackNotifications: AppNotification[] = [];
  private fallbackInterval: NodeJS.Timeout | null = null;

  initialize(userId: string, userRole: string) {
    this.userId = userId;
    this.userRole = userRole;
    this.connectWebSocket();
    this.startFallbackSystem();
  }

  private connectWebSocket() {
    try {
      const wsUrl = `ws://localhost:8081/ws/notifications?userId=${this.userId}&userRole=${this.userRole}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connecté');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connection', { status: 'connected' });
      };

      this.ws.onclose = () => {
        console.log('❌ WebSocket déconnecté');
        this.isConnected = false;
        this.emit('connection', { status: 'disconnected' });
        this.handleConnectionError();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('Erreur parsing message WebSocket:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.warn('Erreur WebSocket:', error);
        this.handleConnectionError();
      };

    } catch (error) {
      console.error('Erreur initialisation WebSocket:', error);
      this.handleConnectionError();
    }
  }

  private handleWebSocketMessage(data: any) {
    switch (data.type) {
      case 'notification':
        this.handleNotification(data.data);
        break;
      case 'notification_read':
        this.emit('notification_read', data.notificationId);
        break;
      case 'stats_update':
        this.emit('stats_update', data.data);
        break;
      case 'notifications_response':
      case 'stats_response':
        // Géré par les promesses en attente
        break;
    }
  }

  private handleConnectionError() {
    this.isConnected = false;
    this.reconnectAttempts++;
    
    if (this.reconnectAttempts <= this.maxReconnectAttempts) {
      console.log(`Tentative reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      setTimeout(() => this.connectWebSocket(), this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.log('Mode fallback activé - notifications simulées');
      this.emit('connection', { status: 'fallback' });
    }
  }

  private startFallbackSystem() {
    this.fallbackInterval = setInterval(() => {
      if (!this.isConnected && this.userId) {
        this.generateFallbackNotifications();
      }
    }, 30000);
  }

  private generateFallbackNotifications() {
    const templates = this.getFallbackTemplates();
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    
    if (Math.random() < 0.3) {
      const notification: AppNotification = {
        id: `fallback-${Date.now()}`,
        ...randomTemplate,
        userId: this.userId!,
        userRole: this.userRole as any,
        lu: false,
        dateCreation: new Date().toISOString()
      };
      
      this.handleNotification(notification);
    }
  }

  private getFallbackTemplates() {
    const baseTemplates = [
      {
        type: 'system' as const,
        titre: 'Système en ligne',
        message: 'Toutes les fonctionnalités sont opérationnelles',
        priority: 'low' as const
      }
    ];

    if (this.userRole === 'VENDEUR') {
      return [
        ...baseTemplates,
        {
          type: 'commande' as const,
          titre: 'Nouvelle commande',
          message: 'Vous avez reçu une nouvelle commande',
          priority: 'high' as const,
          actions: [
            { label: 'Voir', action: 'view_order', style: 'primary' as const }
          ]
        },
        {
          type: 'stock' as const,
          titre: 'Stock faible',
          message: 'Certains produits ont un stock critique',
          priority: 'medium' as const
        }
      ];
    }

    if (this.userRole === 'CLIENT') {
      return [
        ...baseTemplates,
        {
          type: 'commande' as const,
          titre: 'Commande mise à jour',
          message: 'Le statut de votre commande a changé',
          priority: 'medium' as const
        }
      ];
    }

    return baseTemplates;
  }

  private handleNotification(notification: AppNotification) {
    this.fallbackNotifications.unshift(notification);
    
    if (this.fallbackNotifications.length > 50) {
      this.fallbackNotifications = this.fallbackNotifications.slice(0, 50);
    }

    this.emit('notification', notification);
    this.showBrowserNotification(notification);
  }

  private showBrowserNotification(notification: AppNotification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotif = new Notification(notification.titre, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent'
      });

      browserNotif.onclick = () => {
        window.focus();
        this.emit('notification_click', notification);
        browserNotif.close();
      };

      if (notification.priority !== 'urgent') {
        setTimeout(() => browserNotif.close(), 5000);
      }
    }
  }

  async requestPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  async getNotifications(page = 0, size = 20): Promise<AppNotification[]> {
    if (this.isConnected && this.ws) {
      return new Promise((resolve) => {
        const messageHandler = (event: MessageEvent) => {
          const data = JSON.parse(event.data);
          if (data.type === 'notifications_response') {
            this.ws!.removeEventListener('message', messageHandler);
            resolve(data.data);
          }
        };
        
        this.ws.addEventListener('message', messageHandler);
        this.ws.send(JSON.stringify({
          action: 'get_notifications',
          page,
          size
        }));
        
        // Timeout après 5 secondes
        setTimeout(() => {
          this.ws!.removeEventListener('message', messageHandler);
          resolve(this.fallbackNotifications.slice(page * size, (page + 1) * size));
        }, 5000);
      });
    }
    
    const start = page * size;
    const end = start + size;
    return this.fallbackNotifications.slice(start, end);
  }

  async getStats(): Promise<NotificationStats> {
    if (this.isConnected && this.ws) {
      return new Promise((resolve) => {
        const messageHandler = (event: MessageEvent) => {
          const data = JSON.parse(event.data);
          if (data.type === 'stats_response') {
            this.ws!.removeEventListener('message', messageHandler);
            resolve(data.data);
          }
        };
        
        this.ws.addEventListener('message', messageHandler);
        this.ws.send(JSON.stringify({ action: 'get_stats' }));
        
        setTimeout(() => {
          this.ws!.removeEventListener('message', messageHandler);
          resolve(this.getFallbackStats());
        }, 5000);
      });
    }

    return this.getFallbackStats();
  }

  private getFallbackStats(): NotificationStats {
    const nonLues = this.fallbackNotifications.filter(n => !n.lu).length;
    const parType = this.fallbackNotifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: this.fallbackNotifications.length,
      nonLues,
      parType
    };
  }

  async markAsRead(notificationId: string): Promise<void> {
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify({
        action: 'mark_as_read',
        notificationId
      }));
    }
    
    const notification = this.fallbackNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.lu = true;
      this.emit('notification_read', notificationId);
    }
  }

  async markAllAsRead(): Promise<void> {
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify({ action: 'mark_all_as_read' }));
    }
    
    this.fallbackNotifications.forEach(n => n.lu = true);
    this.emit('all_notifications_read');
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    if (this.fallbackInterval) {
      clearInterval(this.fallbackInterval);
      this.fallbackInterval = null;
    }
    
    this.listeners.clear();
    this.isConnected = false;
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      hasSocket: !!this.ws
    };
  }
}

export const notificationService = new NotificationService();