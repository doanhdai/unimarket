import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { toast } from 'react-toastify';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        setLoading(true);
        try {
            const userData = await login({ email, password });

            // Redirect based on role
            if (userData.role === 'ADMIN') {
                navigate('/admin/dashboard');
            } else if (userData.role === 'SELLER' || userData.sellerApproved) {
                navigate('/seller/dashboard');
            } else {
                navigate('/');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left - Form */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center">
                            <span className="text-white font-bold text-2xl">U</span>
                        </div>
                        <span className="text-2xl font-bold gradient-text">UniMarket</span>
                    </Link>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Chào mừng trở lại!</h1>
                    <p className="text-gray-500 mb-8">Đăng nhập để tiếp tục mua sắm</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <div className="relative">
                                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
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
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
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
                        </div>

                        {/* Remember & Forgot */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
                                <span className="text-sm text-gray-600">Ghi nhớ đăng nhập</span>
                            </label>
                            <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                                Quên mật khẩu?
                            </Link>
                        </div>

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
                                    Đăng nhập
                                    <FiArrowRight />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-8 flex items-center gap-4">
                        <div className="flex-1 h-px bg-gray-200"></div>
                        <span className="text-sm text-gray-400">hoặc</span>
                        <div className="flex-1 h-px bg-gray-200"></div>
                    </div>

                    {/* Social Login */}
                    <div className="flex gap-4">
                        <button className="flex-1 py-3 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                            <span className="font-medium text-gray-700">Google</span>
                        </button>
                        <button className="flex-1 py-3 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                            <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="w-5 h-5" />
                            <span className="font-medium text-gray-700">Facebook</span>
                        </button>
                    </div>

                    {/* Register Link */}
                    <p className="mt-8 text-center text-gray-600">
                        Chưa có tài khoản?{' '}
                        <Link to="/register" className="text-indigo-600 font-semibold hover:text-indigo-700">
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right - Image */}
            <div className="hidden lg:block lg:flex-1 relative bg-indigo-600">
                <div className="absolute inset-0 flex items-center justify-center p-12">
                    <div className="text-center text-white">
                        <h2 className="text-4xl font-bold mb-6">Mua sắm dễ dàng</h2>
                        <p className="text-white/80 text-lg max-w-md">
                            Hàng ngàn sản phẩm chất lượng từ các người bán uy tín đang chờ bạn khám phá
                        </p>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="text-2xl">🛒</span>
                            </div>
                            <div>
                                <p className="text-white font-medium">Đơn hàng mới</p>
                                <p className="text-white/70 text-sm">+2,500 đơn hàng hôm nay</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
