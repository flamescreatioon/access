import { useEffect, useState } from 'react';
import { useCafeStore } from '../../stores/cafeStore';
import MenuGrid from './components/MenuGrid';
import Cart from './components/Cart';
import OrderTracking from './components/OrderTracking';
import { Coffee, ClipboardList } from 'lucide-react';

export default function CafeLounge() {
    const { fetchItems, fetchMyOrders, isLoading } = useCafeStore();
    const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'orders'

    useEffect(() => {
        fetchItems({ activeOnly: 'true' });
        fetchMyOrders();
    }, [fetchItems, fetchMyOrders]);

    return (
        <div className="space-y-6 page-enter page-enter-active">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center shadow-lg shadow-primary-500/20">
                            <Coffee className="w-6 h-6 text-white" />
                        </div>
                        Unipod Cafe
                    </h1>
                    <p className="text-surface-500 mt-1 font-medium">Fuel your creativity with our fresh selections.</p>
                </div>

                <div className="flex bg-surface-100 dark:bg-surface-800 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('menu')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-black transition-all ${activeTab === 'menu' ? 'bg-white dark:bg-surface-700 shadow-sm text-primary-600 dark:text-primary-400' : 'text-surface-500 hover:text-surface-900 dark:hover:text-surface-100'}`}
                    >
                        <Coffee className="w-4 h-4" /> Menu
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-black transition-all ${activeTab === 'orders' ? 'bg-white dark:bg-surface-700 shadow-sm text-primary-600 dark:text-primary-400' : 'text-surface-500 hover:text-surface-900 dark:hover:text-surface-100'}`}
                    >
                        <ClipboardList className="w-4 h-4" /> My Orders
                    </button>
                </div>
            </header>

            {activeTab === 'menu' ? (
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    <div className="flex-1 w-full">
                        <MenuGrid />
                    </div>
                    <div className="w-full lg:w-96 shrink-0 lg:sticky lg:top-24 mt-8 lg:mt-0">
                        <Cart />
                    </div>
                </div>
            ) : (
                <OrderTracking />
            )}
        </div>
    );
}
