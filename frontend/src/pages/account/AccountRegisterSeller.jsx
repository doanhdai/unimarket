import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import { FiShoppingBag, FiFileText, FiMapPin, FiPhone, FiCheck, FiArrowRight } from 'react-icons/fi';
import { toast } from 'react-toastify';

const AccountRegisterSeller = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        shopName: '',
        shopDescription: '',
        shopAddress: '',
        shopPhone: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authService.registerSeller(formData);
            toast.success('Đăng ký bán hàng thành công! Vui lòng chờ admin phê duyệt.');
            navigate('/account/profile');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Đăng ký thất bại');
        } finally {
            setLoading(false);
        }
    };

    const benefits = [
        { icon: FiShoppingBag, title: 'Tiếp cận khách hàng', desc: 'Hàng triệu người dùng đang chờ sản phẩm của bạn' },
        { icon: FiCheck, title: 'Miễn phí đăng ký', desc: 'Không mất phí khởi tạo, chỉ trả khi bán được' },
        { icon: FiArrowRight, title: 'Dễ dàng quản lý', desc: 'Công cụ quản lý shop hiện đại và trực quan' }
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-orange-600 p-6 text-white text-center">
                <FiShoppingBag className="w-12 h-12 mx-auto mb-3" />
                <h1 className="text-2xl font-bold">Đăng ký bán hàng</h1>
                <p className="text-white/80 text-sm mt-1">Bắt đầu kinh doanh online cùng UniMarket</p>
            </div>

            <div className="p-6">
                {step === 1 ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="text-center p-4 bg-gray-50 rounded-xl">
                                    <benefit.icon className="w-10 h-10 mx-auto text-orange-500 mb-3" />
                                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{benefit.title}</h3>
                                    <p className="text-xs text-gray-500">{benefit.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="bg-orange-50 rounded-xl p-4">
                            <h3 className="font-semibold text-orange-800 mb-2 text-sm">Điều kiện đăng ký:</h3>
                            <ul className="space-y-1 text-orange-700 text-sm">
                                <li className="flex items-center gap-2"><FiCheck className="text-orange-500" /> Đã có tài khoản UniMarket</li>
                                <li className="flex items-center gap-2"><FiCheck className="text-orange-500" /> Cung cấp thông tin shop đầy đủ</li>
                                <li className="flex items-center gap-2"><FiCheck className="text-orange-500" /> Cam kết tuân thủ quy định</li>
                            </ul>
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            className="w-full py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-all flex items-center justify-center gap-2"
                        >
                            Bắt đầu đăng ký <FiArrowRight />
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <button type="button" onClick={() => setStep(1)} className="text-gray-500 hover:text-gray-700 text-sm">
                            ← Quay lại
                        </button>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiShoppingBag className="inline mr-2" /> Tên shop *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.shopName}
                                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="VD: Shop Thời Trang ABC"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiFileText className="inline mr-2" /> Mô tả shop
                            </label>
                            <textarea
                                rows={3}
                                value={formData.shopDescription}
                                onChange={(e) => setFormData({ ...formData, shopDescription: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="Mô tả về shop và sản phẩm..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiMapPin className="inline mr-2" /> Địa chỉ shop *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.shopAddress}
                                onChange={(e) => setFormData({ ...formData, shopAddress: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="Nhập địa chỉ shop"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiPhone className="inline mr-2" /> Số điện thoại shop *
                            </label>
                            <input
                                type="tel"
                                required
                                value={formData.shopPhone}
                                onChange={(e) => setFormData({ ...formData, shopPhone: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="Nhập số điện thoại"
                            />
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4">
                            <label className="flex items-start gap-3">
                                <input type="checkbox" required className="mt-1" />
                                <span className="text-sm text-gray-600">
                                    Tôi đã đọc và đồng ý với Điều khoản dịch vụ và Chính sách bán hàng của UniMarket
                                </span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Đang xử lý...' : 'Gửi đăng ký'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AccountRegisterSeller;
