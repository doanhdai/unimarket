import { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '../services/api';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            setCartItems([]);
        }
    }, [user]);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const response = await cartService.getCart();
            setCartItems(response.data.data || []);
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId, variantId = null, quantity = 1) => {
        try {
            await cartService.addToCart({ productId, variantId, quantity });
            await fetchCart();
            toast.success('Đã thêm vào giỏ hàng');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi khi thêm vào giỏ hàng');
        }
    };

    const updateQuantity = async (itemId, quantity) => {
        try {
            await cartService.updateItem(itemId, quantity);
            await fetchCart();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi khi cập nhật giỏ hàng');
        }
    };

    const removeItem = async (itemId) => {
        try {
            await cartService.removeItem(itemId);
            await fetchCart();
            toast.success('Đã xóa khỏi giỏ hàng');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi khi xóa');
        }
    };

    const clearCart = async () => {
        try {
            await cartService.clearCart();
            setCartItems([]);
        } catch (error) {
            console.error('Error clearing cart:', error);
        }
    };

    const cartTotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            loading,
            addToCart,
            updateQuantity,
            removeItem,
            clearCart,
            fetchCart,
            cartTotal,
            cartCount
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
