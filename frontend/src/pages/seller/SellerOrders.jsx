import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/api';
import Loading from '../../components/common/Loading';
import { FiCheck, FiTruck, FiPackage, FiChevronDown, FiChevronUp, FiShoppingBag, FiMapPin, FiCreditCard } from 'react-icons/fi';
import { toast } from 'react-toastify';

const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
const formatDate = (date) => new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
});

const orderStatusMap = {
    PENDING: { label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-700', icon: FiPackage },
    ADMIN_APPROVED: { label: 'Admin đã duyệt', color: 'bg-sky-100 text-sky-700', icon: FiCheck },
    SELLER_CONFIRMED: { label: 'Đã xác nhận', color: 'bg-indigo-100 text-indigo-700', icon: FiCheck },
    SHIPPING: { label: 'Đang giao', color: 'bg-violet-100 text-violet-700', icon: FiTruck },
    DELIVERED: { label: 'Đã giao', color: 'bg-emerald-100 text-emerald-700', icon: FiCheck },
    CANCELLED: { label: 'Đã hủy', color: 'bg-rose-100 text-rose-700', icon: FiPackage }
};

const SellerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await orderService.getMySales({ page: 0, size: 50 });
            setOrders(response.data.data?.content || []);
        } catch (error) {
            toast.error('Không thể tải đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmOrder = async (id) => {
        try {
            await orderService.confirmOrder(id);
            toast.success('Đã xác nhận đơn hàng');
            fetchOrders();
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await orderService.updateStatus(id, status);
            toast.success('Đã cập nhật trạng thái');
            fetchOrders();
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

    if (loading) return <Loading />;

    const statusFilters = [
        { key: 'all', label: 'Tất cả' },
        { key: 'PENDING', label: 'Chờ xác nhận' },
        { key: 'SELLER_CONFIRMED', label: 'Đã xác nhận' },
        { key: 'SHIPPING', label: 'Đang giao' },
        { key: 'DELIVERED', label: 'Đã giao' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Đơn hàng của shop</h1>
                    <p className="text-gray-500">{orders.length} đơn hàng</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {statusFilters.map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${filter === f.key
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200'}`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {filteredOrders.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        Chưa có đơn hàng nào trong trạng thái này
                    </div>
                ) : (
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
                            {filteredOrders.map((order) => {
                                const isExpanded = expandedOrder === order.id;
                                const status = orderStatusMap[order.status] || orderStatusMap.PENDING;

                                return (
                                    <React.Fragment key={order.id}>
                                        <tr className={`hover:bg-gray-50 transition-colors ${isExpanded ? 'bg-indigo-50/30' : ''}`}>
                                            <td className="px-6 py-4 font-medium text-gray-900">#{order.id}</td>
                                            <td className="px-6 py-4 text-gray-900">{order.buyerName}</td>
                                            <td className="px-6 py-4 text-gray-500">{order.items?.length || 0} sản phẩm</td>
                                            <td className="px-6 py-4 text-indigo-600 font-semibold">{formatPrice(order.totalAmount)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    {(order.status === 'PENDING' || order.status === 'ADMIN_APPROVED') && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleConfirmOrder(order.id);
                                                            }}
                                                            className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-1.5"
                                                        >
                                                            <FiCheck size={14} /> Duyệt đơn
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                                        className={`p-2 rounded-lg transition-colors ${isExpanded ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-400 hover:bg-gray-100'}`}
                                                    >
                                                        {isExpanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-8 bg-gray-50/50">
                                                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                                                        <div className="space-y-4">
                                                            <div className="flex items-center gap-2 text-gray-400 mb-2">
                                                                <FiMapPin size={16} />
                                                                <span className="text-xs font-bold uppercase tracking-wider">Thông tin giao hàng</span>
                                                            </div>
                                                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                                <p className="font-semibold text-gray-900 mb-1">{order.buyerName}</p>
                                                                <p className="text-gray-600 text-sm leading-relaxed">{order.shippingAddress}</p>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-4">
                                                            <div className="flex items-center gap-2 text-gray-400 mb-2">
                                                                <FiCreditCard size={16} />
                                                                <span className="text-xs font-bold uppercase tracking-wider">Thanh toán</span>
                                                            </div>
                                                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-sm text-gray-500">Phương thức:</span>
                                                                    <span className="font-bold text-gray-900">{order.paymentMethod}</span>
                                                                </div>
                                                                <div className="flex items-center justify-between mt-2">
                                                                    <span className="text-sm text-gray-500">Trạng thái:</span>
                                                                    {order.isPaid ? (
                                                                        <span className="text-emerald-600 text-sm font-bold">Đã thanh toán</span>
                                                                    ) : (
                                                                        <span className="text-amber-600 text-sm font-bold">Chưa thanh toán</span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                                                                    <span className="text-sm text-gray-500">Thời gian:</span>
                                                                    <span className="text-sm text-gray-900">{formatDate(order.createdAt)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3 mb-8">
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Sản phẩm chi tiết</p>
                                                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden text-sm">
                                                            {order.items?.map((item, idx) => (
                                                                <div key={idx} className="flex items-center gap-4 p-4 border-b last:border-0 hover:bg-gray-50 transition-colors">
                                                                    <img src={item.productImage || '/placeholder.png'} alt="" className="w-12 h-12 rounded-lg object-cover shadow-sm" />
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="font-bold text-gray-900 truncate">{item.productName}</p>
                                                                        {item.variantInfo && <p className="text-xs text-gray-500 mt-0.5">{item.variantInfo}</p>}
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                                                                        <p className="text-[10px] text-gray-400">x{item.quantity} ({formatPrice(item.price)})</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            <div className="bg-gray-50 p-4 flex justify-between items-center border-t border-gray-100">
                                                                <span className="font-bold text-gray-900">Tổng cộng</span>
                                                                <span className="text-lg font-black text-indigo-600">{formatPrice(order.totalAmount)}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                                        {(order.status === 'PENDING' || order.status === 'ADMIN_APPROVED') && (
                                                            <button
                                                                onClick={() => handleConfirmOrder(order.id)}
                                                                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center gap-2"
                                                            >
                                                                <FiCheck /> Duyệt đơn
                                                            </button>
                                                        )}
                                                        {order.status === 'SELLER_CONFIRMED' && (
                                                            <button
                                                                onClick={() => handleUpdateStatus(order.id, 'SHIPPING')}
                                                                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center gap-2"
                                                            >
                                                                <FiTruck /> Giao hàng
                                                            </button>
                                                        )}
                                                        {order.status === 'SHIPPING' && (
                                                            <button
                                                                onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                                                                className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-md shadow-green-100 flex items-center gap-2"
                                                            >
                                                                <FiCheck /> Hoàn tất
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default SellerOrders;
