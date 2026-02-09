import { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../context/CartContext';

const PaymentResult = () => {
    const [searchParams] = useSearchParams();
    const status = searchParams.get('status');
    const orderId = searchParams.get('orderId');
    const { fetchCart } = useCart();
    const [loading, setLoading] = useState(true);
    const hasRefreshed = useRef(false);

    useEffect(() => {
        const clearCartAfterPayment = async () => {
            if (status === 'success' && !hasRefreshed.current) {
                hasRefreshed.current = true;
                await fetchCart();
            }
            setLoading(false);
        };
        clearCartAfterPayment();
    }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

    const isSuccess = status === 'success';

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
                {/* Icon */}
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${isSuccess ? 'bg-green-100' : 'bg-red-100'}`}>
                    {isSuccess ? (
                        <FiCheckCircle size={40} className="text-green-600" />
                    ) : (
                        <FiXCircle size={40} className="text-red-600" />
                    )}
                </div>

                {/* Title */}
                <h1 className={`text-2xl font-bold mb-2 ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                    {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
                </h1>

                {/* Description */}
                <p className="text-gray-500 mb-6">
                    {isSuccess ? (
                        <>
                            Đơn hàng #{orderId} của bạn đã được thanh toán thành công.
                            <br />
                            Cảm ơn bạn đã mua hàng!
                        </>
                    ) : (
                        <>
                            Rất tiếc, thanh toán không thành công.
                            <br />
                            Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
                        </>
                    )}
                </p>

                {/* Order Details for Success */}
                {isSuccess && orderId && (
                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Mã đơn hàng</span>
                            <span className="font-semibold text-gray-900">#{orderId}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-2">
                            <span className="text-gray-500">Phương thức</span>
                            <span className="font-semibold text-gray-900">VNPay</span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-2">
                            <span className="text-gray-500">Trạng thái</span>
                            <span className="font-semibold text-green-600">Đã thanh toán</span>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    {isSuccess ? (
                        <>
                            <Link
                                to="/orders"
                                className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                            >
                                <FiShoppingBag />
                                Xem đơn hàng
                            </Link>
                            <Link
                                to="/products"
                                className="w-full py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                            >
                                Tiếp tục mua sắm
                                <FiArrowRight />
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/checkout"
                                className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                            >
                                Thử lại
                            </Link>
                            <Link
                                to="/cart"
                                className="w-full py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Quay lại giỏ hàng
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentResult;
