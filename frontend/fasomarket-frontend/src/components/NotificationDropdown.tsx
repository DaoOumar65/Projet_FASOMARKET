import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotificationStore } from '../store/notifications';
import { useAuthStore } from '../store';

const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, loading, fetchNotifications, markAsRead, fetchUnreadCount } = useNotificationStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000); // Vérifier toutes les 30s
      return () => clearInterval(interval);
    }
  }, [fetchUnreadCount, isAuthenticated]);

  // Ajouter les styles CSS pour les animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Ne pas afficher le composant si l'utilisateur n'est pas connecté
  if (!isAuthenticated) {
    return null;
  }

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifications();
    }
  };

  const handleMarkAsRead = async (id: number) => {
    await markAsRead(id);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SUCCESS': return '#10b981';
      case 'WARNING': return '#f59e0b';
      case 'ERROR': return '#ef4444';
      default: return '#3b82f6';
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={handleToggle}
        style={{
          position: 'relative',
          padding: '8px',
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          color: '#374151',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f3f4f6';
          e.currentTarget.style.color = '#2563eb';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#374151';
        }}
        title={`${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            backgroundColor: '#ef4444',
            color: 'white',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            fontSize: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Overlay pour fermer le dropdown */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 999
            }}
            onClick={() => setIsOpen(false)}
          />
          
          <div style={{
            position: 'absolute',
            top: '100%',
            right: '0',
            width: '320px',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            maxHeight: '400px',
            overflowY: 'auto',
            marginTop: '8px'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e5e7eb',
              fontWeight: '600',
              color: '#111827',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span style={{
                  padding: '4px 8px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {unreadCount}
                </span>
              )}
            </div>

            {loading ? (
              <div style={{ 
                padding: '40px 20px', 
                textAlign: 'center', 
                color: '#6b7280',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  border: '2px solid #e5e7eb',
                  borderTop: '2px solid #2563eb',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Chargement...
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ 
                padding: '40px 20px', 
                textAlign: 'center', 
                color: '#6b7280',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Bell size={32} style={{ color: '#d1d5db' }} />
                <div>
                  <p style={{ margin: '0 0 4px 0', fontWeight: '500' }}>Aucune notification</p>
                  <p style={{ margin: 0, fontSize: '14px' }}>Vous êtes à jour !</p>
                </div>
              </div>
            ) : (
              <>
                {notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => !notification.lue && handleMarkAsRead(notification.id)}
                    style={{
                      padding: '16px 20px',
                      borderBottom: '1px solid #f3f4f6',
                      cursor: notification.lue ? 'default' : 'pointer',
                      backgroundColor: notification.lue ? 'white' : '#f8fafc',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!notification.lue) {
                        e.currentTarget.style.backgroundColor = '#f1f5f9';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = notification.lue ? 'white' : '#f8fafc';
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px'
                    }}>
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: getTypeColor(notification.type),
                          marginTop: '6px',
                          flexShrink: 0
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontWeight: notification.lue ? '500' : '600',
                          color: '#111827',
                          fontSize: '14px',
                          marginBottom: '4px',
                          lineHeight: '1.3'
                        }}>
                          {notification.titre}
                        </div>
                        <div style={{
                          color: '#6b7280',
                          fontSize: '13px',
                          lineHeight: '1.4',
                          marginBottom: '8px'
                        }}>
                          {notification.message}
                        </div>
                        <div style={{
                          color: '#9ca3af',
                          fontSize: '11px'
                        }}>
                          {new Date(notification.dateCreation).toLocaleString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      {!notification.lue && (
                        <div style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: '#2563eb',
                          marginTop: '8px',
                          flexShrink: 0
                        }} />
                      )}
                    </div>
                  </div>
                ))}
                
                {notifications.length > 10 && (
                  <div style={{
                    padding: '12px 20px',
                    textAlign: 'center',
                    borderTop: '1px solid #e5e7eb',
                    backgroundColor: '#f8fafc'
                  }}>
                    <span style={{
                      fontSize: '12px',
                      color: '#6b7280'
                    }}>
                      +{notifications.length - 10} autres notifications
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;