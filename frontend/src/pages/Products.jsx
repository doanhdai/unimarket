import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService, categoryService } from '../services/api';
import ProductCard from '../components/common/ProductCard';
import Loading from '../components/common/Loading';
import { FiFilter, FiX, FiChevronDown, FiGrid, FiList } from 'react-icons/fi';

const Products = () => {
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [sortBy, setSortBy] = useState('createdAt');
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState('grid');

    const keyword = searchParams.get('keyword');

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [page, selectedCategory, sortBy, keyword]);

    const fetchCategories = async () => {
        try {
            const response = await categoryService.getAll();
            setCategories(response.data.data || []);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            let response;

            if (keyword) {
                response = await productService.search({ keyword, page, size: 12 });
            } else if (selectedCategory) {
                response = await productService.getByCategory(selectedCategory, { page, size: 12 });
            } else {
                response = await productService.getAll({ page, size: 12, sortBy, sortDir: 'desc' });
            }

            setProducts(response.data.data?.content || []);
            setTotalPages(response.data.data?.totalPages || 0);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className=" py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {keyword ? `Kết quả tìm kiếm: "${keyword}"` : 'Tất cả sản phẩm'}
                    </h1>
                    <p className="mt-2 text-gray-600">
                        {products.length} sản phẩm được tìm thấy
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex gap-8">
                    {/* Sidebar Filters - Desktop */}
                    <aside className="hidden lg:block w-64 shrink-0">
                        <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
                            <h3 className="font-bold text-gray-900 mb-4">Danh mục</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className={`w-full text-left px-4 py-2.5 rounded-xl transition-all ${!selectedCategory ? 'bg-indigo-600 text-white font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    Tất cả
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`w-full text-left px-4 py-2.5 rounded-xl transition-all ${selectedCategory === cat.id ? 'bg-indigo-600 text-white font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-4">Sắp xếp</h3>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="createdAt">Mới nhất</option>
                                    <option value="price">Giá thấp đến cao</option>
                                    <option value="viewCount">Phổ biến nhất</option>
                                </select>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        {/* Mobile Filter Bar */}
                        <div className="lg:hidden flex items-center gap-4 mb-6">
                            <button
                                onClick={() => setShowFilters(true)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl shadow-sm font-medium text-gray-700"
                            >
                                <FiFilter size={18} />
                                Bộ lọc
                            </button>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl"
                            >
                                <option value="createdAt">Mới nhất</option>
                                <option value="price">Giá thấp đến cao</option>
                                <option value="viewCount">Phổ biến nhất</option>
                            </select>
                        </div>

                        {/* Products Grid */}
                        {loading ? (
                            <Loading />
                        ) : products.length === 0 ? (
                            <div className="bg-white rounded-2xl p-16 text-center shadow-sm">
                                <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                    <FiGrid size={32} className="text-gray-400" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy sản phẩm</h2>
                                <p className="text-gray-500">Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                    {products.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-12 flex justify-center gap-2">
                                        {Array.from({ length: totalPages }, (_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setPage(i)}
                                                className={`w-10 h-10 rounded-xl font-medium transition-all ${page === i ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>
            </div>

            {/* Mobile Filters Modal */}
            {showFilters && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)}></div>
                    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto animate-slideIn">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Bộ lọc</h3>
                            <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <FiX size={24} />
                            </button>
                        </div>

                        <h4 className="font-semibold text-gray-900 mb-3">Danh mục</h4>
                        <div className="flex flex-wrap gap-2 mb-6">
                            <button
                                onClick={() => { setSelectedCategory(null); setShowFilters(false); }}
                                className={`px-4 py-2 rounded-full transition-all ${!selectedCategory ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                            >
                                Tất cả
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => { setSelectedCategory(cat.id); setShowFilters(false); }}
                                    className={`px-4 py-2 rounded-full transition-all ${selectedCategory === cat.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setShowFilters(false)}
                            className="w-full py-4 bg-indigo-600 text-white font-semibold rounded-xl"
                        >
                            Áp dụng
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
