import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  _id: string;
  message: string;
  type: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchNotifications = useCallback(async () => {
    // if (!user) return;
    // try {
    //   const token = localStorage.getItem('droneflux-token');
    //   const response = await fetch(`${API_URL}/api/notifications`, {
    //     headers: { 'Authorization': `Bearer ${token}` },
    //   });
    //   if (response.ok) {
    //     const data = await response.json();
    //     setNotifications(data.data);
    //     setUnreadCount(data.data.filter((n: Notification) => !n.read).length);
    //   }
    // } catch (error) {
    //   console.error('Failed to fetch notifications', error);
    // }
  }, [user, API_URL]);

  useEffect(() => {
    // fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    // if (!user) return;

    // const socket: Socket = io(API_URL, { 
    //     query: { userId: user.id },
    //     withCredentials: true 
    // });

    // socket.on('connect', () => {
    //     console.log('Socket connected for notifications');
    //     socket.emit('join-user-room', user.id);
    // });

    // socket.on('new_notification', (notification: Notification) => {
    //   setNotifications(prev => [notification, ...prev]);
    //   setUnreadCount(prev => prev + 1);
    //   toast({
    //     title: 'New Notification',
    //     description: notification.message,
    //   });
    // });

    // return () => {
    //   socket.disconnect();
    // };
  }, [user, API_URL, toast]);

  const markAsRead = async (id: string) => {
    // try {
    //   const token = localStorage.getItem('droneflux-token');
    //   await fetch(`${API_URL}/api/notifications/${id}/read`, { 
    //       method: 'PUT',
    //       headers: { 'Authorization': `Bearer ${token}` },
    //   });
    //   setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    //   setUnreadCount(prev => Math.max(0, prev - 1));
    // } catch (error) {
    //   console.error('Failed to mark notification as read', error);
    // }
  };

  const markAllAsRead = async () => {
    // try {
    //     const token = localStorage.getItem('droneflux-token');
    //     await fetch(`${API_URL}/api/notifications/readall`, { 
    //         method: 'PUT',
    //         headers: { 'Authorization': `Bearer ${token}` },
    //     });
    //     setNotifications(notifications.map(n => ({ ...n, read: true })));
    //     setUnreadCount(0);
    // } catch (error) {
    //     console.error('Failed to mark all notifications as read', error);
    // }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifier = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifier must be used within a NotificationProvider');
  }
  return context;
};
