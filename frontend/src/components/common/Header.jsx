import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiBell, FiUser, FiSearch, FiLogOut, FiPackage, FiSettings, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useNotification } from '../../context/NotificationContext';
import { useState } from 'react';

const Header = () => {
    const { user, logout, isAdmin, isSeller } = useAuth();

    console.log('User:', user);
    console.log('isSeller (context):', isSeller);
    console.log('user.isSeller:', user?.isSeller);
    console.log('user.sellerApproved:', user?.sellerApproved);
    console.log('user.role:', user?.role);

    const { cartCount } = useCart();
    const { unreadCount } = useNotification();
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?keyword=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <header className="sticky top-0 z-50 glass border-b border-gray-200/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <img src="/logo.png" alt="UniMarket" className="h-16 w-auto" />
                        <span className="text-xl font-bold hidden sm:block">UniMarket</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link to="/" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                            Trang chủ
                        </Link>
                        <Link to="/products" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                            Sản phẩm
                        </Link>
                        <Link to="/forum" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                            Cộng đồng
                        </Link>
                        {isSeller && (
                            <Link to="/seller/dashboard" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                                Shop của tôi
                            </Link>
                        )}
                        {isAdmin && (
                            <Link to="/admin" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                                Quản trị
                            </Link>
                        )}
                    </nav>

                    {/* Search Box */}
                    <form onSubmit={handleSearch} className="hidden lg:flex items-center">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-72 pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
                            />
                        </div>
                    </form>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        {user ? (
                            <>
                                <Link to="/cart" className="relative p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                                    <FiShoppingCart size={22} />
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                            {cartCount > 9 ? '9+' : cartCount}
                                        </span>
                                    )}
                                </Link>

                                <Link to="/account/notifications" className="relative p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                                    <FiBell size={22} />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </Link>

                                <div className="relative">
                                    <button
                                        onClick={() => setShowDropdown(!showDropdown)}
                                        className="flex items-center gap-2 p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                    >
                                        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                                            <span className="text-white text-sm font-semibold">
                                                {user.fullName?.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    </button>

                                    {showDropdown && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-fadeIn">
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <p className="font-semibold text-gray-900">{user.fullName}</p>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                            </div>
                                            <Link to="/account/profile" className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                                                <FiUser size={18} />
                                                Tài khoản
                                            </Link>
                                            <Link to="/account/orders" className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                                                <FiPackage size={18} />
                                                Đơn mua
                                            </Link>
                                            {(isSeller || user.isSeller) && (
                                                <Link to="/seller/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-green-600 hover:bg-green-50 transition-colors font-medium">
                                                    <FiSettings size={18} />
                                                    Quản lý Shop
                                                </Link>
                                            )}
                                            {!isSeller && !user.isSeller && (
                                                <Link to="/account/register-seller" className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                                                    <FiSettings size={18} />
                                                    Đăng ký bán hàng
                                                </Link>
                                            )}
                                            <hr className="my-2" />
                                            <button
                                                onClick={() => { logout(); setShowDropdown(false); }}
                                                className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 w-full transition-colors"
                                            >
                                                <FiLogOut size={18} />
                                                Đăng xuất
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="px-4 py-2 text-gray-700 font-medium hover:text-indigo-600 transition-colors">
                                    Đăng nhập
                                </Link>
                                <Link to="/register" className="px-5 py-2.5 bg-linear-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25">
                                    Đăng ký
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="md:hidden p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        >
                            {showMobileMenu ? <FiX size={24} /> : <FiMenu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {showMobileMenu && (
                    <div className="md:hidden py-4 border-t border-gray-200 animate-fadeIn">
                        <form onSubmit={handleSearch} className="mb-4">
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </form>
                        <nav className="flex flex-col gap-2">
                            <Link to="/" className="px-4 py-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl font-medium">
                                Trang chủ
                            </Link>
                            <Link to="/products" className="px-4 py-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl font-medium">
                                Sản phẩm
                            </Link>
                            <Link to="/forum" className="px-4 py-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl font-medium">
                                Cộng đồng
                            </Link>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
