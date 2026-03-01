import { useState } from 'react';
import { useCafeStore } from '../../../stores/cafeStore';
import { ShoppingBag, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import OrderConfirmation from './OrderConfirmation';

export default function Cart() {
    const { cart, removeFromCart, updateQuantity, getCartTotal, placeOrder, isLoading } = useCafeStore();
    const [orderPlaced, setOrderPlaced] = useState(null);
    const [submitError, setSubmitError] = useState('');

    const handlePlaceOrder = async () => {
        setSubmitError('');
        try {
            const order = await placeOrder();
            if (order) setOrderPlaced(order);
        } catch (err) {
            setSubmitError(err.response?.data?.message || 'Failed to place order');
        }
    };

    if (orderPlaced) {
        return <OrderConfirmation order={orderPlaced} onReset={() => setOrderPlaced(null)} />;
    }

    return (
        <div className="bg-white dark:bg-surface-800/80 rounded-[2.5rem] p-6 border border-surface-200 dark:border-surface-700/50 shadow-xl shadow-surface-200/20 dark:shadow-none flex flex-col h-full lg:max-h-[calc(100vh-8rem)]">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-surface-100 dark:border-surface-700/50">
                <div className="w-10 h-10 bg-accent-500/10 text-accent-500 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-xl font-black">Your Cart</h2>
                    <p className="text-xs font-bold text-surface-500">{cart.length} items</p>
                </div>
            </div>

            {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12 opacity-50">
                    <ShoppingBag className="w-12 h-12 mb-4 text-surface-400" />
                    <p className="text-sm font-black uppercase tracking-widest text-surface-500">Cart is empty</p>
                </div>
            ) : (
                <>
                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-2">
                        {cart.map(item => (
                            <div key={item.id} className="flex gap-4 p-3 bg-surface-50 dark:bg-surface-800 rounded-2xl border border-surface-100 dark:border-surface-700/50">
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm truncate">{item.name}</h4>
                                    <p className="text-xs font-black text-primary-600 dark:text-primary-400 mt-1">
                                        ₦{parseFloat(item.price).toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end justify-between">
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-surface-400 hover:text-danger-500 p-1 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <div className="flex items-center gap-2 bg-white dark:bg-surface-900 rounded-lg p-1 border border-surface-200 dark:border-surface-700">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="w-6 h-6 flex items-center justify-center hover:bg-surface-100 dark:hover:bg-surface-800 rounded-md transition-colors"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="w-6 h-6 flex items-center justify-center hover:bg-surface-100 dark:hover:bg-surface-800 rounded-md transition-colors"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-surface-100 dark:border-surface-700/50">
                        <div className="flex justify-between items-end mb-6">
                            <span className="text-sm font-bold text-surface-500">Total Amount</span>
                            <span className="text-2xl font-black">₦{getCartTotal().toLocaleString()}</span>
                        </div>

                        {submitError && (
                            <div className="mb-4 p-3 bg-danger-500/10 text-danger-600 text-[10px] font-bold rounded-xl border border-danger-500/20">
                                {submitError}
                            </div>
                        )}

                        <button
                            onClick={handlePlaceOrder}
                            disabled={isLoading || cart.length === 0}
                            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-xl shadow-primary-500/20"
                        >
                            {isLoading ? 'Processing...' : 'Place Order'}
                            {!isLoading && <ArrowRight className="w-4 h-4" />}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
