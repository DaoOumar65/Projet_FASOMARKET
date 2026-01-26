import { useState, useEffect } from 'react';

interface Notification {
  id: string;
  type: 'NOUVELLE_COMMANDE' | 'STOCK_FAIBLE' | 'PAIEMENT_RECU';
  message: string;
  lu: boolean;
  createdAt: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch('http://localhost:8081/api/vendeur/notifications', {
        headers: { 'X-User-Id': userId || '' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Erreur notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const marquerCommeLu = async (notificationId: string) => {
    try {
      const userId = localStorage.getItem('userId');
      await fetch(`http://localhost:8081/api/vendeur/notifications/${notificationId}/lire`, {
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
    
    // Signaler la connexion du vendeur
    const signalerConnexion = async () => {
      try {
        const userId = localStorage.getItem('userId');
        await fetch('http://localhost:8081/api/vendeur/connexion', {
          method: 'POST',
          headers: { 'X-User-Id': userId || '' }
        });
      } catch (error) {
        console.error('Erreur signalement connexion:', error);
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