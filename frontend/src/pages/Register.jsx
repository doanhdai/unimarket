import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiArrowRight, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Mật khẩu không khớp');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        setLoading(true);
        try {
            await authService.register({
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                phone: formData.phone
            });
            toast.success('Đăng ký thành công! Vui lòng đăng nhập');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Đăng ký thất bại');
        } finally {
            setLoading(false);
        }
    };

    const passwordStrength = () => {
        const pwd = formData.password;
        let strength = 0;
        if (pwd.length >= 6) strength++;
        if (pwd.length >= 8) strength++;
        if (/[A-Z]/.test(pwd)) strength++;
        if (/[0-9]/.test(pwd)) strength++;
        if (/[^A-Za-z0-9]/.test(pwd)) strength++;
        return strength;
    };

    const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];
    const strengthLabels = ['Rất yếu', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'];

    return (
        <div className="min-h-screen flex">
            {/* Left - Image */}
            <div className="hidden lg:block lg:flex-1 relative bg-indigo-600">
                <div className="absolute inset-0 flex items-center justify-center p-12">
                    <div className="text-center text-white">
                        <h2 className="text-4xl font-bold mb-6">Tham gia UniMarket</h2>
                        <p className="text-white/80 text-lg max-w-md">
                            Đăng ký ngay để trải nghiệm mua sắm tuyệt vời và nhận nhiều ưu đãi hấp dẫn
                        </p>
                        <div className="mt-10 grid grid-cols-2 gap-4">
                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 text-left">
                                <FiCheck className="w-8 h-8 mb-2" />
                                <p className="font-medium">Miễn phí đăng ký</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 text-left">
                                <FiCheck className="w-8 h-8 mb-2" />
                                <p className="font-medium">Bảo mật tuyệt đối</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 text-left">
                                <FiCheck className="w-8 h-8 mb-2" />
                                <p className="font-medium">Ưu đãi độc quyền</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 text-left">
                                <FiCheck className="w-8 h-8 mb-2" />
                                <p className="font-medium">Hỗ trợ 24/7</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right - Form */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center">
                            <span className="text-white font-bold text-2xl">U</span>
                        </div>
                        <span className="text-2xl font-bold gradient-text">UniMarket</span>
                    </Link>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Tạo tài khoản mới</h1>
                    <p className="text-gray-500 mb-8">Đăng ký để bắt đầu mua sắm</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                            <div className="relative">
                                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Nguyễn Văn A"
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <div className="relative">
                                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="your@email.com"
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                            <div className="relative">
                                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="0901234567"
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
                            <div className="relative">
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                                </button>
                            </div>
                            {formData.password && (
                                <div className="mt-2">
                                    <div className="flex gap-1 mb-1">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className={`h-1 flex-1 rounded-full ${i < passwordStrength() ? strengthColors[passwordStrength() - 1] : 'bg-gray-200'}`}></div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500">Độ mạnh: {strengthLabels[passwordStrength() - 1] || 'Rất yếu'}</p>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu</label>
                            <div className="relative">
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                />
                                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                                    <FiCheck className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" size={20} />
                                )}
                            </div>
                        </div>

                        {/* Terms */}
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input type="checkbox" required className="w-5 h-5 mt-0.5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
                            <span className="text-sm text-gray-600">
                                Tôi đồng ý với{' '}
                                <Link to="/terms" className="text-indigo-600 hover:underline">Điều khoản sử dụng</Link>
                                {' '}và{' '}
                                <Link to="/privacy" className="text-indigo-600 hover:underline">Chính sách bảo mật</Link>
                            </span>
                        </label>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Đăng ký
                                    <FiArrowRight />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <p className="mt-8 text-center text-gray-600">
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-700">
                            Đăng nhập
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
