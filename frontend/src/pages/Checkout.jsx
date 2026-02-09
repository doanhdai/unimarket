import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService, paymentService } from '../services/api';
import { FiMapPin, FiPhone, FiFileText, FiCreditCard, FiTruck, FiCheck, FiShield } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Loading from '../components/common/Loading';

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
};

const Checkout = () => {
    const { cartItems, cartTotal, loading: cartLoading, fetchCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        shippingAddress: user?.address || '',
        phone: user?.phone || '',
        note: '',
        paymentMethod: 'COD'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.shippingAddress || !formData.phone) {
            toast.error('Vui lòng nhập đầy đủ thông tin giao hàng');
            return;
        }

        setLoading(true);
        try {
            const response = await orderService.create({
                cartItemIds: cartItems.map(item => item.id),
                shippingAddress: formData.shippingAddress,
                phone: formData.phone,
                note: formData.note,
                paymentMethod: formData.paymentMethod
            });

            if (formData.paymentMethod === 'VNPAY') {
                const orders = response.data.data;
                const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);
                const orderIds = orders.map(o => o.id).join(',');
                const paymentRes = await paymentService.createVNPayUrl(
                    orders[0].id,
                    Math.round(totalAmount),
                    `UniMarket Order #${orderIds}`
                );
                window.location.href = paymentRes.data.data;
            } else {
                toast.success('Đặt hàng thành công!');
                await fetchCart();
                navigate('/orders');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Đặt hàng thất bại');
        } finally {
            setLoading(false);
        }
    };

    if (cartLoading) return <Loading />;

    if (!cartItems || cartItems.length === 0) {
        navigate('/cart');
        return null;
    }

    // Group cart items by seller
    const groupedBySeller = cartItems.reduce((acc, item) => {
        const sellerId = item.sellerId || 'unknown';
        if (!acc[sellerId]) {
            acc[sellerId] = {
                shopName: item.shopName || 'Shop',
                items: []
            };
        }
        acc[sellerId].items.push(item);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Thanh toán</h1>

                <form onSubmit={handleSubmit}>
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Left - Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Shipping Info */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <FiMapPin className="text-indigo-600" />
                                    Thông tin giao hàng
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ nhận hàng *</label>
                                        <div className="relative">
                                            <FiMapPin className="absolute left-4 top-4 text-gray-400" size={18} />
                                            <textarea
                                                name="shippingAddress"
                                                value={formData.shippingAddress}
                                                onChange={handleChange}
                                                placeholder="Nhập địa chỉ đầy đủ..."
                                                rows={3}
                                                required
                                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại *</label>
                                        <div className="relative">
                                            <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="0901234567"
                                                required
                                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú (tuỳ chọn)</label>
                                        <div className="relative">
                                            <FiFileText className="absolute left-4 top-4 text-gray-400" size={18} />
                                            <textarea
                                                name="note"
                                                value={formData.note}
                                                onChange={handleChange}
                                                placeholder="Ghi chú cho người bán..."
                                                rows={2}
                                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <FiCreditCard className="text-indigo-600" />
                                    Phương thức thanh toán
                                </h2>

                                <div className="space-y-3">
                                    <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.paymentMethod === 'COD' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-200'}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="COD"
                                            checked={formData.paymentMethod === 'COD'}
                                            onChange={handleChange}
                                            className="w-5 h-5 text-indigo-600"
                                        />
                                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                            <FiTruck className="text-orange-600" size={24} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">Thanh toán khi nhận hàng (COD)</p>
                                            <p className="text-sm text-gray-500">Thanh toán bằng tiền mặt khi nhận hàng</p>
                                        </div>
                                        {formData.paymentMethod === 'COD' && <FiCheck className="ml-auto text-indigo-600" size={24} />}
                                    </label>

                                    <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.paymentMethod === 'VNPAY' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-200'}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="VNPAY"
                                            checked={formData.paymentMethod === 'VNPAY'}
                                            onChange={handleChange}
                                            className="w-5 h-5 text-indigo-600"
                                        />
                                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                            <img src="https://vnpay.vn/themes/flavie-flavor/public/images/logo-VNPAY.svg" alt="VNPay" className="h-6" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">Thanh toán VNPay</p>
                                            <p className="text-sm text-gray-500">Thanh toán online qua cổng VNPay</p>
                                        </div>
                                        {formData.paymentMethod === 'VNPAY' && <FiCheck className="ml-auto text-indigo-600" size={24} />}
                                    </label>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Sản phẩm đặt mua</h2>

                                {Object.entries(groupedBySeller).map(([sellerId, { shopName, items }]) => (
                                    <div key={sellerId} className="mb-6 last:mb-0">
                                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                                <span className="text-white text-sm font-semibold">{shopName.charAt(0)}</span>
                                            </div>
                                            <span className="font-semibold text-gray-900">{shopName}</span>
                                        </div>

                                        <div className="space-y-3">
                                            {items.map((item) => (
                                                <div key={item.id} className="flex items-center gap-4">
                                                    <img
                                                        src={item.productImage || 'https://via.placeholder.com/60'}
                                                        alt={item.productName}
                                                        className="w-16 h-16 object-cover rounded-lg"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-gray-900 line-clamp-1">{item.productName}</p>
                                                        <p className="text-sm text-gray-500">x{item.quantity}</p>
                                                    </div>
                                                    <p className="font-semibold text-indigo-600">{formatPrice(item.subtotal)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right - Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Chi tiết thanh toán</h2>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-gray-600">
                                        <span>Tạm tính</span>
                                        <span>{formatPrice(cartTotal)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-gray-600">
                                        <span>Phí vận chuyển</span>
                                        <span className="text-green-600">Miễn phí</span>
                                    </div>
                                    <div className="pt-4 border-t border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-bold text-gray-900">Tổng thanh toán</span>
                                            <span className="text-2xl font-bold text-indigo-600">{formatPrice(cartTotal)}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full mt-6 py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            {formData.paymentMethod === 'VNPAY' ? 'Thanh toán với VNPay' : 'Đặt hàng'}
                                        </>
                                    )}
                                </button>

                                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                                    <FiShield className="text-green-500" />
                                    <span>Thanh toán an toàn & bảo mật</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Checkout;
