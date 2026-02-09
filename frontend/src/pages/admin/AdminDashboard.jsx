import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService, productService } from '../../services/api';
import Loading from '../../components/common/Loading';
import { FiUsers, FiPackage, FiShoppingCart, FiDollarSign, FiCheck, FiX, FiEye, FiTrendingUp, FiActivity } from 'react-icons/fi';
import { toast } from 'react-toastify';

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
};

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [pendingSellers, setPendingSellers] = useState([]);
    const [pendingProducts, setPendingProducts] = useState([]);
    const [pendingOrders, setPendingOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [dashRes, sellersRes, productsRes, ordersRes] = await Promise.all([
                adminService.getDashboard(),
                adminService.getPendingSellers({ page: 0, size: 10 }),
                adminService.getPendingProducts({ page: 0, size: 10 }),
                adminService.getPendingOrders({ page: 0, size: 10 })
            ]);
            setStats(dashRes.data.data);
            setPendingSellers(sellersRes.data.data?.content || []);
            setPendingProducts(productsRes.data.data?.content || []);
            setPendingOrders(ordersRes.data.data?.content || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveSeller = async (id, approve) => {
        try {
            await adminService.approveSeller(id, approve);
            toast.success(approve ? 'Đã duyệt seller' : 'Đã từ chối seller');
            fetchData();
        } catch (error) {
            toast.error('Lỗi xử lý');
        }
    };

    const handleApproveProduct = async (id, approve) => {
        try {
            await productService.approveProduct(id, approve);
            toast.success(approve ? 'Đã duyệt sản phẩm' : 'Đã từ chối sản phẩm');
            fetchData();
        } catch (error) {
            toast.error('Lỗi xử lý');
        }
    };

    const handleApproveOrder = async (id) => {
        try {
            await adminService.approveOrder(id);
            toast.success('Đã duyệt đơn hàng');
            fetchData();
        } catch (error) {
            toast.error('Lỗi xử lý');
        }
    };

    if (loading) return <Loading />;

    const statCards = [
        { label: 'Người dùng', value: stats?.totalUsers || 0, icon: FiUsers, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Người bán', value: stats?.totalSellers || 0, icon: FiActivity, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Sản phẩm', value: stats?.totalProducts || 0, icon: FiPackage, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Đơn hàng', value: stats?.totalOrders || 0, icon: FiShoppingCart, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Doanh thu', value: formatPrice(stats?.totalRevenue || 0), icon: FiDollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50' }
    ];

    const tabs = [
        { key: 'overview', label: 'Tổng quan' },
        { key: 'sellers', label: `Duyệt seller (${pendingSellers.length})` },
        { key: 'products', label: `Duyệt sản phẩm (${pendingProducts.length})` },
        { key: 'orders', label: `Duyệt đơn (${pendingOrders.length})` }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-500 mt-1">Quản lý hệ thống UniMarket</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                    {statCards.map((stat, index) => (
                        <div key={index} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center mb-4`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            <p className="text-gray-500 text-sm">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${activeTab === tab.key ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Pending Sellers */}
                {activeTab === 'sellers' && (
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">ID</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Họ tên</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tên shop</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {pendingSellers.length === 0 ? (
                                        <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500">Không có yêu cầu nào</td></tr>
                                    ) : (
                                        pendingSellers.map((seller) => (
                                            <tr key={seller.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-gray-900">#{seller.id}</td>
                                                <td className="px-6 py-4 font-medium text-gray-900">{seller.fullName}</td>
                                                <td className="px-6 py-4 text-gray-500">{seller.email}</td>
                                                <td className="px-6 py-4 text-gray-900">{seller.shopName}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => handleApproveSeller(seller.id, true)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg mr-2">
                                                        <FiCheck size={18} />
                                                    </button>
                                                    <button onClick={() => handleApproveSeller(seller.id, false)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                                        <FiX size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Pending Products */}
                {activeTab === 'products' && (
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Sản phẩm</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Giá</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Shop</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Danh mục</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {pendingProducts.length === 0 ? (
                                        <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500">Không có sản phẩm chờ duyệt</td></tr>
                                    ) : (
                                        pendingProducts.map((product) => (
                                            <tr key={product.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img src={product.images?.split(',')[0] || 'https://via.placeholder.com/50'} alt="" className="w-12 h-12 rounded-lg object-cover" />
                                                        <span className="font-medium text-gray-900">{product.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-indigo-600 font-semibold">{formatPrice(product.price)}</td>
                                                <td className="px-6 py-4 text-gray-500">{product.shopName}</td>
                                                <td className="px-6 py-4 text-gray-500">{product.categoryName}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link to={`/products/${product.id}`} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg inline-block mr-2">
                                                        <FiEye size={18} />
                                                    </Link>
                                                    <button onClick={() => handleApproveProduct(product.id, true)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg mr-2">
                                                        <FiCheck size={18} />
                                                    </button>
                                                    <button onClick={() => handleApproveProduct(product.id, false)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                                        <FiX size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Pending Orders */}
                {activeTab === 'orders' && (
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Mã đơn</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Khách hàng</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Shop</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tổng tiền</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Thanh toán</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {pendingOrders.length === 0 ? (
                                        <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">Không có đơn hàng chờ duyệt</td></tr>
                                    ) : (
                                        pendingOrders.map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-900">#{order.id}</td>
                                                <td className="px-6 py-4 text-gray-900">{order.buyerName}</td>
                                                <td className="px-6 py-4 text-gray-500">{order.shopName}</td>
                                                <td className="px-6 py-4 text-indigo-600 font-semibold">{formatPrice(order.totalAmount)}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${order.paymentMethod === 'COD' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {order.paymentMethod}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => handleApproveOrder(order.id)} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                                                        <FiCheck className="inline mr-1" /> Duyệt
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Overview */}
                {activeTab === 'overview' && (
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4">Thống kê nhanh</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl">
                                    <span className="text-gray-700">Seller chờ duyệt</span>
                                    <span className="font-bold text-yellow-600">{pendingSellers.length}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
                                    <span className="text-gray-700">Sản phẩm chờ duyệt</span>
                                    <span className="font-bold text-orange-600">{pendingProducts.length}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                                    <span className="text-gray-700">Đơn hàng chờ duyệt</span>
                                    <span className="font-bold text-blue-600">{pendingOrders.length}</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4">Liên kết nhanh</h3>
                            <div className="space-y-2">
                                <Link to="/admin/categories" className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                    <span className="text-gray-700">Quản lý danh mục</span>
                                    <FiPackage className="text-gray-400" />
                                </Link>
                                <Link to="/admin/users" className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                    <span className="text-gray-700">Quản lý người dùng</span>
                                    <FiUsers className="text-gray-400" />
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
