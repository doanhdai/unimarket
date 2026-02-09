import { useState, useEffect } from 'react';
import { categoryService } from '../../services/api';
import Loading from '../../components/common/Loading';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiImage, FiUpload } from 'react-icons/fi';
import { toast } from 'react-toastify';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', image: '' });
    const [imagePreview, setImagePreview] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await categoryService.getAll();
            setCategories(response.data.data || []);
        } catch (error) {
            toast.error('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn file ảnh');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Kích thước ảnh tối đa 5MB');
            return;
        }

        setUploading(true);
        try {
            const formDataUpload = new FormData();
            formDataUpload.append('file', file);

            const response = await fetch('http://localhost:8080/api/upload/image', {
                method: 'POST',
                body: formDataUpload,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();
            if (data.data) {
                setFormData(prev => ({ ...prev, image: data.data }));
                setImagePreview(data.data);
                toast.success('Upload ảnh thành công');
            }
        } catch (error) {
            toast.error('Lỗi khi upload ảnh');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await categoryService.update(editingId, formData);
                toast.success('Đã cập nhật danh mục');
            } else {
                await categoryService.create(formData);
                toast.success('Đã thêm danh mục');
            }
            setShowForm(false);
            setEditingId(null);
            setFormData({ name: '', description: '', image: '' });
            setImagePreview('');
            fetchCategories();
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    const handleEdit = (category) => {
        setFormData({
            name: category.name,
            description: category.description || '',
            image: category.image || ''
        });
        setImagePreview(category.image || '');
        setEditingId(category.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa danh mục này?')) return;
        try {
            await categoryService.delete(id);
            toast.success('Đã xóa danh mục');
            fetchCategories();
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({ name: '', description: '', image: '' });
        setImagePreview('');
    };

    if (loading) return <Loading />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Danh mục</h1>
                    <p className="text-gray-500">{categories.length} danh mục</p>
                </div>
                <button
                    onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: '', description: '', image: '' }); setImagePreview(''); }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                    <FiPlus /> Thêm danh mục
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="font-bold text-lg mb-4">{editingId ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Nhập tên danh mục"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Mô tả danh mục"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh nền danh mục</label>
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-indigo-400 transition-colors">
                                    {imagePreview ? (
                                        <div className="relative">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-32 object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => { setImagePreview(''); setFormData(prev => ({ ...prev, image: '' })); }}
                                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                            >
                                                <FiX size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer block">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                                disabled={uploading}
                                            />
                                            <div className="py-8">
                                                {uploading ? (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                                        <span className="text-sm text-gray-500">Đang upload...</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <FiUpload className="text-gray-400" size={32} />
                                                        <span className="text-sm text-gray-500">Click để upload ảnh nền</span>
                                                        <span className="text-xs text-gray-400">PNG, JPG tối đa 5MB</span>
                                                    </div>
                                                )}
                                            </div>
                                        </label>
                                    )}
                                </div>
                                <div className="mt-2">
                                    <label className="block text-xs text-gray-500 mb-1">Hoặc nhập URL ảnh</label>
                                    <input
                                        type="url"
                                        value={formData.image}
                                        onChange={(e) => { setFormData({ ...formData, image: e.target.value }); setImagePreview(e.target.value); }}
                                        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700">
                                <FiCheck className="inline mr-1" /> {editingId ? 'Cập nhật' : 'Thêm'}
                            </button>
                            <button type="button" onClick={resetForm} className="px-4 py-2 border rounded-xl hover:bg-gray-50">
                                <FiX className="inline mr-1" /> Hủy
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">ID</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Ảnh nền</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tên danh mục</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Mô tả</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {categories.map((category) => (
                            <tr key={category.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-gray-500">#{category.id}</td>
                                <td className="px-6 py-4">
                                    {category.image ? (
                                        <img
                                            src={category.image}
                                            alt={category.name}
                                            className="w-16 h-10 object-cover rounded-lg"
                                        />
                                    ) : (
                                        <div className="w-16 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <FiImage className="text-gray-400" size={16} />
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900">{category.name}</td>
                                <td className="px-6 py-4 text-gray-500">{category.description || '-'}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleEdit(category)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg mr-2">
                                        <FiEdit2 size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(category.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                        <FiTrash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminCategories;

