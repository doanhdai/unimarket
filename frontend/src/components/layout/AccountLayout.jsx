import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiPackage, FiBell, FiSettings, FiLogOut, FiShoppingBag, FiStar } from 'react-icons/fi';

const menuItems = [
    { path: '/account/profile', label: 'Tài khoản', icon: FiUser },
    { path: '/account/orders', label: 'Đơn mua', icon: FiPackage },
    { path: '/account/notifications', label: 'Thông báo', icon: FiBell },
];

const sellerMenuItem = { path: '/seller/dashboard', label: 'Quản lý shop', icon: FiShoppingBag };
const registerSellerMenuItem = { path: '/account/register-seller', label: 'Đăng ký bán hàng', icon: FiStar };

const AccountLayout = () => {
    const { user, logout, isSeller } = useAuth();
    const location = useLocation();

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="w-full lg:w-72 shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden sticky top-24">
                            {/* User Info */}
                            <div className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                        <span className="text-2xl font-bold text-gray-900">
                                            {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                                        </span>
                                    </div>
                                    <div className="text-gray-900">
                                        <h3 className="font-semibold truncate">{user?.fullName || 'Người dùng'}</h3>
                                        <p className="text-sm text-gray-600 truncate">{user?.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation */}
                            <nav className="p-3">
                                {menuItems.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive
                                                ? 'bg-indigo-50 text-indigo-600'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`
                                        }
                                    >
                                        <item.icon size={20} />
                                        {item.label}
                                    </NavLink>
                                ))}

                                <hr className="my-3 border-gray-100" />

                                {isSeller ? (
                                    <NavLink
                                        to={sellerMenuItem.path}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive
                                                ? 'bg-green-50 text-green-600'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`
                                        }
                                    >
                                        <sellerMenuItem.icon size={20} />
                                        {sellerMenuItem.label}
                                    </NavLink>
                                ) : (
                                    <NavLink
                                        to={registerSellerMenuItem.path}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive
                                                ? 'bg-orange-50 text-orange-600'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`
                                        }
                                    >
                                        <registerSellerMenuItem.icon size={20} />
                                        {registerSellerMenuItem.label}
                                    </NavLink>
                                )}

                                <hr className="my-3 border-gray-100" />

                                <button
                                    onClick={logout}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-500 hover:bg-red-50 transition-all"
                                >
                                    <FiLogOut size={20} />
                                    Đăng xuất
                                </button>
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default AccountLayout;
