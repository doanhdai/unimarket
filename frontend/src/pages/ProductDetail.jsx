import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productService } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/common/Loading';
import ProductCard from '../components/common/ProductCard';
import { FiShoppingCart, FiHeart, FiMinus, FiPlus, FiCheck, FiTruck, FiShield, FiRefreshCw, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { toast } from 'react-toastify';

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
};

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await productService.getById(id);
            const productData = response.data.data;
            setProduct(productData);

            if (productData.variants && productData.variants.length > 0) {
                const firstInStockVariant = productData.variants.find(v => v.quantity > 0) || productData.variants[0];
                setSelectedSize(firstInStockVariant.size);
                setSelectedColor(firstInStockVariant.color);
                setSelectedVariant(firstInStockVariant);
            }

            if (productData?.categoryId) {
                const relatedRes = await productService.getByCategory(productData.categoryId, { page: 0, size: 4 });
                setRelatedProducts(relatedRes.data.data?.content?.filter(p => p.id !== parseInt(id)) || []);
            }
        } catch (error) {
            toast.error('Không tìm thấy sản phẩm');
            navigate('/products');
        } finally {
            setLoading(false);
        }
    };

    // Extract unique sizes and colors
    const { sizes, colors } = useMemo(() => {
        if (!product?.variants) return { sizes: [], colors: [] };
        const sizeSet = new Set();
        const colorMap = new Map();
        product.variants.forEach(v => {
            if (v.size) sizeSet.add(v.size);
            if (v.color) colorMap.set(v.color, v.colorCode);
        });
        return {
            sizes: Array.from(sizeSet),
            colors: Array.from(colorMap.entries()).map(([name, code]) => ({ name, code }))
        };
    }, [product?.variants]);

    // Find matching variant when size/color changes
    useEffect(() => {
        if (!product?.variants || product.variants.length === 0) return;

        const variant = product.variants.find(v => {
            const sizeMatch = (!selectedSize && !v.size) || v.size === selectedSize;
            const colorMatch = (!selectedColor && !v.color) || v.color === selectedColor;
            return sizeMatch && colorMatch;
        });

        setSelectedVariant(variant || null);
    }, [selectedSize, selectedColor, product?.variants]);

    const currentPrice = selectedVariant?.price || product?.price;
    const currentStock = selectedVariant?.quantity ?? product?.quantity;
    const totalStock = product?.variants?.length > 0
        ? product.variants.reduce((sum, v) => sum + (v.quantity || 0), 0)
        : product?.quantity || 0;

    const handleAddToCart = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (product.variants?.length > 0 && !selectedVariant) {
            toast.error('Vui lòng chọn phân loại sản phẩm');
            return;
        }

        addToCart(product.id, selectedVariant?.id, quantity);
        toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
    };

    const handleBuyNow = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (product.variants?.length > 0 && !selectedVariant) {
            toast.error('Vui lòng chọn phân loại sản phẩm');
            return;
        }
        addToCart(product.id, selectedVariant?.id, quantity);
        navigate('/cart');
    };

    // Collect all variant images - must be before any return
    const variantImages = useMemo(() => {
        if (!product?.variants) return [];
        return product.variants
            .filter(v => v.images)
            .map(v => ({
                url: v.images,
                variantId: v.id,
                color: v.color,
                size: v.size
            }));
    }, [product?.variants]);

    // Combine all images for gallery - must be before any return
    const productImages = product?.images?.split(',').filter(Boolean) || [];
    const allImages = useMemo(() => {
        const mainImages = productImages.map(url => ({ url, isMain: true }));
        const vImages = variantImages.map(v => ({ ...v, isVariant: true }));
        return [...mainImages, ...vImages];
    }, [productImages.join(','), variantImages]);

    const images = allImages.length > 0 ? allImages : [{ url: 'https://via.placeholder.com/600', isMain: true }];
    const hasVariants = product?.variants && product.variants.length > 0;

    // Switch to variant image when variant is selected
    useEffect(() => {
        if (selectedVariant?.images) {
            const variantImageIndex = images.findIndex(img => img.url === selectedVariant.images);
            if (variantImageIndex !== -1) {
                setSelectedImage(variantImageIndex);
            }
        }
    }, [selectedVariant, images]);

    if (loading) return <Loading />;
    if (!product) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                    <Link to="/" className="hover:text-indigo-600">Trang chủ</Link>
                    <span>/</span>
                    <Link to="/products" className="hover:text-indigo-600">Sản phẩm</Link>
                    <span>/</span>
                    <span className="text-gray-900">{product.name}</span>
                </nav>

                <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
                    <div className="grid lg:grid-cols-2 gap-8 p-8">
                        {/* Images */}
                        <div className="space-y-4">
                            {/* Main Image */}
                            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 group">
                                <img
                                    src={images[selectedImage]?.url}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                                {/* Variant label on image */}
                                {images[selectedImage]?.isVariant && (
                                    <div className="absolute top-4 left-4 bg-black/70 text-white text-sm px-3 py-1 rounded-full">
                                        {images[selectedImage]?.color} {images[selectedImage]?.size && `- ${images[selectedImage]?.size}`}
                                    </div>
                                )}
                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setSelectedImage(prev => prev === 0 ? images.length - 1 : prev - 1)}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                        >
                                            <FiChevronLeft />
                                        </button>
                                        <button
                                            onClick={() => setSelectedImage(prev => prev === images.length - 1 ? 0 : prev + 1)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                        >
                                            <FiChevronRight />
                                        </button>
                                    </>
                                )}
                            </div>
                            {/* Thumbnails */}
                            {images.length > 1 && (
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    {images.map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImage(index)}
                                            className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all relative ${selectedImage === index ? 'border-indigo-500' : 'border-transparent hover:border-gray-300'}`}
                                        >
                                            <img src={img.url} alt="" className="w-full h-full object-cover" />
                                            {img.isVariant && (
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-0.5 truncate">
                                                    {img.color}
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex flex-col">
                            {/* Category */}
                            <span className="inline-flex items-center gap-2 text-sm text-indigo-600 font-medium bg-indigo-50 px-3 py-1 rounded-full w-fit">
                                {product.categoryName}
                            </span>

                            {/* Name */}
                            <h1 className="mt-4 text-3xl font-bold text-gray-900">{product.name}</h1>

                            {/* Price */}
                            <div className="mt-4 flex items-baseline gap-4">
                                <span className="text-4xl font-bold text-indigo-600">{formatPrice(currentPrice)}</span>
                                {selectedVariant && selectedVariant.price !== product.price && (
                                    <span className="text-lg text-gray-400 line-through">{formatPrice(product.price)}</span>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
                                <span>Đã xem: {product.viewCount || 0}</span>
                                <span>Kho: {totalStock > 0 ? `${totalStock} sản phẩm` : 'Hết hàng'}</span>
                            </div>

                            {/* Variants Section - Shopee Style */}
                            {hasVariants && (
                                <div className="mt-6 pt-6 border-t border-gray-100 space-y-5">
                                    {/* Size Selection */}
                                    {sizes.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                Kích thước
                                                {selectedSize && <span className="text-sm font-normal text-gray-500">({selectedSize})</span>}
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {sizes.map((size) => {
                                                    // Check if this size is available with the selected color (or any color if none selected)
                                                    const isAvailableWithColor = selectedColor
                                                        ? product.variants.some(v => v.size === size && v.color === selectedColor && v.quantity > 0)
                                                        : true;
                                                    const isAvailableAtAll = product.variants.some(v => v.size === size && v.quantity > 0);
                                                    const isSelected = selectedSize === size;

                                                    const handleSizeClick = () => {
                                                        if (!isAvailableWithColor && isAvailableAtAll) {
                                                            // Size is available but not with current color, reset color
                                                            setSelectedColor(null);
                                                        }
                                                        setSelectedSize(size);
                                                    };

                                                    return (
                                                        <button
                                                            key={size}
                                                            onClick={handleSizeClick}
                                                            disabled={!isAvailableAtAll}
                                                            className={`
                                                                min-w-[60px] px-4 py-2.5 rounded-xl border-2 font-medium transition-all relative
                                                                ${isSelected
                                                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                                    : 'border-gray-200 hover:border-indigo-300 text-gray-700'}
                                                                ${!isAvailableAtAll ? 'opacity-40 cursor-not-allowed line-through' : ''}
                                                                ${isAvailableAtAll && !isAvailableWithColor ? 'opacity-60' : ''}
                                                            `}
                                                        >
                                                            {size}
                                                            {isSelected && (
                                                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                                                                    <FiCheck className="text-white" size={10} />
                                                                </span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Color Selection */}
                                    {colors.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                Màu sắc
                                                {selectedColor && <span className="text-sm font-normal text-gray-500">({selectedColor})</span>}
                                            </h3>
                                            <div className="flex flex-wrap gap-3">
                                                {colors.map(({ name, code }) => {
                                                    // Check if this color is available with the selected size (or any size if none selected)
                                                    const isAvailableWithSize = selectedSize
                                                        ? product.variants.some(v => v.color === name && v.size === selectedSize && v.quantity > 0)
                                                        : true;
                                                    const isAvailableAtAll = product.variants.some(v => v.color === name && v.quantity > 0);
                                                    const isSelected = selectedColor === name;

                                                    const handleColorClick = () => {
                                                        if (!isAvailableWithSize && isAvailableAtAll) {
                                                            // Color is available but not with current size, reset size
                                                            setSelectedSize(null);
                                                        }
                                                        setSelectedColor(name);
                                                    };

                                                    return (
                                                        <button
                                                            key={name}
                                                            onClick={handleColorClick}
                                                            disabled={!isAvailableAtAll}
                                                            className={`
                                                                flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-medium transition-all relative
                                                                ${isSelected
                                                                    ? 'border-indigo-500 bg-indigo-50'
                                                                    : 'border-gray-200 hover:border-indigo-300'}
                                                                ${!isAvailableAtAll ? 'opacity-40 cursor-not-allowed' : ''}
                                                                ${isAvailableAtAll && !isAvailableWithSize ? 'opacity-60' : ''}
                                                            `}
                                                        >
                                                            <span
                                                                className="w-5 h-5 rounded-full border border-gray-300"
                                                                style={{ backgroundColor: code || '#ccc' }}
                                                            />
                                                            <span className={isSelected ? 'text-indigo-700' : 'text-gray-700'}>{name}</span>
                                                            {isSelected && (
                                                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                                                                    <FiCheck className="text-white" size={10} />
                                                                </span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Selected Variant Info */}
                                    {selectedVariant && (
                                        <div className="bg-indigo-50 rounded-xl p-4 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Phân loại đã chọn:</span>
                                                <span className="font-semibold text-indigo-600">
                                                    {selectedSize && selectedSize} {selectedColor && `- ${selectedColor}`}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="text-gray-600">Còn lại:</span>
                                                <span className={`font-semibold ${selectedVariant.quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                    {selectedVariant.quantity} sản phẩm
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Description */}
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <h3 className="font-semibold text-gray-900 mb-3">Mô tả sản phẩm</h3>
                                <p className="text-gray-600 leading-relaxed">{product.description || 'Chưa có mô tả'}</p>
                            </div>

                            {/* Quantity */}
                            <div className="mt-6">
                                <h3 className="font-semibold text-gray-900 mb-3">Số lượng</h3>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                        className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                        disabled={quantity <= 1}
                                    >
                                        <FiMinus />
                                    </button>
                                    <span className="w-16 text-center font-semibold text-lg">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(prev => Math.min(currentStock, prev + 1))}
                                        className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                        disabled={quantity >= currentStock}
                                    >
                                        <FiPlus />
                                    </button>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-8 flex gap-4">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={currentStock === 0}
                                    className="flex-1 py-4 px-6 border-2 border-indigo-600 text-indigo-600 font-semibold rounded-2xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FiShoppingCart size={20} />
                                    Thêm vào giỏ
                                </button>
                                <button
                                    onClick={handleBuyNow}
                                    disabled={currentStock === 0}
                                    className="flex-1 py-4 px-6 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Mua ngay
                                </button>
                                <button
                                    onClick={() => setIsLiked(!isLiked)}
                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isLiked ? 'bg-red-500 text-white' : 'border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-500'}`}
                                >
                                    <FiHeart size={20} />
                                </button>
                            </div>

                            {/* Benefits */}
                            <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="w-12 h-12 mx-auto bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-2">
                                        <FiTruck size={20} />
                                    </div>
                                    <p className="text-xs text-gray-600">Miễn phí vận chuyển</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 mx-auto bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-2">
                                        <FiShield size={20} />
                                    </div>
                                    <p className="text-xs text-gray-600">Bảo hành chính hãng</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 mx-auto bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 mb-2">
                                        <FiRefreshCw size={20} />
                                    </div>
                                    <p className="text-xs text-gray-600">Đổi trả 7 ngày</p>
                                </div>
                            </div>

                            {/* Shop */}
                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center">
                                        <span className="text-white font-bold text-xl">{product.shopName?.charAt(0) || 'S'}</span>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900">{product.shopName || 'Shop'}</h4>
                                        <p className="text-sm text-gray-500">Người bán uy tín</p>
                                    </div>
                                    <Link to={`/shop/${product.sellerId}`} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                                        Xem shop
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <section className="mt-16">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8">Sản phẩm liên quan</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                            {relatedProducts.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default ProductDetail;
