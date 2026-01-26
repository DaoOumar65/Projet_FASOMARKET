import { useState, useEffect } from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export const useOrderNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/client/notifications', {
        headers: { 
          'X-User-Id': localStorage.getItem('userId') || '',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
      }
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`http://localhost:8081/api/client/notifications/${notificationId}/lue`, {
        method: 'PUT',
        headers: { 
          'X-User-Id': localStorage.getItem('userId') || '',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      loadNotifications();
    } catch (error) {
      console.error('Erreur marquage notification:', error);
    }
  };

  return { notifications, unreadCount, markAsRead, refresh: loadNotifications };
};