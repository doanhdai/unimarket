import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiSave, FiShoppingBag, FiPackage, FiStar } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import Loading from '../components/common/Loading';

const Profile = () => {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await authService.getProfile();
            setProfile(response.data.data);
            setFormData({
                fullName: response.data.data.fullName || '',
                phone: response.data.data.phone || '',
                address: response.data.data.address || ''
            });
        } catch (error) {
            toast.error('Không thể tải thông tin');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await authService.updateProfile(formData);
            setProfile(response.data.data);
            setUser({ ...user, ...response.data.data });
            setEditing(false);
            toast.success('Cập nhật thành công!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Cập nhật thất bại');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    <div className="bg-linear-to-r from-indigo-500 to-purple-600 px-8 py-12">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                <span className="text-4xl font-bold text-white">
                                    {profile?.fullName?.charAt(0) || profile?.email?.charAt(0) || 'U'}
                                </span>
                            </div>
                            <div className="text-white">
                                <h1 className="text-3xl font-bold">{profile?.fullName || 'Người dùng'}</h1>
                                <p className="text-white/80">{profile?.email}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${profile?.role === 'ADMIN' ? 'bg-red-500' :
                                            profile?.role === 'SELLER' ? 'bg-green-500' : 'bg-white/20'
                                        }`}>
                                        {profile?.role === 'ADMIN' ? 'Quản trị viên' :
                                            profile?.role === 'SELLER' ? 'Người bán' : 'Khách hàng'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Thông tin cá nhân</h2>
                            {!editing && (
                                <button
                                    onClick={() => setEditing(true)}
                                    className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                                >
                                    <FiEdit2 />
                                    Chỉnh sửa
                                </button>
                            )}
                        </div>

                        {editing ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <FiUser className="inline mr-2" />
                                        Họ và tên
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Nhập họ và tên"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <FiPhone className="inline mr-2" />
                                        Số điện thoại
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Nhập số điện thoại"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <FiMapPin className="inline mr-2" />
                                        Địa chỉ
                                    </label>
                                    <textarea
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Nhập địa chỉ"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 py-3 bg-linear-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <FiSave />
                                        {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditing(false)}
                                        className="px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                    <FiMail className="text-gray-400 text-xl" />
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium text-gray-900">{profile?.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                    <FiUser className="text-gray-400 text-xl" />
                                    <div>
                                        <p className="text-sm text-gray-500">Họ và tên</p>
                                        <p className="font-medium text-gray-900">{profile?.fullName || 'Chưa cập nhật'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                    <FiPhone className="text-gray-400 text-xl" />
                                    <div>
                                        <p className="text-sm text-gray-500">Số điện thoại</p>
                                        <p className="font-medium text-gray-900">{profile?.phone || 'Chưa cập nhật'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                    <FiMapPin className="text-gray-400 text-xl" />
                                    <div>
                                        <p className="text-sm text-gray-500">Địa chỉ</p>
                                        <p className="font-medium text-gray-900">{profile?.address || 'Chưa cập nhật'}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-8 pt-8 border-t border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Liên kết nhanh</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Link
                                    to="/orders"
                                    className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
                                >
                                    <FiShoppingBag className="text-indigo-600 text-xl" />
                                    <span className="font-medium text-indigo-600">Đơn hàng của tôi</span>
                                </Link>
                                {profile?.role === 'SELLER' ? (
                                    <Link
                                        to="/seller/dashboard"
                                        className="flex items-center gap-3 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
                                    >
                                        <FiPackage className="text-green-600 text-xl" />
                                        <span className="font-medium text-green-600">Quản lý shop</span>
                                    </Link>
                                ) : profile?.role !== 'ADMIN' && (
                                    <Link
                                        to="/register-seller"
                                        className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors"
                                    >
                                        <FiStar className="text-orange-600 text-xl" />
                                        <span className="font-medium text-orange-600">Đăng ký bán hàng</span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
