import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/api';
import Loading from '../components/common/Loading';
import { FiPackage, FiClock, FiTruck, FiCheckCircle, FiXCircle, FiEye, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
};

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const statusConfig = {
    PENDING: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700', icon: FiClock },
    ADMIN_APPROVED: { label: 'Đã duyệt', color: 'bg-blue-100 text-blue-700', icon: FiCheckCircle },
    SELLER_CONFIRMED: { label: 'Shop xác nhận', color: 'bg-indigo-100 text-indigo-700', icon: FiCheckCircle },
    SHIPPING: { label: 'Đang giao hàng', color: 'bg-purple-100 text-purple-700', icon: FiTruck },
    DELIVERED: { label: 'Đã giao hàng', color: 'bg-green-100 text-green-700', icon: FiCheckCircle },
    CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-700', icon: FiXCircle }
};

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await orderService.getMyPurchases({ page: 0, size: 50 });
            setOrders(response.data.data?.content || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
        try {
            await orderService.updateStatus(orderId, 'CANCELLED');
            fetchOrders();
        } catch (error) {
            alert('Không thể hủy đơn hàng');
        }
    };

    const filteredOrders = orders.filter(order => {
        if (activeTab === 'all') return true;
        if (activeTab === 'pending') return ['PENDING', 'ADMIN_APPROVED', 'SELLER_CONFIRMED'].includes(order.status);
        if (activeTab === 'shipping') return order.status === 'SHIPPING';
        if (activeTab === 'delivered') return order.status === 'DELIVERED';
        if (activeTab === 'cancelled') return order.status === 'CANCELLED';
        return true;
    });

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Đơn hàng của tôi</h1>
                    <span className="text-gray-500">{orders.length} đơn hàng</span>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {[
                        { key: 'all', label: 'Tất cả' },
                        { key: 'pending', label: 'Đang xử lý' },
                        { key: 'shipping', label: 'Đang giao' },
                        { key: 'delivered', label: 'Đã giao' },
                        { key: 'cancelled', label: 'Đã hủy' }
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${activeTab === tab.key ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Orders */}
                {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-2xl p-16 text-center shadow-sm">
                        <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                            <FiPackage size={32} className="text-gray-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Chưa có đơn hàng</h2>
                        <p className="text-gray-500 mb-6">Bạn chưa có đơn hàng nào trong mục này</p>
                        <Link to="/products" className="inline-flex px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
                            Mua sắm ngay
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => {
                            const StatusIcon = statusConfig[order.status]?.icon || FiPackage;
                            const isExpanded = expandedOrder === order.id;

                            return (
                                <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                                    {/* Header */}
                                    <div className="p-6 border-b border-gray-100">
                                        <div className="flex items-center justify-between flex-wrap gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-linear-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                                                    <span className="text-white font-bold">{order.shopName?.charAt(0) || 'S'}</span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{order.shopName || 'Shop'}</p>
                                                    <p className="text-sm text-gray-500">Đơn hàng #{order.id}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig[order.status]?.color}`}>
                                                    <StatusIcon size={14} />
                                                    {statusConfig[order.status]?.label}
                                                </span>
                                                <button
                                                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Items Preview */}
                                    <div className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="flex -space-x-3">
                                                {(order.items || []).slice(0, 3).map((item, idx) => (
                                                    <img
                                                        key={idx}
                                                        src={item.productImage || 'https://via.placeholder.com/60'}
                                                        alt=""
                                                        className="w-14 h-14 object-cover rounded-lg border-2 border-white"
                                                    />
                                                ))}
                                                {(order.items?.length || 0) > 3 && (
                                                    <div className="w-14 h-14 rounded-lg border-2 border-white bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                                                        +{order.items.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-gray-600">{order.items?.length || 0} sản phẩm</p>
                                                <p className="text-xl font-bold text-indigo-600">{formatPrice(order.totalAmount)}</p>
                                            </div>
                                            <div className="text-right text-sm text-gray-500">
                                                <p>{formatDate(order.createdAt)}</p>
                                                <p className="mt-1">{order.paymentMethod === 'COD' ? 'Thanh toán COD' : 'VNPay'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {isExpanded && (
                                        <div className="px-6 pb-6 pt-2 border-t border-gray-100 animate-fadeIn">
                                            <h4 className="font-semibold text-gray-900 mb-4">Chi tiết đơn hàng</h4>
                                            <div className="space-y-3">
                                                {(order.items || []).map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-4">
                                                        <img
                                                            src={item.productImage || 'https://via.placeholder.com/60'}
                                                            alt={item.productName}
                                                            className="w-16 h-16 object-cover rounded-lg"
                                                        />
                                                        <div className="flex-1">
                                                            <Link to={`/products/${item.productId}`} className="font-medium text-gray-900 hover:text-indigo-600">
                                                                {item.productName}
                                                            </Link>
                                                            <p className="text-sm text-gray-500">x{item.quantity}</p>
                                                        </div>
                                                        <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                                                <div className="text-sm text-gray-500">
                                                    <p><strong>Địa chỉ:</strong> {order.shippingAddress}</p>
                                                    <p><strong>SĐT:</strong> {order.phone}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    {order.status === 'PENDING' && (
                                                        <button
                                                            onClick={() => handleCancelOrder(order.id)}
                                                            className="px-4 py-2 text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors text-sm font-medium"
                                                        >
                                                            Hủy đơn
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;
