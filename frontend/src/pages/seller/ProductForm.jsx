import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productService, categoryService } from '../../services/api';
import Loading from '../../components/common/Loading';
import { FiSave, FiX, FiUpload, FiTrash2, FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';

const ProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);
    const [images, setImages] = useState([]);
    const [hasVariants, setHasVariants] = useState(false);
    const [variants, setVariants] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        quantity: '',
        categoryId: ''
    });

    useEffect(() => {
        fetchCategories();
        if (isEdit) fetchProduct();
    }, [id]);

    const fetchCategories = async () => {
        try {
            const response = await categoryService.getAll();
            setCategories(response.data.data || []);
        } catch (error) {
            toast.error('Không thể tải danh mục');
        }
    };

    const fetchProduct = async () => {
        try {
            const response = await productService.getById(id);
            const product = response.data.data;
            setFormData({
                name: product.name || '',
                description: product.description || '',
                price: product.price || '',
                quantity: product.quantity || '',
                categoryId: product.categoryId || ''
            });
            if (product.images) {
                setImages(product.images.split(',').map(url => ({ url, isExisting: true })));
            }
            if (product.variants && product.variants.length > 0) {
                setHasVariants(true);
                setVariants(product.variants.map(v => ({
                    id: v.id,
                    size: v.size || '',
                    color: v.color || '',
                    colorCode: v.colorCode || '#000000',
                    price: v.price || '',
                    quantity: v.quantity || 0,
                    sku: v.sku || '',
                    image: v.images || '',
                    imageFile: null,
                    imagePreview: v.images || ''
                })));
            }
        } catch (error) {
            toast.error('Không thể tải sản phẩm');
            navigate('/seller/products');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map(file => ({
            file,
            url: URL.createObjectURL(file),
            isExisting: false
        }));
        setImages(prev => [...prev, ...newImages]);
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    // Get variant labels based on category
    const getVariantLabels = () => {
        const categoryName = categories.find(c => c.id === parseInt(formData.categoryId))?.name?.toLowerCase() || '';

        if (categoryName.includes('điện thoại') || categoryName.includes('phone')) {
            return { attr1: 'Dung lượng', attr1Placeholder: '64GB, 128GB, 256GB...', attr2: 'Màu sắc', attr2Placeholder: 'Đen, Trắng, Xanh...' };
        }
        if (categoryName.includes('laptop') || categoryName.includes('máy tính')) {
            return { attr1: 'RAM/SSD', attr1Placeholder: '8GB/256GB, 16GB/512GB...', attr2: 'Màu sắc', attr2Placeholder: 'Bạc, Đen, Xám...' };
        }
        if (categoryName.includes('đồng hồ') || categoryName.includes('watch')) {
            return { attr1: 'Kích thước', attr1Placeholder: '40mm, 44mm...', attr2: 'Màu sắc', attr2Placeholder: 'Đen, Bạc, Vàng...' };
        }
        if (categoryName.includes('giày') || categoryName.includes('shoe')) {
            return { attr1: 'Size', attr1Placeholder: '38, 39, 40, 41...', attr2: 'Màu sắc', attr2Placeholder: 'Đen, Trắng...' };
        }
        // Default for clothing/fashion
        return { attr1: 'Size', attr1Placeholder: 'S, M, L, XL...', attr2: 'Màu sắc', attr2Placeholder: 'Đen, Trắng...' };
    };

    const variantLabels = getVariantLabels();

    const addVariant = () => {
        setVariants(prev => [...prev, {
            size: '',
            color: '',
            colorCode: '#6366f1',
            price: formData.price || '',
            quantity: 1,
            sku: '',
            image: '',
            imageFile: null,
            imagePreview: ''
        }]);
    };

    const handleVariantImageChange = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            setVariants(prev => prev.map((v, i) =>
                i === index ? {
                    ...v,
                    imageFile: file,
                    imagePreview: URL.createObjectURL(file)
                } : v
            ));
        }
    };

    const updateVariant = (index, field, value) => {
        setVariants(prev => prev.map((v, i) =>
            i === index ? { ...v, [field]: value } : v
        ));
    };

    const removeVariant = (index) => {
        setVariants(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.price || !formData.categoryId) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        if (hasVariants && variants.length === 0) {
            toast.error('Vui lòng thêm ít nhất 1 phân loại');
            return;
        }

        setSaving(true);
        try {
            // Upload new images first
            let allImageUrls = images.filter(img => img.isExisting).map(img => img.url);

            const newImages = images.filter(img => !img.isExisting);
            if (newImages.length > 0) {
                for (const img of newImages) {
                    const formDataImg = new FormData();
                    formDataImg.append('file', img.file);
                    const uploadRes = await fetch('http://localhost:8080/api/upload/product-image', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: formDataImg
                    });
                    const uploadData = await uploadRes.json();
                    if (uploadData.data) {
                        allImageUrls.push(uploadData.data);
                    }
                }
            }

            // Upload variant images
            const variantsWithImages = hasVariants ? await Promise.all(variants.map(async (v) => {
                let variantImageUrl = v.image || '';
                if (v.imageFile) {
                    const formDataImg = new FormData();
                    formDataImg.append('file', v.imageFile);
                    const uploadRes = await fetch('http://localhost:8080/api/upload/product-image', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: formDataImg
                    });
                    const uploadData = await uploadRes.json();
                    if (uploadData.data) {
                        variantImageUrl = uploadData.data;
                    }
                }
                return {
                    size: v.size,
                    color: v.color,
                    colorCode: v.colorCode,
                    price: v.price ? parseFloat(v.price) : null,
                    quantity: parseInt(v.quantity || 0),
                    sku: v.sku,
                    images: variantImageUrl
                };
            })) : null;

            // Prepare JSON data
            const submitData = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                quantity: hasVariants ?
                    variants.reduce((sum, v) => sum + parseInt(v.quantity || 0), 0) :
                    parseInt(formData.quantity),
                categoryId: parseInt(formData.categoryId),
                images: allImageUrls.join(','),
                variants: variantsWithImages
            };

            if (isEdit) {
                await productService.update(id, submitData);
                toast.success('Đã cập nhật sản phẩm!');
            } else {
                await productService.create(submitData);
                toast.success('Đã thêm sản phẩm mới!');
            }
            navigate('/seller/products');
        } catch (error) {
            console.error(error);
            toast.error('Có lỗi xảy ra');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                    </h1>
                    <p className="text-gray-500">Điền thông tin sản phẩm của bạn</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="font-bold text-gray-900 mb-4">Thông tin cơ bản</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tên sản phẩm *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Nhập tên sản phẩm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mô tả
                            </label>
                            <textarea
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Mô tả chi tiết sản phẩm..."
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Giá bán gốc (VND) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="0"
                                />
                            </div>
                            {!hasVariants && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Số lượng kho *
                                    </label>
                                    <input
                                        type="number"
                                        required={!hasVariants}
                                        min="0"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="0"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Danh mục *
                                </label>
                                <select
                                    required
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="">Chọn danh mục</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Variants Section */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-gray-900">Phân loại sản phẩm ({variantLabels.attr1}, {variantLabels.attr2})</h2>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={hasVariants}
                                onChange={(e) => {
                                    setHasVariants(e.target.checked);
                                    if (e.target.checked && variants.length === 0) {
                                        addVariant();
                                    }
                                }}
                                className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-600">Có nhiều phân loại</span>
                        </label>
                    </div>

                    {hasVariants && (
                        <div className="space-y-4">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-2 font-medium text-gray-600">Ảnh</th>
                                            <th className="text-left py-3 px-2 font-medium text-gray-600">{variantLabels.attr1}</th>
                                            <th className="text-left py-3 px-2 font-medium text-gray-600">{variantLabels.attr2}</th>
                                            <th className="text-left py-3 px-2 font-medium text-gray-600">Mã màu</th>
                                            <th className="text-left py-3 px-2 font-medium text-gray-600">Giá (VND)</th>
                                            <th className="text-left py-3 px-2 font-medium text-gray-600">Số lượng</th>
                                            <th className="text-left py-3 px-2 font-medium text-gray-600">SKU</th>
                                            <th className="py-3 px-2"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {variants.map((variant, index) => (
                                            <tr key={index} className="border-b border-gray-100">
                                                <td className="py-2 px-2">
                                                    <div className="relative">
                                                        {variant.imagePreview ? (
                                                            <div className="relative w-16 h-16 group">
                                                                <img
                                                                    src={variant.imagePreview}
                                                                    alt=""
                                                                    className="w-16 h-16 object-cover rounded-lg"
                                                                />
                                                                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-lg cursor-pointer transition-opacity">
                                                                    <FiUpload className="text-white" size={16} />
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        onChange={(e) => handleVariantImageChange(index, e)}
                                                                        className="hidden"
                                                                    />
                                                                </label>
                                                            </div>
                                                        ) : (
                                                            <label className="flex items-center justify-center w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
                                                                <FiUpload className="text-gray-400" size={16} />
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={(e) => handleVariantImageChange(index, e)}
                                                                    className="hidden"
                                                                />
                                                            </label>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-2 px-2">
                                                    <input
                                                        type="text"
                                                        value={variant.size}
                                                        onChange={(e) => updateVariant(index, 'size', e.target.value)}
                                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                                        placeholder={variantLabels.attr1Placeholder}
                                                    />
                                                </td>
                                                <td className="py-2 px-2">
                                                    <input
                                                        type="text"
                                                        value={variant.color}
                                                        onChange={(e) => updateVariant(index, 'color', e.target.value)}
                                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                                        placeholder={variantLabels.attr2Placeholder}
                                                    />
                                                </td>
                                                <td className="py-2 px-2">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="color"
                                                            value={variant.colorCode}
                                                            onChange={(e) => updateVariant(index, 'colorCode', e.target.value)}
                                                            className="w-10 h-10 rounded-lg cursor-pointer border-0"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="py-2 px-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={variant.price}
                                                        onChange={(e) => updateVariant(index, 'price', e.target.value)}
                                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                                        placeholder={formData.price || '0'}
                                                    />
                                                </td>
                                                <td className="py-2 px-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={variant.quantity}
                                                        onChange={(e) => updateVariant(index, 'quantity', e.target.value)}
                                                        className="w-24 px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                                        placeholder="0"
                                                    />
                                                </td>
                                                <td className="py-2 px-2">
                                                    <input
                                                        type="text"
                                                        value={variant.sku}
                                                        onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                                        placeholder="SKU-001"
                                                    />
                                                </td>
                                                <td className="py-2 px-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeVariant(index)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <button
                                type="button"
                                onClick={addVariant}
                                className="flex items-center gap-2 px-4 py-2 text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors"
                            >
                                <FiPlus size={16} />
                                Thêm phân loại
                            </button>

                            <div className="bg-indigo-50 rounded-xl p-4 text-sm text-indigo-700">
                                <strong>Tổng số lượng:</strong> {variants.reduce((sum, v) => sum + parseInt(v.quantity || 0), 0)} sản phẩm
                            </div>
                        </div>
                    )}

                    {!hasVariants && (
                        <p className="text-gray-500 text-sm">
                            Bật tùy chọn trên nếu sản phẩm có nhiều size hoặc màu sắc với giá khác nhau.
                        </p>
                    )}
                </div>

                {/* Images - Only show when no variants (variants have their own images) */}
                {!hasVariants && (
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="font-bold text-gray-900 mb-4">Hình ảnh sản phẩm</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {images.map((img, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={img.url}
                                        alt=""
                                        className="w-full h-32 object-cover rounded-xl"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <FiTrash2 size={14} />
                                    </button>
                                </div>
                            ))}
                            <label className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
                                <FiUpload className="text-gray-400 mb-2" size={24} />
                                <span className="text-sm text-gray-500">Thêm ảnh</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 py-3 bg-linear-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <FiSave />
                        {saving ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Thêm sản phẩm')}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/seller/products')}
                        className="px-6 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                        <FiX /> Hủy
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;
