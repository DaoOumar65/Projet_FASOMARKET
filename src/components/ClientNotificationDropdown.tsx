import { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useClientNotifications } from '../hooks/useClientNotifications';

export default function ClientNotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, nombreNonLues, marquerCommeLu } = useClientNotifications();

  const handleNotificationClick = (notificationId: string) => {
    marquerCommeLu(notificationId);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          padding: '8px',
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          color: '#6b7280'
        }}
        onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#f3f4f6'}
        onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
      >
        <Bell size={20} />
        {nombreNonLues > 0 && (
          <span style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            minWidth: '18px',
            height: '18px',
            backgroundColor: '#ef4444',
            color: 'white',
            borderRadius: '9px',
            fontSize: '11px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px'
          }}>
            {nombreNonLues > 99 ? '99+' : nombreNonLues}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 40
            }}
            onClick={() => setIsOpen(false)}
          />
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            width: '320px',
            maxHeight: '400px',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            zIndex: 50,
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                Notifications ({nombreNonLues})
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  padding: '4px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                <X size={16} />
              </button>
            </div>
            
            <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #f3f4f6',
                      cursor: 'pointer',
                      backgroundColor: notification.lu ? 'white' : '#eff6ff',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = notification.lu ? 'white' : '#eff6ff'}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: notification.lu ? 'transparent' : '#2563eb',
                        borderRadius: '50%',
                        marginTop: '6px',
                        flexShrink: 0
                      }} />
                      <div style={{ flex: 1 }}>
                        <p style={{
                          fontSize: '14px',
                          color: '#111827',
                          margin: '0 0 4px 0',
                          fontWeight: notification.lu ? '400' : '500'
                        }}>
                          {notification.message}
                        </p>
                        <p style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          margin: 0
                        }}>
                          {new Date(notification.createdAt).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{
                  padding: '32px 16px',
                  textAlign: 'center',
                  color: '#6b7280'
                }}>
                  <Bell size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                  <p style={{ margin: 0, fontSize: '14px' }}>Aucune notification</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}