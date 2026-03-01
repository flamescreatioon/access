import { create } from 'zustand';
import api from '../lib/api';

export const useCafeStore = create((set, get) => ({
    items: [],
    orders: [],
    cart: [],
    isLoading: false,
    error: null,

    // Cart Actions
    addToCart: (item) => {
        const cart = get().cart;
        const existingItem = cart.find(i => i.id === item.id);

        if (existingItem) {
            set({
                cart: cart.map(i =>
                    i.id === item.id
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                )
            });
        } else {
            set({ cart: [...cart, { ...item, quantity: 1 }] });
        }
    },

    removeFromCart: (itemId) => {
        set({ cart: get().cart.filter(i => i.id !== itemId) });
    },

    updateQuantity: (itemId, quantity) => {
        if (quantity < 1) {
            get().removeFromCart(itemId);
            return;
        }
        set({
            cart: get().cart.map(i =>
                i.id === itemId ? { ...i, quantity } : i
            )
        });
    },

    clearCart: () => set({ cart: [] }),

    getCartTotal: () => {
        return get().cart.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
    },

    // API Actions
    fetchItems: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/cafe', { params });
            set({ items: response.data, isLoading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch menu items',
                isLoading: false
            });
        }
    },

    fetchMyOrders: async () => {
        set({ isLoading: true, error: null });
        try {
            // Usually returns a list of orders
            const response = await api.get('/orders');
            set({ orders: response.data, isLoading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to fetch orders',
                isLoading: false
            });
        }
    },

    placeOrder: async () => {
        const cart = get().cart;
        if (cart.length === 0) return null;

        set({ isLoading: true, error: null });
        try {
            const payload = {
                items: cart.map(item => ({
                    cafe_item_id: item.id,
                    quantity: item.quantity
                }))
            };

            const response = await api.post('/orders', payload);

            // Clear cart upon successful order
            set({ cart: [], isLoading: false });

            // Refresh orders
            get().fetchMyOrders();

            return response.data; // Return the new order (contains order_reference)
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to place order',
                isLoading: false
            });
            throw error;
        }
    }
}));
