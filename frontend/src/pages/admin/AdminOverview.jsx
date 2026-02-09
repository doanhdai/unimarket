import { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import Loading from '../../components/common/Loading';
import { FiUsers, FiPackage, FiShoppingCart, FiDollarSign, FiActivity, FiTrendingUp, FiArrowUpRight, FiClock, FiCheck, FiShoppingBag } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const AdminOverview = () => {
    const [stats, setStats] = useState(null);
    const [pendingCounts, setPendingCounts] = useState({ sellers: 0, products: 0, orders: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [dashRes, sellersRes, productsRes, ordersRes] = await Promise.all([
                adminService.getDashboard(),
                adminService.getPendingSellers({ page: 0, size: 1 }),
                adminService.getPendingProducts({ page: 0, size: 1 }),
                adminService.getPendingOrders({ page: 0, size: 1 })
            ]);
            setStats(dashRes.data.data);
            setPendingCounts({
                sellers: sellersRes.data.data?.totalElements || 0,
                products: productsRes.data.data?.totalElements || 0,
                orders: ordersRes.data.data?.totalElements || 0
            });
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading />;

    const statCards = [
        { label: 'Người dùng', value: stats?.totalUsers || 0, icon: FiUsers, color: 'bg-indigo-600', shadow: 'shadow-indigo-500/20' },
        { label: 'Người bán', value: stats?.totalSellers || 0, icon: FiActivity, color: 'bg-purple-600', shadow: 'shadow-purple-500/20' },
        { label: 'Sản phẩm', value: stats?.totalProducts || 0, icon: FiPackage, color: 'bg-orange-600', shadow: 'shadow-orange-500/20' },
        { label: 'Đơn hàng', value: stats?.totalOrders || 0, icon: FiShoppingCart, color: 'bg-emerald-600', shadow: 'shadow-emerald-500/20' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Greeting Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tổng quan hệ thống</h1>
                    <p className="text-slate-500 font-medium mt-1">Xin chào, <span className="text-indigo-600 font-bold">{stats?.adminName || 'Admin'}</span>! Đây là những gì đang diễn ra trên UniMarket hôm nay.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 text-sm font-bold text-slate-600">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        Hệ thống ổn định
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <div key={index} className="bg-white rounded-2xl p-6 shadow-xs border border-slate-100 hover:shadow-md transition-all duration-300 group relative overflow-hidden">
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white shadow-lg ${stat.shadow} group-hover:scale-110 transition-transform duration-500`}>
                                <stat.icon size={22} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-2xl font-black text-slate-900 leading-none">{stat.value}</p>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1 truncate">{stat.label}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
                                <FiTrendingUp className="w-3 h-3" />
                                +12.5%
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium tracking-tight">so với tháng trước</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Middle Section: Activity */}
            <div className="max-w-3xl">
                {/* Quick Actions / Pending */}
                <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 flex flex-col justify-between h-full">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                            <FiActivity className="text-indigo-500" />
                            Đang chờ xử lý
                        </h3>
                        <div className="space-y-3">
                            <Link to="/admin/sellers" className="flex items-center justify-between p-4 bg-slate-50 rounded-3xl hover:bg-slate-100 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                                        <FiUsers size={20} />
                                    </div>
                                    <span className="font-bold text-slate-700">Seller mới</span>
                                </div>
                                <span className="bg-amber-500 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                                    {pendingCounts.sellers}
                                </span>
                            </Link>

                            <Link to="/admin/products" className="flex items-center justify-between p-4 bg-slate-50 rounded-3xl hover:bg-slate-100 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                        <FiPackage size={20} />
                                    </div>
                                    <span className="font-bold text-slate-700">Sản phẩm</span>
                                </div>
                                <span className="bg-blue-500 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                                    {pendingCounts.products}
                                </span>
                            </Link>

                            <Link to="/admin/orders" className="flex items-center justify-between p-4 bg-slate-50 rounded-3xl hover:bg-slate-100 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                                        <FiShoppingBag size={20} />
                                    </div>
                                    <span className="font-bold text-slate-700">Đơn hàng</span>
                                </div>
                                <span className="bg-purple-500 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                                    {pendingCounts.orders}
                                </span>
                            </Link>
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-slate-50 text-center">
                        <p className="text-slate-400 text-xs font-medium italic"> UniMarket Management System v2.0</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
