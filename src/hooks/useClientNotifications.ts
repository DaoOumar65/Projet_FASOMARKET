import { useState, useEffect } from 'react';

interface ClientNotification {
  id: string;
  type: 'COMMANDE_CONFIRMEE' | 'COMMANDE_EXPEDIEE' | 'COMMANDE_LIVREE' | 'PROMOTION';
  message: string;
  lu: boolean;
  createdAt: string;
}

export const useClientNotifications = () => {
  const [notifications, setNotifications] = useState<ClientNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch('http://localhost:8081/api/client/notifications', {
        headers: { 'X-User-Id': userId || '' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Erreur notifications client:', error);
    } finally {
      setLoading(false);
    }
  };

  const marquerCommeLu = async (notificationId: string) => {
    try {
      const userId = localStorage.getItem('userId');
      await fetch(`http://localhost:8081/api/client/notifications/${notificationId}/lire`, {
        method: 'PUT',
        headers: { 'X-User-Id': userId || '' }
      });
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, lu: true } : n)
      );
    } catch (error) {
      console.error('Erreur marquer lu:', error);
    }
  };

  const nombreNonLues = notifications.filter(n => !n.lu).length;

  useEffect(() => {
    fetchNotifications();
    
    // Signaler la connexion du client
    const signalerConnexion = async () => {
      try {
        const userId = localStorage.getItem('userId');
        await fetch('http://localhost:8081/api/client/connexion', {
          method: 'POST',
          headers: { 'X-User-Id': userId || '' }
        });
      } catch (error) {
        console.error('Erreur signalement connexion client:', error);
      }
    };
    
    signalerConnexion();
    
    // Polling toutes les 30 secondes
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    notifications,
    nombreNonLues,
    loading,
    fetchNotifications,
    marquerCommeLu
  };
};