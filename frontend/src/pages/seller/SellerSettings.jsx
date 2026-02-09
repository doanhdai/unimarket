import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';
import { FiSave, FiShoppingBag, FiMapPin, FiPhone, FiFileText } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Loading from '../../components/common/Loading';

const SellerSettings = () => {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        shopName: '',
        shopDescription: '',
        shopAddress: '',
        shopPhone: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await authService.getProfile();
            const data = response.data.data;
            setFormData({
                shopName: data.shopName || '',
                shopDescription: data.shopDescription || '',
                shopAddress: data.shopAddress || '',
                shopPhone: data.shopPhone || ''
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
            setUser({ ...user, ...response.data.data });
            toast.success('Đã cập nhật thông tin shop!');
        } catch (error) {
            toast.error('Cập nhật thất bại');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Cài đặt Shop</h1>
                <p className="text-gray-500">Quản lý thông tin shop của bạn</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FiShoppingBag className="inline mr-2" />
                            Tên Shop
                        </label>
                        <input
                            type="text"
                            value={formData.shopName}
                            onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Tên shop của bạn"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FiFileText className="inline mr-2" />
                            Mô tả Shop
                        </label>
                        <textarea
                            rows={4}
                            value={formData.shopDescription}
                            onChange={(e) => setFormData({ ...formData, shopDescription: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Mô tả về shop và sản phẩm của bạn..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FiMapPin className="inline mr-2" />
                            Địa chỉ Shop
                        </label>
                        <input
                            type="text"
                            value={formData.shopAddress}
                            onChange={(e) => setFormData({ ...formData, shopAddress: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Địa chỉ shop"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FiPhone className="inline mr-2" />
                            Số điện thoại
                        </label>
                        <input
                            type="tel"
                            value={formData.shopPhone}
                            onChange={(e) => setFormData({ ...formData, shopPhone: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Số điện thoại liên hệ"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-3 bg-linear-to-r from-indigo-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <FiSave />
                        {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SellerSettings;
