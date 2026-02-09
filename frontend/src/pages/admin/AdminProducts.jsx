import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/api';
import Loading from '../../components/common/Loading';
import { FiCheck, FiX, FiEye } from 'react-icons/fi';
import { toast } from 'react-toastify';

const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await adminService.getPendingProducts({ page: 0, size: 50 });
            setProducts(response.data.data?.content || []);
        } catch (error) {
            toast.error('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id, approve) => {
        try {
            await adminService.approveProduct(id, approve);
            toast.success(approve ? 'Đã duyệt sản phẩm' : 'Đã từ chối');
            fetchProducts();
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Duyệt Sản phẩm</h1>
                <p className="text-gray-500">{products.length} sản phẩm đang chờ</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {products.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500">Không có sản phẩm nào đang chờ duyệt</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Sản phẩm</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Giá</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Shop</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Danh mục</th>
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
                                            <span className="font-medium text-gray-900">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-indigo-600 font-semibold">{formatPrice(product.price)}</td>
                                    <td className="px-6 py-4 text-gray-500">{product.shopName}</td>
                                    <td className="px-6 py-4 text-gray-500">{product.categoryName}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            to={`/products/${product.id}`}
                                            target="_blank"
                                            className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg inline-block mr-2"
                                        >
                                            <FiEye size={18} />
                                        </Link>
                                        <button
                                            onClick={() => handleApprove(product.id, true)}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg mr-2"
                                        >
                                            <FiCheck size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleApprove(product.id, false)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                        >
                                            <FiX size={18} />
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

export default AdminProducts;
