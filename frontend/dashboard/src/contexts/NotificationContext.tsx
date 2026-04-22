import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

export type NotificationType = 'critical' | 'warning' | 'info' | 'success';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  autoDismiss?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (type: NotificationType, title: string, message: string, autoDismiss?: boolean) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((type: NotificationType, title: string, message: string, autoDismiss = true) => {
    const id = `notif-${Date.now()}-${Math.random()}`;
    const notif: Notification = { id, type, title, message, timestamp: new Date(), read: false, autoDismiss };
    setNotifications(prev => [notif, ...prev]);
    if (autoDismiss) {
      setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 5000);
    }
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => setNotifications([]), []);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const ws_simulation = setInterval(() => {
      const random = Math.random();
      if (random > 0.85) {
        const messages: [string, string, string][] = [
          ['critical', 'Critical Alert', 'Fire detected in Building A - Sector 3'],
          ['warning', 'High Load', 'CPU usage exceeding 85% on server cluster'],
          ['info', 'System Update', 'AI model retrained with 94.5% accuracy'],
          ['warning', 'New Incident', 'Gas leak reported - Zone B'],
          ['critical', 'Emergency', 'Multiple sensors triggered in Area 7'],
        ];
        const [type, title, message] = messages[Math.floor(Math.random() * messages.length)];
        addNotification(type as NotificationType, title, message);
      }
    }, 8000);
    return () => clearInterval(ws_simulation);
  }, [addNotification]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, removeNotification, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
};
