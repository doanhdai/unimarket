import { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import Loading from '../../components/common/Loading';
import { FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';

const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
const formatDate = (date) => new Date(date).toLocaleDateString('vi-VN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

const orderStatusMap = {
    PENDING: { label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-700' },
    ADMIN_APPROVED: { label: 'Admin đã duyệt', color: 'bg-sky-100 text-sky-700' },
    SELLER_CONFIRMED: { label: 'Đã xác nhận', color: 'bg-indigo-100 text-indigo-700' },
    SHIPPING: { label: 'Đang giao', color: 'bg-violet-100 text-violet-700' },
    DELIVERED: { label: 'Đã giao', color: 'bg-emerald-100 text-emerald-700' },
    CANCELLED: { label: 'Đã hủy', color: 'bg-rose-100 text-rose-700' }
};

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await adminService.getAllOrders({ page: 0, size: 50 });
            setOrders(response.data.data?.content || []);
        } catch (error) {
            toast.error('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Quản lý Đơn hàng</h1>
                <p className="text-gray-500">{orders.length} đơn hàng trên hệ thống</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {orders.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500">Không có đơn hàng nào trên hệ thống</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Mã đơn</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Khách hàng</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Shop</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tổng tiền</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Trạng thái</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Ngày đặt</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {orders.map((order) => {
                                const status = orderStatusMap[order.status] || orderStatusMap.PENDING;
                                return (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">#{order.id}</td>
                                        <td className="px-6 py-4 text-gray-900">{order.buyerName}</td>
                                        <td className="px-6 py-4 text-gray-500">{order.shopName}</td>
                                        <td className="px-6 py-4 text-indigo-600 font-semibold">{formatPrice(order.totalAmount)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">{formatDate(order.createdAt)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                            >
                                                Xem chi tiết
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminOrders;
