import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { format } from 'date-fns';
import { CheckCircle2, Clock, Package, XCircle, Search, RefreshCcw, DollarSign, TrendingUp } from 'lucide-react';

export default function OrderManagement() {
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchOrdersAndStats = async () => {
        setLoading(true);
        try {
            const [ordersRes, statsRes] = await Promise.all([
                api.get('/orders/admin/all'),
                api.get('/orders/admin/stats')
            ]);
            setOrders(ordersRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrdersAndStats();

        // Optional: Poll every 30 seconds for new orders
        const interval = setInterval(fetchOrdersAndStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const updateStatus = async (orderId, newStatus) => {
        if (!window.confirm(`Are you sure you want to mark this order as ${newStatus.replace(/_/g, ' ')}?`)) return;

        try {
            const originalOrders = [...orders];
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

            await api.patch(`/orders/admin/${orderId}/status`, { status: newStatus });
            fetchOrdersAndStats(); // Refresh stats fully
        } catch (error) {
            alert('Failed to update status');
            fetchOrdersAndStats(); // Revert on error
        }
    };

    const filteredOrders = orders.filter(o =>
        o.order_reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.user?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING_PAYMENT':
            case 'PAYMENT_UNDER_REVIEW':
                return <span className="flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-warning-500/20 text-warning-600 bg-warning-500/10"><Clock className="w-3 h-3" /> Pending Pay</span>;
            case 'PAYMENT_CONFIRMED':
                return <span className="flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-primary-500/20 text-primary-600 bg-primary-500/10"><CheckCircle2 className="w-3 h-3" /> Paid</span>;
            case 'PREPARING':
                return <span className="flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-accent-500/20 text-accent-600 bg-accent-500/10"><Package className="w-3 h-3" /> Preparing</span>;
            case 'READY_FOR_PICKUP':
                return <span className="flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-success-500/20 text-success-600 bg-success-500/10"><CheckCircle2 className="w-3 h-3" /> Ready</span>;
            case 'COMPLETED':
                return <span className="flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-surface-500/20 text-surface-500 bg-surface-500/10">Completed</span>;
            case 'CANCELLED':
            case 'REJECTED':
                return <span className="flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-danger-500/20 text-danger-600 bg-danger-500/10"><XCircle className="w-3 h-3" /> Cancelled</span>;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-surface-800/50 rounded-2xl p-5 border border-surface-200 dark:border-surface-700/50 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary-500/10 text-primary-500">
                            <Package className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="mt-4 text-2xl font-black">{stats?.todayOrders || 0}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-surface-400 mt-1">Orders Today</p>
                </div>

                <div className="bg-white dark:bg-surface-800/50 rounded-2xl p-5 border border-surface-200 dark:border-surface-700/50 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-success-500/10 text-success-500">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="mt-4 text-2xl font-black">₦{stats?.totalRevenue ? parseFloat(stats.totalRevenue).toLocaleString() : 0}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-surface-400 mt-1">Revenue Today</p>
                </div>

                <div className="bg-white dark:bg-surface-800/50 rounded-2xl p-5 border border-surface-200 dark:border-surface-700/50 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-warning-500/10 text-warning-500">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="mt-4 text-2xl font-black">{stats?.pendingPayments || 0}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-surface-400 mt-1">Pending Pays</p>
                </div>

                <div className="bg-white dark:bg-surface-800/50 rounded-2xl p-5 border border-surface-200 dark:border-surface-700/50 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-accent-500/10 text-accent-500">
                            <Package className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="mt-4 text-2xl font-black">{stats?.inProgressOrders || 0}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-surface-400 mt-1">In Progress</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-surface-800/50 p-4 rounded-[2rem] border border-surface-200 dark:border-surface-700/50">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input
                        type="text"
                        placeholder="Search by ID or name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-surface-100 dark:bg-surface-800 pl-10 pr-4 py-2.5 rounded-xl border-none focus:ring-2 focus:ring-primary-500 text-sm font-medium"
                    />
                </div>
                <button
                    onClick={fetchOrdersAndStats}
                    className="flex items-center gap-2 px-6 py-2.5 bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 rounded-xl text-xs font-black uppercase tracking-widest border border-surface-200 dark:border-surface-700 hover:border-primary-500 transition-colors"
                >
                    <RefreshCcw className="w-4 h-4" /> Refresh
                </button>
            </div>

            <div className="bg-white dark:bg-surface-800/80 rounded-[2rem] border border-surface-200 dark:border-surface-700/50 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-50 dark:bg-surface-900/50">
                                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-surface-400">Order ID</th>
                                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-surface-400">Customer</th>
                                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-surface-400">Items/Total</th>
                                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-surface-400">Status</th>
                                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-surface-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-100 dark:divide-surface-700/50">
                            {filteredOrders.map(order => (
                                <tr key={order.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                                    <td className="py-4 px-6">
                                        <p className="font-bold text-sm text-surface-900 dark:text-surface-50">{order.order_reference}</p>
                                        <p className="text-[10px] font-bold text-surface-400 mt-0.5">{format(new Date(order.createdAt), 'MMM d, h:mm a')}</p>
                                    </td>
                                    <td className="py-4 px-6">
                                        <p className="font-bold text-sm text-surface-900 dark:text-surface-50">{order.user?.name}</p>
                                    </td>
                                    <td className="py-4 px-6">
                                        <p className="font-bold text-xs text-surface-600 dark:text-surface-300 leading-tight">
                                            {order.items?.map(i => `${i.quantity}x ${i.cafeItem?.name}`).join(', ')}
                                        </p>
                                        <p className="text-sm font-black text-primary-600 dark:text-primary-400 mt-1">₦{parseFloat(order.total_amount).toLocaleString()}</p>
                                    </td>
                                    <td className="py-4 px-6">
                                        {getStatusBadge(order.status)}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex flex-wrap items-center justify-end gap-2">
                                            {order.status === 'PENDING_PAYMENT' && (
                                                <button onClick={() => updateStatus(order.id, 'PAYMENT_CONFIRMED')} className="px-3 py-1.5 bg-success-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-success-500/20 hover:bg-success-600 transition-colors">Verify Pay</button>
                                            )}
                                            {order.status === 'PAYMENT_CONFIRMED' && (
                                                <button onClick={() => updateStatus(order.id, 'PREPARING')} className="px-3 py-1.5 bg-accent-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-accent-500/20 hover:bg-accent-600 transition-colors">Prep</button>
                                            )}
                                            {order.status === 'PREPARING' && (
                                                <button onClick={() => updateStatus(order.id, 'READY_FOR_PICKUP')} className="px-3 py-1.5 bg-success-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-success-500/20 hover:bg-success-600 transition-colors">Ready</button>
                                            )}
                                            {order.status === 'READY_FOR_PICKUP' && (
                                                <button onClick={() => updateStatus(order.id, 'COMPLETED')} className="px-3 py-1.5 bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-300 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-surface-300 dark:hover:bg-surface-600 transition-colors">Done</button>
                                            )}
                                            {['PENDING_PAYMENT', 'PAYMENT_CONFIRMED', 'PREPARING'].includes(order.status) && (
                                                <button onClick={() => updateStatus(order.id, 'CANCELLED')} className="p-1.5 text-surface-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10 rounded-lg transition-colors" title="Cancel Order"><XCircle className="w-4 h-4" /></button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredOrders.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-surface-500 font-medium">No orders found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
