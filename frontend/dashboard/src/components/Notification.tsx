import React, { useEffect, useState } from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onDismiss: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className={`notification ${type}`} onClick={onDismiss} style={{ cursor: 'pointer' }}>
      {message}
    </div>
  );
};

export interface NotificationItem {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

let notifIdCounter = 1;

interface NotificationContainerProps {
  notifications: NotificationItem[];
  onDismiss: (id: number) => void;
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({ notifications, onDismiss }) => {
  return (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 2000, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {notifications.map((n) => (
        <Notification key={n.id} message={n.message} type={n.type} onDismiss={() => onDismiss(n.id)} />
      ))}
    </div>
  );
};

export const createNotification = (notifications: NotificationItem[], message: string, type: 'success' | 'error' | 'warning' | 'info'): NotificationItem[] => {
  const newNotif: NotificationItem = { id: notifIdCounter++, message, type };
  return [...notifications, newNotif].slice(-5); // Keep max 5
};

export default Notification;
