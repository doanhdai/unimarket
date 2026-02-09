import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationService } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { FiBell, FiPackage, FiCheck, FiCheckCircle, FiClock } from 'react-icons/fi';
import Loading from '../../components/common/Loading';
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

    return notifDate.toLocaleDateString('vi-VN', { year: 'numeric', month: 'short', day: 'numeric' });
};

const AccountNotifications = () => {
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
            setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
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
            case 'ORDER': return <FiPackage className="text-indigo-500" />;
            default: return <FiBell className="text-gray-500" />;
        }
    };

    if (loading) return <Loading />;

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Thông báo</h1>
                        {unreadCount > 0 && <p className="text-gray-500 text-sm mt-1">{unreadCount} chưa đọc</p>}
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors text-sm font-medium"
                        >
                            <FiCheckCircle size={18} />
                            Đánh dấu tất cả đã đọc
                        </button>
                    )}
                </div>
            </div>

            {notifications.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                    <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <FiBell size={32} className="text-gray-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Chưa có thông báo</h2>
                    <p className="text-gray-500">Bạn sẽ nhận được thông báo khi có cập nhật mới</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`bg-white rounded-2xl shadow-sm p-4 transition-all hover:shadow-md ${!notification.read ? 'border-l-4 border-indigo-500' : ''
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${!notification.read ? 'bg-indigo-100' : 'bg-gray-100'
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
                                        onClick={() => handleMarkAsRead(notification.id)}
                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        title="Đánh dấu đã đọc"
                                    >
                                        <FiCheck size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AccountNotifications;
