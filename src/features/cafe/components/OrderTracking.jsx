import { useCafeStore } from '../../../stores/cafeStore';
import { RefreshCcw, Package, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function OrderTracking() {
    const { orders, fetchMyOrders, isLoading } = useCafeStore();

    const getStatusConfig = (status) => {
        switch (status) {
            case 'PENDING_PAYMENT':
            case 'PAYMENT_UNDER_REVIEW':
                return { color: 'text-warning-600 bg-warning-500/10 border-warning-500/20', label: 'Pending Payment', icon: Clock };
            case 'PAYMENT_CONFIRMED':
            case 'PREPARING':
                return { color: 'text-primary-600 bg-primary-500/10 border-primary-500/20', label: 'Preparing', icon: Package };
            case 'READY_FOR_PICKUP':
                return { color: 'text-accent-600 bg-accent-500/10 border-accent-500/20', label: 'Ready for Pickup', icon: Package };
            case 'COMPLETED':
                return { color: 'text-success-600 bg-success-500/10 border-success-500/20', label: 'Completed', icon: CheckCircle2 };
            case 'CANCELLED':
            case 'REJECTED':
                return { color: 'text-danger-600 bg-danger-500/10 border-danger-500/20', label: 'Cancelled', icon: XCircle };
            default:
                return { color: 'text-surface-600 bg-surface-500/10 border-surface-500/20', label: status, icon: Clock };
        }
    };

    if (isLoading && orders.length === 0) {
        return (
            <div className="flex items-center justify-center p-12">
                <RefreshCcw className="w-8 h-8 text-surface-400 animate-spin" />
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="bg-white dark:bg-surface-800/50 rounded-[2.5rem] p-12 border border-surface-200 dark:border-surface-700/50 text-center">
                <Package className="w-16 h-16 text-surface-300 dark:text-surface-600 mx-auto mb-4" />
                <h3 className="text-xl font-black">No Orders Yet</h3>
                <p className="text-surface-500 font-medium mt-2">Check out our menu and place your first order.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black">Your Order History</h2>
                <button
                    onClick={() => fetchMyOrders()}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-surface-800 rounded-xl text-xs font-black uppercase tracking-widest border border-surface-200 dark:border-surface-700 hover:border-primary-500 transition-colors disabled:opacity-50"
                >
                    <RefreshCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            <div className="grid gap-6">
                {orders.map((order) => {
                    const statusConfig = getStatusConfig(order.status);
                    const StatusIcon = statusConfig.icon;

                    return (
                        <div key={order.id} className="bg-white dark:bg-surface-800/80 rounded-[2rem] p-6 border border-surface-200 dark:border-surface-700/50 hover:shadow-xl hover:shadow-primary-500/5 transition-all group">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-100 dark:border-surface-700/50 pb-4 mb-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-lg font-black tracking-tight">{order.order_reference}</h3>
                                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${statusConfig.color}`}>
                                            <StatusIcon className="w-3 h-3" />
                                            {statusConfig.label}
                                        </span>
                                    </div>
                                    <p className="text-xs font-bold text-surface-400">
                                        {format(new Date(order.createdAt), 'MMM d, yyyy • h:mm a')}
                                    </p>
                                </div>
                                <div className="text-left md:text-right">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-surface-400 mb-1">Order Total</p>
                                    <p className="text-xl font-black text-primary-600 dark:text-primary-400">
                                        ₦{parseFloat(order.total_amount).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {order.items?.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm font-medium">
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 h-6 rounded-md bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-[10px] font-black text-surface-500">{item.quantity}x</span>
                                            <span>{item.cafeItem?.name || 'Unknown Item'}</span>
                                        </div>
                                        <span className="font-bold text-surface-500">
                                            ₦{(parseFloat(item.unit_price) * item.quantity).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
