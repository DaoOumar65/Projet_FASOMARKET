import { useState } from 'react';
import { Bell, ShoppingCart, CreditCard, Truck, AlertTriangle, MessageSquare } from 'lucide-react';
import { useOrderNotifications } from '../hooks/useOrderNotifications';
import { formatDate } from '../utils/dateUtils';

const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead } = useOrderNotifications();
  const [showDropdown, setShowDropdown] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'ORDER': return <ShoppingCart size={16} style={{ color: '#2563eb' }} />;
      case 'PAYMENT': return <CreditCard size={16} style={{ color: '#16a34a' }} />;
      case 'DELIVERY': return <Truck size={16} style={{ color: '#d97706' }} />;
      case 'SYSTEM': return <AlertTriangle size={16} style={{ color: '#dc2626' }} />;
      default: return <MessageSquare size={16} style={{ color: '#6b7280' }} />;
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
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
        title="Notifications"
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f3f4f6';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
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
            fontWeight: 'bold'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 999
            }}
            onClick={() => setShowDropdown(false)}
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

            <div>
              {notifications.length === 0 ? (
                <div style={{ 
                  padding: '40px 20px', 
                  textAlign: 'center', 
                  color: '#6b7280' 
                }}>
                  <Bell size={32} style={{ color: '#d1d5db', margin: '0 auto 12px' }} />
                  <p style={{ margin: 0 }}>Aucune notification</p>
                </div>
              ) : (
                notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                    style={{
                      padding: '16px 20px',
                      borderBottom: '1px solid #f3f4f6',
                      cursor: notification.isRead ? 'default' : 'pointer',
                      backgroundColor: notification.isRead ? 'white' : '#f8fafc',
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px'
                    }}>
                      <div style={{ marginTop: '2px' }}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontWeight: notification.isRead ? '500' : '600',
                          color: '#111827',
                          fontSize: '14px',
                          marginBottom: '4px',
                          lineHeight: '1.3'
                        }}>
                          {notification.title}
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
                          {formatDate(notification.createdAt)}
                        </div>
                      </div>
                      {!notification.isRead && (
                        <div style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: '#2563eb',
                          marginTop: '8px'
                        }} />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;