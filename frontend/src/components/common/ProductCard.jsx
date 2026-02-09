import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiEye, FiZap } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
};

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleAddToCart = (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/login');
            return;
        }
        if (product.hasVariants) {
            navigate(`/products/${product.id}`);
            return;
        }
        addToCart(product.id);
    };

    const handleBuyNow = (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/login');
            return;
        }
        if (product.hasVariants) {
            navigate(`/products/${product.id}`);
            return;
        }
        addToCart(product.id);
        navigate('/cart');
    };

    const firstImage = product.images?.split(',')[0] || 'https://via.placeholder.com/400x400?text=No+Image';

    return (
        <Link
            to={`/products/${product.id}`}
            className="group product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-shadow duration-300"
        >
            {/* Image Container - 16:9 aspect ratio */}
            <div className="relative aspect-video overflow-hidden bg-gray-100">
                <img
                    src={firstImage}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Status Badge */}
                {product.quantity <= 5 && product.quantity > 0 && (
                    <span className="absolute top-3 left-3 px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                        Còn {product.quantity}
                    </span>
                )}
                {product.quantity === 0 && (
                    <span className="absolute top-3 left-3 px-3 py-1 bg-gray-800 text-white text-xs font-semibold rounded-full">
                        Hết hàng
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Name */}
                <h3 className="text-gray-900 font-semibold line-clamp-2 group-hover:text-indigo-600 transition-colors text-sm">
                    {product.name}
                </h3>

                {/* Price & Views */}
                <div className="mt-2 flex items-center justify-between">
                    <span className="text-lg font-bold text-indigo-600">
                        {formatPrice(product.price)}
                    </span>
                    <span className="flex items-center gap-1 text-gray-400 text-xs">
                        <FiEye size={12} />
                        {product.viewCount || 0}
                    </span>
                </div>

                {/* Action Buttons */}
                <div className="mt-3 flex gap-2">
                    <button
                        onClick={handleBuyNow}
                        disabled={product.quantity === 0}
                        className="flex-1 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FiZap size={14} />
                        Mua ngay
                    </button>
                    <button
                        onClick={handleAddToCart}
                        disabled={product.quantity === 0}
                        className="px-3 py-2 border-2 border-indigo-500 text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FiShoppingCart size={16} />
                    </button>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
