import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiArrowRight, FiTruck, FiShield } from 'react-icons/fi';
import Loading from '../components/common/Loading';

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
};

const Cart = () => {
    const { cartItems, loading, updateQuantity, removeItem, cartTotal } = useCart();
    const navigate = useNavigate();

    if (loading) return <Loading />;

    if (!cartItems || cartItems.length === 0) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                        <FiShoppingBag size={40} className="text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Giỏ hàng trống</h2>
                    <p className="text-gray-500 mb-8">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg"
                    >
                        Khám phá sản phẩm
                        <FiArrowRight />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Giỏ hàng của bạn</h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <div key={item.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex gap-6">
                                    {/* Image */}
                                    <Link to={`/products/${item.productId}`} className="shrink-0">
                                        <img
                                            src={item.productImage || 'https://via.placeholder.com/120'}
                                            alt={item.productName}
                                            className="w-28 h-28 object-cover rounded-xl"
                                        />
                                    </Link>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <Link to={`/products/${item.productId}`} className="block">
                                            <h3 className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-2">
                                                {item.productName}
                                            </h3>
                                        </Link>
                                        <p className="mt-1 text-sm text-gray-500">Shop: {item.shopName || 'Unknown'}</p>
                                        <p className="mt-2 text-xl font-bold text-indigo-600">{formatPrice(item.productPrice)}</p>

                                        {/* Actions */}
                                        <div className="mt-4 flex items-center justify-between">
                                            {/* Quantity */}
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                                >
                                                    <FiMinus size={14} />
                                                </button>
                                                <span className="w-10 text-center font-semibold">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                                >
                                                    <FiPlus size={14} />
                                                </button>
                                            </div>

                                            {/* Subtotal & Remove */}
                                            <div className="flex items-center gap-4">
                                                <span className="text-lg font-bold text-gray-900">
                                                    {formatPrice(item.subtotal)}
                                                </span>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <FiTrash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Tóm tắt đơn hàng</h2>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-gray-600">
                                    <span>Tạm tính ({cartItems.length} sản phẩm)</span>
                                    <span>{formatPrice(cartTotal)}</span>
                                </div>
                                <div className="flex items-center justify-between text-gray-600">
                                    <span>Phí vận chuyển</span>
                                    <span className="text-green-600">Miễn phí</span>
                                </div>
                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
                                        <span className="text-2xl font-bold text-indigo-600">{formatPrice(cartTotal)}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/checkout')}
                                className="w-full mt-6 py-4 bg-linear-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                            >
                                Tiến hành thanh toán
                                <FiArrowRight />
                            </button>

                            {/* Benefits */}
                            <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <FiTruck className="text-green-500" size={18} />
                                    <span>Miễn phí vận chuyển đơn từ 500K</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <FiShield className="text-blue-500" size={18} />
                                    <span>Thanh toán an toàn & bảo mật</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
