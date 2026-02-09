import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/api';
import Loading from '../../components/common/Loading';
import { FiPlus, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import { toast } from 'react-toastify';

const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const statusMap = {
    PENDING: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-700' },
    APPROVED: { label: 'Đang bán', color: 'bg-green-100 text-green-700' },
    REJECTED: { label: 'Bị từ chối', color: 'bg-red-100 text-red-700' }
};

const SellerProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await productService.getMyProducts({ page: 0, size: 50 });
            setProducts(response.data.data?.content || []);
        } catch (error) {
            toast.error('Không thể tải sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
        try {
            await productService.delete(id);
            toast.success('Đã xóa sản phẩm');
            fetchProducts();
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Sản phẩm</h1>
                    <p className="text-gray-500">{products.length} sản phẩm</p>
                </div>
                <Link
                    to="/seller/products/new"
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                >
                    <FiPlus size={18} /> Thêm sản phẩm
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {products.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500 mb-4">Chưa có sản phẩm nào</p>
                        <Link
                            to="/seller/products/new"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700"
                        >
                            <FiPlus /> Thêm sản phẩm đầu tiên
                        </Link>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Sản phẩm</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Giá</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Kho</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Trạng thái</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Lượt xem</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={product.images?.split(',')[0] || '/placeholder.png'}
                                                alt=""
                                                className="w-12 h-12 rounded-lg object-cover"
                                            />
                                            <span className="font-medium text-gray-900 line-clamp-1">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-indigo-600 font-semibold">{formatPrice(product.price)}</td>
                                    <td className="px-6 py-4 text-gray-900">{product.quantity}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusMap[product.status]?.color}`}>
                                            {statusMap[product.status]?.label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{product.viewCount || 0}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            to={`/products/${product.id}`}
                                            target="_blank"
                                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg inline-block"
                                        >
                                            <FiEye size={18} />
                                        </Link>
                                        <Link
                                            to={`/seller/products/${product.id}/edit`}
                                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg inline-block"
                                        >
                                            <FiEdit size={18} />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                        >
                                            <FiTrash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default SellerProducts;
