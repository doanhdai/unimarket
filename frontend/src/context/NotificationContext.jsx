import { createContext, useContext, useState, useEffect } from 'react';
import { notificationService } from '../services/api';
import websocketService from '../services/websocket';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchNotifications();
            fetchUnreadCount();

            websocketService.connect(user.email, handleNewNotification);

            const pollingInterval = setInterval(() => {
                fetchNotifications();
                fetchUnreadCount();
            }, 10000);

            return () => {
                websocketService.disconnect();
                clearInterval(pollingInterval);
            };
        }
    }, [user]);

    const handleNewNotification = (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
        toast.info(notification.title);
    };

    const fetchNotifications = async () => {
        try {
            const response = await notificationService.getAll({ page: 0, size: 20 });
            setNotifications(response.data.data?.content || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await notificationService.getUnreadCount();
            setUnreadCount(response.data.data || 0);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const markAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            markAsRead,
            markAllAsRead,
            fetchNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
