import { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import Loading from '../../components/common/Loading';
import { FiSearch, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await adminService.getUsers({ page: 0, size: 50 });
            setUsers(response.data.data?.content || []);
        } catch (error) {
            toast.error('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return;
        try {
            await adminService.deleteUser(id);
            toast.success('Đã xóa người dùng');
            fetchUsers();
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    const filteredUsers = users.filter(u =>
        u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    const getRoleBadge = (role) => {
        switch (role) {
            case 'ADMIN': return 'bg-red-100 text-red-700';
            case 'SELLER': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Người dùng</h1>
                    <p className="text-gray-500">{users.length} người dùng</p>
                </div>
                <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">ID</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Họ tên</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Vai trò</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Shop</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-gray-500">#{user.id}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">{user.fullName}</td>
                                <td className="px-6 py-4 text-gray-500">{user.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500">{user.shopName || '-'}</td>
                                <td className="px-6 py-4 text-right">
                                    {user.role !== 'ADMIN' && (
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                        >
                                            <FiTrash2 size={18} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;
