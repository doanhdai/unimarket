import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productService, categoryService } from '../services/api';
import ProductCard from '../components/common/ProductCard';
import Loading from '../components/common/Loading';
import { FiArrowRight, FiTrendingUp, FiZap, FiStar } from 'react-icons/fi';

const Home = () => {
    const { isSeller } = useAuth();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [prodResponse, catResponse] = await Promise.all([
                productService.getAll({ page: 0, size: 12, sortBy: 'viewCount', sortDir: 'desc' }),
                categoryService.getAll()
            ]);
            setProducts(prodResponse.data.data?.content || []);
            setCategories(catResponse.data.data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
            {/* Hero Section */}
            <section className="relative overflow-hidden" style={{ backgroundImage: 'url(/image.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                {/* Overlay for text readability */}
                <div className="absolute inset-0 bg-black/20"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
                    <div className="flex justify-end">
                        <div className="text-right max-w-xl">
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-white/90 text-sm font-medium backdrop-blur-sm mb-8">
                                <FiZap className="text-yellow-300" />
                                Khuyến mãi lên đến 50%
                            </span>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                                Mua sắm thông minh
                                <br />
                                <span className="text-transparent bg-clip-text bg-linear-to-r from-yellow-200 to-yellow-400">
                                    cùng UniMarket
                                </span>
                            </h1>
                            <p className="mt-6 text-lg text-white/80">
                                Nền tảng mua bán trực tuyến hàng đầu dành cho sinh viên. Mua sắm an toàn, giao hàng nhanh chóng.
                            </p>
                            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-end">
                                <Link
                                    to="/products"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-indigo-600 font-semibold rounded-2xl hover:bg-gray-100 transition-all shadow-lg shadow-black/20 hover:shadow-xl hover:-translate-y-1"
                                >
                                    Khám phá ngay
                                    <FiArrowRight />
                                </Link>
                                <Link
                                    to="/register-seller"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent text-white font-semibold rounded-2xl border-2 border-white/30 hover:bg-white/10 transition-all"
                                >
                                    Trở thành người bán
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Wave */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(249 250 251)" />
                    </svg>
                </div>
            </section>

            {/* Categories */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Danh mục nổi bật</h2>
                        <p className="mt-2 text-gray-500">Khám phá sản phẩm theo danh mục</p>
                    </div>
                    <Link to="/categories" className="hidden sm:flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700">
                        Xem tất cả <FiArrowRight />
                    </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {categories.slice(0, 8).map((category, index) => (
                        <Link
                            key={category.id}
                            to={`/category/${category.id}`}
                            className="group relative overflow-hidden rounded-2xl aspect-4/3 bg-gray-100"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <img
                                src={category.image || `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400`}
                                alt={category.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent"></div>
                            <div className="absolute bottom-4 left-4 right-4">
                                <h3 className="text-white font-semibold text-lg">{category.name}</h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Featured Products */}
            <section className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            {/* <div className="w-12 h-12 bg-linear-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                                <FiTrendingUp className="text-white" size={24} />
                            </div> */}
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Sản phẩm nổi bật</h2>
                                <p className="text-gray-500">Được xem nhiều nhất</p>
                            </div>
                        </div>
                        <Link to="/products?sort=popular" className="hidden sm:flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700">
                            Xem tất cả <FiArrowRight />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {products.slice(0, 8).map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    <div className="mt-12 text-center sm:hidden">
                        <Link to="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
                            Xem thêm sản phẩm <FiArrowRight />
                        </Link>
                    </div>
                </div>
            </section>

            {/* New Products */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        {/* <div className="w-12 h-12 bg-linear-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                            <FiStar className="text-white" size={24} />
                        </div> */}
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Sản phẩm mới</h2>
                            <p className="text-gray-500">Mới nhất trên UniMarket</p>
                        </div>
                    </div>
                    <Link to="/products?sort=newest" className="hidden sm:flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700">
                        Xem tất cả <FiArrowRight />
                    </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {products.slice(0, 4).map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </section>

            {/* CTA Banner - Only show for non-sellers */}
            {!isSeller && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="relative overflow-hidden rounded-3xl bg-indigo-600 px-8 py-16 sm:px-16 sm:py-20 text-center">
                        <div className="relative">
                            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                                Bắt đầu bán hàng ngay hôm nay
                            </h2>
                            <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8">
                                Đăng ký trở thành người bán để tiếp cận hàng ngàn khách hàng tiềm năng. Hoàn toàn miễn phí!
                            </p>
                            <Link
                                to="/register-seller"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 font-semibold rounded-2xl hover:bg-gray-100 transition-all shadow-lg"
                            >
                                Đăng ký ngay <FiArrowRight />
                            </Link>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default Home;
