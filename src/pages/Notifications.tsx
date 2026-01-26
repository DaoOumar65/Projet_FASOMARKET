import { useEffect, useState } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';

interface Notification {
  id: string;
  titre: string;
  message: string;
  type: string;
  lu: boolean;
  dateCreation: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch('http://localhost:8081/api/notifications', {
        headers: { 'X-User-Id': userId || '' }
      });
      if (response.ok) {
        setNotifications(await response.json());
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`http://localhost:8081/api/notifications/${id}/lire`, {
        method: 'PUT',
        headers: { 'X-User-Id': userId || '' }
      });
      if (response.ok) {
        setNotifications(notifications.map(n => n.id === id ? { ...n, lu: true } : n));
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`http://localhost:8081/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'X-User-Id': userId || '' }
      });
      if (response.ok) {
        setNotifications(notifications.filter(n => n.id !== id));
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch('http://localhost:8081/api/notifications/lire-tout', {
        method: 'PUT',
        headers: { 'X-User-Id': userId || '' }
      });
      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.lu)
    : notifications;

  const typeColors: Record<string, string> = {
    COMMANDE: 'bg-blue-100 text-blue-800',
    PRODUIT: 'bg-green-100 text-green-800',
    PAIEMENT: 'bg-yellow-100 text-yellow-800',
    SYSTEME: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <button
          onClick={markAllAsRead}
          className="text-blue-600 hover:underline flex items-center"
        >
          <Check className="w-4 h-4 mr-1" />
          Tout marquer comme lu
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Toutes ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg ${filter === 'unread' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Non lues ({notifications.filter(n => !n.lu).length})
        </button>
      </div>

      <div className="space-y-3">
        {filteredNotifications.map((notif) => (
          <div
            key={notif.id}
            className={`bg-white rounded-lg shadow-md p-4 ${!notif.lu ? 'border-l-4 border-blue-600' : ''}`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded text-xs ${typeColors[notif.type] || typeColors.SYSTEME}`}>
                    {notif.type}
                  </span>
                  {!notif.lu && (
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  )}
                </div>
                <h3 className="font-bold mb-1">{notif.titre}</h3>
                <p className="text-gray-600 text-sm mb-2">{notif.message}</p>
                <p className="text-xs text-gray-400">
                  {new Date(notif.dateCreation).toLocaleString('fr-FR')}
                </p>
              </div>
              <div className="flex gap-2">
                {!notif.lu && (
                  <button
                    onClick={() => markAsRead(notif.id)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Marquer comme lu"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notif.id)}
                  className="text-red-500 hover:text-red-700"
                  title="Supprimer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Aucune notification</p>
          </div>
        )}
      </div>
    </div>
  );
}
