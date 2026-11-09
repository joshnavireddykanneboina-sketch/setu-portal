// Notification Service for SETU Platform
import { find, insert, update } from '../../../database/db.js';

export function getNotificationsForUser(userId) {
  return find('notifications', n => n.userId === userId);
}

export function createNotification({ userId, title, message, type = 'info', metadata = null }) {
  const notif = {
    id: `NOTIF-${Date.now()}`,
    userId,
    title,
    message,
    type,
    read: false,
    metadata,
    timestamp: new Date().toISOString()
  };
  insert('notifications', notif);
  return notif;
}

export function markAsRead(notifId) {
  return update('notifications', notifId, { read: true });
}
