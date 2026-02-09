import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { FiGrid, FiUsers, FiUserCheck, FiPackage, FiShoppingCart, FiTag, FiSettings, FiLogOut, FiBell, FiChevronRight } from 'react-icons/fi';
import { useState } from 'react';

const menuItems = [
    { path: '/admin/dashboard', label: 'Tổng quan', icon: FiGrid },
    { path: '/admin/users', label: 'Người dùng', icon: FiUsers },
    { path: '/admin/sellers', label: 'Duyệt Seller', icon: FiUserCheck },
    { path: '/admin/products', label: 'Sản phẩm', icon: FiPackage },
    { path: '/admin/orders', label: 'Đơn hàng', icon: FiShoppingCart },
    { path: '/admin/categories', label: 'Danh mục', icon: FiTag },
];

const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const { notifications, unreadCount, markAllAsRead } = useNotification();
    const [showNotifPanel, setShowNotifPanel] = useState(false);
    const navigate = useNavigate();

    const handleNotifClick = async (n) => {
        await markAllAsRead();
        if (n.path) navigate(n.path);
        setShowNotifPanel(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <div className="flex">
                {/* Sidebar */}
                <aside className="w-72 min-h-screen bg-white border-r border-gray-100 fixed left-0 top-0 z-50">
                    <div className="p-6 h-full flex flex-col">
                        <div className="flex items-center gap-4 mb-10 px-2">
                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 rotate-3 hover:rotate-0 transition-transform cursor-pointer">
                                <img src="/logo.png" alt="UniMarket" className="h-20 w-auto invert brightness-0" />
                            </div>
                            <div>
                                <h1 className="font-black text-xl text-gray-900 tracking-tight text-nowrap">UniMarket</h1>
                                <p className="text-[10px] text-indigo-600 font-black tracking-[0.2em] uppercase opacity-70">Admin Panel</p>
                            </div>
                        </div>

                        <nav className="space-y-1 flex-1">
                            {menuItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 ${isActive
                                            ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                        }`
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            <item.icon size={20} className={isActive ? 'text-white' : 'text-gray-400'} />
                                            {item.label}
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </nav>

                        <div className="mt-auto pt-6 border-t border-gray-50 space-y-4">
                            <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 group hover:bg-white hover:shadow-xl transition-all duration-300 cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 group-hover:border-indigo-100 transition-colors">
                                        <span className="text-xl font-black text-indigo-600">
                                            {user?.fullName?.charAt(0) || 'A'}
                                        </span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-extrabold text-sm text-gray-900 truncate">{user?.fullName}</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider text-nowrap">Hệ thống</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-red-600 hover:bg-red-50 transition-all font-bold text-sm"
                            >
                                <FiLogOut size={20} />
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </aside>

                <div className="flex-1 ml-72">
                    {/* Header */}
                    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 px-10 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-400 font-bold text-sm">
                            <span>Bảng điều khiển</span>
                            <FiChevronRight />
                            <span className="text-gray-900 uppercase tracking-widest text-[10px] font-black">Admin Panel</span>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <button
                                    onClick={() => setShowNotifPanel(!showNotifPanel)}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${showNotifPanel ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                >
                                    <FiBell size={20} className={unreadCount > 0 ? 'animate-swing' : ''} />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-semibold rounded-full flex items-center justify-center">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {showNotifPanel && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setShowNotifPanel(false)} />
                                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-20">
                                            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                                <h3 className="font-semibold text-gray-900 text-sm">Thông báo</h3>
                                                <button
                                                    onClick={() => navigate('/admin/notifications')}
                                                    className="text-xs text-indigo-600 hover:text-indigo-800"
                                                >
                                                    Xem tất cả
                                                </button>
                                            </div>
                                            <div className="max-h-80 overflow-y-auto">
                                                {notifications.length === 0 ? (
                                                    <div className="p-6 text-center">
                                                        <FiBell size={24} className="text-gray-300 mx-auto mb-2" />
                                                        <p className="text-xs text-gray-400">Không có thông báo mới</p>
                                                    </div>
                                                ) : (
                                                    notifications.slice(0, 8).map((n) => (
                                                        <div
                                                            key={n.id}
                                                            onClick={() => handleNotifClick(n)}
                                                            className={`p-3 flex items-start gap-3 cursor-pointer hover:bg-gray-50 border-b border-gray-50 last:border-0 ${!n.isRead ? 'bg-indigo-50/50' : ''}`}
                                                        >
                                                            <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${!n.isRead ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                                {n.type === 'NEW_ORDER' ? <FiShoppingCart size={14} /> : <FiBell size={14} />}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <p className={`text-sm truncate ${!n.isRead ? 'font-medium text-gray-900' : 'text-gray-600'}`}>{n.title}</p>
                                                                    <span className="text-[10px] text-gray-400 whitespace-nowrap">{formatDate(n.createdAt)}</span>
                                                                </div>
                                                                <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{n.message}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={markAllAsRead}
                                                    className="w-full p-3 bg-gray-50 text-indigo-600 text-xs font-medium hover:bg-gray-100 transition-colors border-t border-gray-100"
                                                >
                                                    Đánh dấu tất cả đã đọc
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </header>

                    {/* Content */}
                    <main className="p-10 min-h-screen">
                        <div className="max-w-7xl mx-auto">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
