import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { FiBell, FiPackage, FiCheckCircle } from 'react-icons/fi';
import Loading from '../../components/common/Loading';

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

    return notifDate.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
};

const AdminNotifications = () => {
    const { notifications, loading, unreadCount, markAllAsRead, fetchNotifications } = useNotification();
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleClick = async (n) => {
        await markAllAsRead();
        if (n.path) navigate(n.path);
    };

    if (loading) return <Loading />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Thông báo</h1>
                    <p className="text-sm text-gray-500">{notifications.length} thông báo</p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                    >
                        <FiCheckCircle size={16} />
                        Đánh dấu đã đọc
                    </button>
                )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {notifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <FiBell size={32} className="text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">Không có thông báo nào</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {notifications.map((n) => (
                            <div
                                key={n.id}
                                onClick={() => handleClick(n)}
                                className={`p-4 flex items-start gap-4 cursor-pointer hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-indigo-50/30' : ''}`}
                            >
                                <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${!n.isRead ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    {n.type === 'NEW_ORDER' ? <FiPackage size={18} /> : <FiBell size={18} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-4 mb-1">
                                        <p className={`text-sm ${!n.isRead ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                                            {n.title}
                                        </p>
                                        <span className="text-xs text-gray-400 whitespace-nowrap">
                                            {formatDate(n.createdAt)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 line-clamp-2">{n.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminNotifications;
