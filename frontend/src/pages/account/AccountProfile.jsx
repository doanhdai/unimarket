import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiSave } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Loading from '../../components/common/Loading';

const AccountProfile = () => {
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
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900">Thông tin tài khoản</h1>
                    {!editing && (
                        <button
                            onClick={() => setEditing(true)}
                            className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                        >
                            <FiEdit2 size={18} />
                            Chỉnh sửa
                        </button>
                    )}
                </div>
            </div>

            <div className="p-6">
                {editing ? (
                    <form onSubmit={handleSubmit} className="space-y-5">
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
                        <div className="flex gap-3 pt-2">
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
            </div>
        </div>
    );
};

export default AccountProfile;
