import { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import Loading from '../../components/common/Loading';
import { FiCheck, FiX, FiSearch } from 'react-icons/fi';
import { toast } from 'react-toastify';

const AdminSellers = () => {
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSellers();
    }, []);

    const fetchSellers = async () => {
        try {
            const response = await adminService.getPendingSellers({ page: 0, size: 50 });
            setSellers(response.data.data?.content || []);
        } catch (error) {
            toast.error('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id, approve) => {
        try {
            await adminService.approveSeller(id, approve);
            toast.success(approve ? 'Đã duyệt seller' : 'Đã từ chối');
            fetchSellers();
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Duyệt Seller</h1>
                    <p className="text-gray-500">{sellers.length} yêu cầu đang chờ</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {sellers.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500">Không có yêu cầu nào đang chờ duyệt</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">ID</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Họ tên</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tên shop</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">SĐT</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {sellers.map((seller) => (
                                <tr key={seller.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-gray-500">#{seller.id}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{seller.fullName}</td>
                                    <td className="px-6 py-4 text-gray-500">{seller.email}</td>
                                    <td className="px-6 py-4 text-gray-900">{seller.shopName}</td>
                                    <td className="px-6 py-4 text-gray-500">{seller.shopPhone || '-'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleApprove(seller.id, true)}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg mr-2"
                                        >
                                            <FiCheck size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleApprove(seller.id, false)}
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

export default AdminSellers;
