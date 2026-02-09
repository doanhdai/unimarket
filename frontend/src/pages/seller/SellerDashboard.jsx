import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService, orderService } from '../../services/api';
import Loading from '../../components/common/Loading';
import { FiPackage, FiDollarSign, FiPlus, FiEdit, FiTrash2, FiCheck, FiTrendingUp, FiShoppingBag, FiClock } from 'react-icons/fi';
import { toast } from 'react-toastify';

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
};

const statusMap = {
    PENDING: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-700' },
    APPROVED: { label: 'Đang bán', color: 'bg-green-100 text-green-700' },
    REJECTED: { label: 'Bị từ chối', color: 'bg-red-100 text-red-700' }
};

const orderStatusMap = {
    PENDING: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700' },
    ADMIN_APPROVED: { label: 'Chờ bạn xác nhận', color: 'bg-blue-100 text-blue-700' },
    SELLER_CONFIRMED: { label: 'Đã xác nhận', color: 'bg-indigo-100 text-indigo-700' },
    SHIPPING: { label: 'Đang giao', color: 'bg-purple-100 text-purple-700' },
    DELIVERED: { label: 'Đã giao', color: 'bg-green-100 text-green-700' },
    CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' }
};

const SellerDashboard = () => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('products');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [prodRes, orderRes] = await Promise.all([
                productService.getMyProducts({ page: 0, size: 20 }),
                orderService.getMySales({ page: 0, size: 20 })
            ]);
            setProducts(prodRes.data.data?.content || []);
            setOrders(orderRes.data.data?.content || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
        try {
            await productService.delete(id);
            toast.success('Đã xóa sản phẩm');
            fetchData();
        } catch (error) {
            toast.error('Lỗi khi xóa');
        }
    };

    const handleConfirmOrder = async (id) => {
        try {
            await orderService.confirmOrder(id);
            toast.success('Đã xác nhận đơn hàng');
            fetchData();
        } catch (error) {
            toast.error('Lỗi xử lý');
        }
    };

    const handleUpdateOrderStatus = async (id, status) => {
        try {
            await orderService.updateStatus(id, status);
            toast.success('Đã cập nhật trạng thái');
            fetchData();
        } catch (error) {
            toast.error('Lỗi xử lý');
        }
    };

    if (loading) return <Loading />;

    const pendingOrdersCount = orders.filter(o => o.status === 'ADMIN_APPROVED').length;
    const totalSales = orders.filter(o => o.status === 'DELIVERED').reduce((sum, o) => sum + o.totalAmount, 0);

    const stats = [
        { label: 'Tổng sản phẩm', value: products.length, icon: FiPackage, color: 'bg-indigo-50', iconColor: 'text-indigo-600' },
        { label: 'Tổng đơn hàng', value: orders.length, icon: FiShoppingBag, color: 'bg-green-50', iconColor: 'text-green-600' },
        { label: 'Chờ xác nhận', value: pendingOrdersCount, icon: FiClock, color: 'bg-orange-50', iconColor: 'text-orange-600' },
        { label: 'Doanh thu', value: formatPrice(totalSales), icon: FiDollarSign, color: 'bg-purple-50', iconColor: 'text-purple-600' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Shop của tôi</h1>
                        <p className="text-gray-500 mt-1">Quản lý sản phẩm và đơn hàng</p>
                    </div>
                    <Link to="/seller/products/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25">
                        <FiPlus /> Thêm sản phẩm
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white rounded-xl p-5 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center shrink-0`}>
                                    <stat.icon className={stat.iconColor} size={20} />
                                </div>
                                <div>
                                    <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
                                    <p className="text-gray-500 text-xs">{stat.label}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`px-5 py-2.5 rounded-xl font-medium transition-all ${activeTab === 'products' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    >
                        Sản phẩm ({products.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-5 py-2.5 rounded-xl font-medium transition-all ${activeTab === 'orders' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    >
                        Đơn hàng ({pendingOrdersCount} chờ)
                    </button>
                </div>

                {/* Products */}
                {activeTab === 'products' && (
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Sản phẩm</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Giá</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Kho</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Trạng thái</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Lượt xem</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {products.length === 0 ? (
                                        <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">Chưa có sản phẩm nào</td></tr>
                                    ) : (
                                        products.map((product) => (
                                            <tr key={product.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img src={product.images?.split(',')[0] || 'https://via.placeholder.com/50'} alt="" className="w-12 h-12 rounded-lg object-cover" />
                                                        <span className="font-medium text-gray-900 line-clamp-1">{product.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-indigo-600 font-semibold">{formatPrice(product.price)}</td>
                                                <td className="px-6 py-4 text-gray-900">{product.quantity}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusMap[product.status]?.color}`}>
                                                        {statusMap[product.status]?.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">{product.viewCount}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link to={`/seller/products/${product.id}/edit`} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg inline-block">
                                                        <FiEdit size={18} />
                                                    </Link>
                                                    <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                                        <FiTrash2 size={18} />
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

                {/* Orders */}
                {activeTab === 'orders' && (
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Mã đơn</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Khách hàng</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Sản phẩm</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tổng tiền</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Trạng thái</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {orders.length === 0 ? (
                                        <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">Chưa có đơn hàng nào</td></tr>
                                    ) : (
                                        orders.map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-900">#{order.id}</td>
                                                <td className="px-6 py-4 text-gray-900">{order.buyerName}</td>
                                                <td className="px-6 py-4 text-gray-500">{order.items?.length || 0} sản phẩm</td>
                                                <td className="px-6 py-4 text-indigo-600 font-semibold">{formatPrice(order.totalAmount)}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${orderStatusMap[order.status]?.color}`}>
                                                        {orderStatusMap[order.status]?.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {order.status === 'ADMIN_APPROVED' && (
                                                        <button onClick={() => handleConfirmOrder(order.id)} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
                                                            <FiCheck className="inline mr-1" /> Xác nhận
                                                        </button>
                                                    )}
                                                    {order.status === 'SELLER_CONFIRMED' && (
                                                        <button onClick={() => handleUpdateOrderStatus(order.id, 'SHIPPING')} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                                                            Giao hàng
                                                        </button>
                                                    )}
                                                    {order.status === 'SHIPPING' && (
                                                        <button onClick={() => handleUpdateOrderStatus(order.id, 'DELIVERED')} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
                                                            Đã giao
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SellerDashboard;
