import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationService } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { FiBell, FiPackage, FiCheck, FiCheckCircle, FiClock, FiTrash2 } from 'react-icons/fi';
import Loading from '../components/common/Loading';
import { toast } from 'react-toastify';

const formatDate = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return notifDate.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { fetchUnreadCount } = useNotification();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await notificationService.getAll({ page: 0, size: 50 });
            setNotifications(response.data.data?.content || []);
        } catch (error) {
            toast.error('Không thể tải thông báo');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, read: true } : n
            ));
            fetchUnreadCount();
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            fetchUnreadCount();
            toast.success('Đã đánh dấu tất cả đã đọc');
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'ORDER':
                return <FiPackage className="text-indigo-500" />;
            case 'SYSTEM':
                return <FiBell className="text-purple-500" />;
            default:
                return <FiBell className="text-gray-500" />;
        }
    };

    const getNotificationLink = (notification) => {
        if (notification.type === 'ORDER' && notification.referenceId) {
            return `/orders`;
        }
        return null;
    };

    if (loading) return <Loading />;

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Thông báo</h1>
                        {unreadCount > 0 && (
                            <p className="text-gray-500 mt-1">{unreadCount} thông báo chưa đọc</p>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                        >
                            <FiCheckCircle />
                            Đánh dấu tất cả đã đọc
                        </button>
                    )}
                </div>

                {notifications.length === 0 ? (
                    <div className="bg-white rounded-2xl p-16 text-center shadow-sm">
                        <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                            <FiBell size={32} className="text-gray-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Chưa có thông báo</h2>
                        <p className="text-gray-500">Bạn sẽ nhận được thông báo khi có cập nhật mới</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((notification) => {
                            const link = getNotificationLink(notification);
                            const Content = (
                                <div
                                    className={`bg-white rounded-2xl p-5 shadow-sm transition-all hover:shadow-md ${!notification.read ? 'border-l-4 border-indigo-500' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${!notification.read ? 'bg-indigo-100' : 'bg-gray-100'
                                            }`}>
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-gray-900 ${!notification.read ? 'font-semibold' : ''}`}>
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                                    <FiClock size={14} />
                                                    {formatDate(notification.createdAt)}
                                                </span>
                                                {notification.read && (
                                                    <span className="text-sm text-green-500 flex items-center gap-1">
                                                        <FiCheck size={14} />
                                                        Đã đọc
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {!notification.read && (
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleMarkAsRead(notification.id);
                                                }}
                                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title="Đánh dấu đã đọc"
                                            >
                                                <FiCheck size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );

                            return link ? (
                                <Link key={notification.id} to={link} onClick={() => !notification.read && handleMarkAsRead(notification.id)}>
                                    {Content}
                                </Link>
                            ) : (
                                <div key={notification.id}>
                                    {Content}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
