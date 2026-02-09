import { useState, useEffect } from 'react';
import { orderService } from '../../services/api';
import { FiPackage, FiClock, FiCheck, FiTruck, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Loading from '../../components/common/Loading';

const statusConfig = {
    PENDING: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700', icon: FiClock },
    ADMIN_APPROVED: { label: 'Đã duyệt', color: 'bg-blue-100 text-blue-700', icon: FiCheck },
    SELLER_CONFIRMED: { label: 'Shop xác nhận', color: 'bg-indigo-100 text-indigo-700', icon: FiCheck },
    SHIPPING: { label: 'Đang giao', color: 'bg-purple-100 text-purple-700', icon: FiTruck },
    DELIVERED: { label: 'Đã giao', color: 'bg-green-100 text-green-700', icon: FiCheck },
    CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-700', icon: FiX }
};

const AccountOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await orderService.getMyPurchases({ page: 0, size: 20 });
            setOrders(response.data.data?.content || []);
        } catch (error) {
            toast.error('Không thể tải đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
        try {
            await orderService.updateStatus(orderId, 'CANCELLED');
            fetchOrders();
            toast.success('Đã hủy đơn hàng');
        } catch (error) {
            toast.error('Không thể hủy đơn hàng');
        }
    };

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    const formatDate = (date) => new Date(date).toLocaleDateString('vi-VN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    if (loading) return <Loading />;

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <h1 className="text-xl font-bold text-gray-900">Đơn hàng của tôi</h1>
                <p className="text-gray-500 text-sm mt-1">{orders.length} đơn hàng</p>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                    <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <FiPackage size={32} className="text-gray-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Chưa có đơn hàng</h2>
                    <p className="text-gray-500">Bạn chưa có đơn hàng nào</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => {
                        const status = statusConfig[order.status] || statusConfig.PENDING;
                        const StatusIcon = status.icon;
                        const isExpanded = expandedOrder === order.id;

                        return (
                            <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                                <div
                                    className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                                                <span className="text-white font-bold">{order.shopName?.charAt(0) || 'S'}</span>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{order.shopName || 'Shop'}</p>
                                                <p className="text-sm text-gray-500">Đơn #{order.id} • {formatDate(order.createdAt)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${status.color}`}>
                                                <StatusIcon size={14} />
                                                {status.label}
                                            </span>
                                            <span className="font-bold text-indigo-600">{formatPrice(order.totalAmount)}</span>
                                            {isExpanded ? <FiChevronUp className="text-gray-400" /> : <FiChevronDown className="text-gray-400" />}
                                        </div>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                                        <div className="space-y-3">
                                            {order.items?.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-4">
                                                    <img
                                                        src={item.productImage || '/placeholder.png'}
                                                        alt={item.productName}
                                                        className="w-16 h-16 object-cover rounded-xl"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-gray-900 truncate">{item.productName}</p>
                                                        {item.variantInfo && <p className="text-sm text-gray-500">{item.variantInfo}</p>}
                                                        <p className="text-sm text-gray-500">x{item.quantity}</p>
                                                    </div>
                                                    <p className="font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {order.status === 'PENDING' && (
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                <button
                                                    onClick={() => handleCancelOrder(order.id)}
                                                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium"
                                                >
                                                    Hủy đơn hàng
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AccountOrders;
