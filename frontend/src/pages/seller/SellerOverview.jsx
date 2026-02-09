import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService, orderService } from '../../services/api';
import Loading from '../../components/common/Loading';
import { FiPackage, FiDollarSign, FiShoppingBag, FiClock, FiTrendingUp, FiPlus } from 'react-icons/fi';

const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const SellerOverview = () => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [prodRes, orderRes] = await Promise.all([
                productService.getMyProducts({ page: 0, size: 5 }),
                orderService.getMySales({ page: 0, size: 5 })
            ]);
            setProducts(prodRes.data.data?.content || []);
            setOrders(orderRes.data.data?.content || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading />;

    const pendingOrdersCount = orders.filter(o => o.status === 'ADMIN_APPROVED').length;
    const totalSales = orders.filter(o => o.status === 'DELIVERED').reduce((sum, o) => sum + o.totalAmount, 0);

    const stats = [
        { label: 'Tổng sản phẩm', value: products.length, icon: FiPackage, color: 'bg-indigo-500' },
        { label: 'Tổng đơn hàng', value: orders.length, icon: FiShoppingBag, color: 'bg-green-500' },
        { label: 'Chờ xác nhận', value: pendingOrdersCount, icon: FiClock, color: 'bg-orange-500' },
        { label: 'Doanh thu', value: formatPrice(totalSales), icon: FiDollarSign, color: 'bg-purple-500' }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
                    <p className="text-gray-500">Chào mừng bạn quay trở lại!</p>
                </div>
                <Link
                    to="/seller/products/new"
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                >
                    <FiPlus size={18} /> Thêm sản phẩm
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-2xl p-6 shadow-sm">
                        <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                            <stat.icon className="text-white" size={24} />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-gray-500 text-sm">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Quick Links */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900">Sản phẩm mới nhất</h3>
                        <Link to="/seller/products" className="text-indigo-600 text-sm font-medium hover:text-indigo-700">
                            Xem tất cả
                        </Link>
                    </div>
                    {products.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Chưa có sản phẩm</p>
                    ) : (
                        <div className="space-y-3">
                            {products.slice(0, 3).map((product) => (
                                <div key={product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <img
                                        src={product.images?.split(',')[0] || '/placeholder.png'}
                                        alt=""
                                        className="w-12 h-12 rounded-lg object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{product.name}</p>
                                        <p className="text-sm text-indigo-600 font-semibold">{formatPrice(product.price)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900">Đơn hàng gần đây</h3>
                        <Link to="/seller/orders" className="text-indigo-600 text-sm font-medium hover:text-indigo-700">
                            Xem tất cả
                        </Link>
                    </div>
                    {orders.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Chưa có đơn hàng</p>
                    ) : (
                        <div className="space-y-3">
                            {orders.slice(0, 3).map((order) => (
                                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <div>
                                        <p className="font-medium text-gray-900">Đơn #{order.id}</p>
                                        <p className="text-sm text-gray-500">{order.buyerName}</p>
                                    </div>
                                    <p className="font-semibold text-indigo-600">{formatPrice(order.totalAmount)}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SellerOverview;
