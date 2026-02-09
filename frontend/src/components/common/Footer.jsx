import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiYoutube, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Footer = () => {
    return (
        <footer className="bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-white mt-auto">
            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <Link to="/" className="flex items-center gap-3 mb-6">
                            <img src="/logo.png" alt="UniMarket" className="h-16 w-auto" />
                            <span className="text-2xl font-bold">UniMarket</span>
                        </Link>
                        <p className="text-gray-400 leading-relaxed mb-6">
                            Nền tảng mua bán trực tuyến hàng đầu dành cho cộng đồng sinh viên và giới trẻ Việt Nam.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-indigo-500 transition-colors">
                                <FiFacebook size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-pink-500 transition-colors">
                                <FiInstagram size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-red-500 transition-colors">
                                <FiYoutube size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6">Khám phá</h3>
                        <ul className="space-y-4">
                            <li><Link to="/products" className="text-gray-400 hover:text-white transition-colors">Sản phẩm</Link></li>
                            <li><Link to="/categories" className="text-gray-400 hover:text-white transition-colors">Danh mục</Link></li>
                            <li><Link to="/sellers" className="text-gray-400 hover:text-white transition-colors">Cửa hàng</Link></li>
                            <li><Link to="/deals" className="text-gray-400 hover:text-white transition-colors">Khuyến mãi</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6">Hỗ trợ</h3>
                        <ul className="space-y-4">
                            <li><Link to="/help" className="text-gray-400 hover:text-white transition-colors">Trung tâm trợ giúp</Link></li>
                            <li><Link to="/shipping" className="text-gray-400 hover:text-white transition-colors">Chính sách vận chuyển</Link></li>
                            <li><Link to="/returns" className="text-gray-400 hover:text-white transition-colors">Đổi trả hoàn tiền</Link></li>
                            <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Điều khoản sử dụng</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6">Liên hệ</h3>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-gray-400">
                                <FiMapPin size={18} className="text-indigo-400" />
                                TP. Hồ Chí Minh, Việt Nam
                            </li>
                            <li className="flex items-center gap-3 text-gray-400">
                                <FiPhone size={18} className="text-indigo-400" />
                                1900 1234
                            </li>
                            <li className="flex items-center gap-3 text-gray-400">
                                <FiMail size={18} className="text-indigo-400" />
                                support@unimarket.vn
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Footer */}
            <div className="border-t border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-gray-400 text-sm">
                            © 2024 UniMarket. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6 text-sm">
                            <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Chính sách bảo mật</Link>
                            <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Điều khoản</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
