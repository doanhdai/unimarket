import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService } from '../services/api';
import Loading from '../components/common/Loading';
import ProductCard from '../components/common/ProductCard';
import { FiMapPin, FiPhone, FiPackage, FiStar, FiShoppingBag, FiCalendar, FiMail, FiUser, FiCheckCircle } from 'react-icons/fi';

const ShopDetail = () => {
    const { sellerId } = useParams();
    const [shop, setShop] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchShopData();
    }, [sellerId]);

    const fetchShopData = async () => {
        try {
            setLoading(true);
            const response = await productService.getBySeller(sellerId, { page: 0, size: 20 });
            const productsData = response.data.data?.content || [];
            setProducts(productsData);

            if (productsData.length > 0) {
                const p = productsData[0];
                setShop({
                    id: sellerId,
                    name: p.shopName || 'Shop',
                    description: p.shopDescription || 'Chào mừng bạn đến với shop!',
                    address: p.shopAddress || '',
                    phone: p.shopPhone || '',
                    sellerName: p.sellerName || '',
                    sellerEmail: p.sellerEmail || '',
                    productCount: response.data.data?.totalElements || productsData.length,
                    rating: 4.8,
                    followers: Math.floor(Math.random() * 500) + 100
                });
            }
        } catch (error) {
            console.error('Error fetching shop:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Shop Header - Hero Section */}
            <div className="relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-linear-to-br from-indigo-600 via-purple-600 to-pink-500"></div>
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-72 h-72 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Shop Avatar */}
                            <div className="flex flex-col items-center lg:items-start gap-4">
                                <div className="w-32 h-32 bg-white rounded-2xl shadow-2xl flex items-center justify-center">
                                    <span className="text-5xl font-bold bg-linear-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                        {shop?.name?.charAt(0) || 'S'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                    <FiCheckCircle size={14} />
                                    Đã xác thực
                                </div>
                            </div>

                            {/* Shop Info */}
                            <div className="flex-1 text-white text-center lg:text-left">
                                <h1 className="text-4xl font-bold mb-2">{shop?.name || 'Shop'}</h1>
                                <p className="text-white/80 text-lg max-w-2xl">
                                    {shop?.description}
                                </p>

                                {/* Quick Stats */}
                                <div className="flex flex-wrap justify-center lg:justify-start gap-6 mt-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                            <FiPackage size={18} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-xl">{shop?.productCount || 0}</p>
                                            <p className="text-xs text-white/70">Sản phẩm</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                            <FiStar size={18} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-xl">{shop?.rating || 5.0}</p>
                                            <p className="text-xs text-white/70">Đánh giá</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                            <FiUser size={18} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-xl">{shop?.followers || 0}</p>
                                            <p className="text-xs text-white/70">Theo dõi</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info Card */}
                            <div className="bg-white rounded-2xl p-6 text-gray-900 min-w-[280px] shadow-xl">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                        <FiShoppingBag className="text-indigo-600" size={16} />
                                    </span>
                                    Thông tin liên hệ
                                </h3>
                                <div className="space-y-3">
                                    {shop?.sellerName && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <FiUser className="text-gray-400" size={16} />
                                            <span className="text-gray-600">Chủ shop:</span>
                                            <span className="font-medium">{shop.sellerName}</span>
                                        </div>
                                    )}
                                    {shop?.phone && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <FiPhone className="text-gray-400" size={16} />
                                            <span className="text-gray-600">Điện thoại:</span>
                                            <span className="font-medium">{shop.phone}</span>
                                        </div>
                                    )}
                                    {shop?.address && (
                                        <div className="flex items-start gap-3 text-sm">
                                            <FiMapPin className="text-gray-400 mt-0.5" size={16} />
                                            <span className="text-gray-600">Địa chỉ:</span>
                                            <span className="font-medium flex-1">{shop.address}</span>
                                        </div>
                                    )}
                                    {!shop?.phone && !shop?.address && !shop?.sellerName && (
                                        <p className="text-gray-400 text-sm">Chưa cập nhật thông tin</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <span className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                            <FiShoppingBag className="text-indigo-600" size={20} />
                        </span>
                        Sản phẩm của Shop
                    </h2>
                    <span className="px-4 py-2 bg-gray-100 rounded-xl text-gray-600 font-medium">
                        {products.length} sản phẩm
                    </span>
                </div>

                {products.length === 0 ? (
                    <div className="bg-white rounded-3xl p-16 text-center shadow-sm">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FiPackage size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có sản phẩm</h3>
                        <p className="text-gray-500">Shop chưa đăng bán sản phẩm nào</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShopDetail;
