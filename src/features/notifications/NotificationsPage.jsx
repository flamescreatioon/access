import { useEffect, useState } from 'react';
import { useNotificationStore } from '../../stores/notificationStore';
import {
    Bell, CheckCheck, BookMarked, Calendar, CreditCard, ShieldAlert,
    MoreVertical, Trash2, Clock, CheckCircle2, AlertCircle, Info, Zap
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const typeConfig = {
    booking: { icon: Calendar, color: 'text-primary-500', bg: 'bg-primary-500/10' },
    membership: { icon: CreditCard, color: 'text-warning-500', bg: 'bg-warning-500/10' },
    access: { icon: ShieldAlert, color: 'text-success-500', bg: 'bg-success-500/10' },
    system: { icon: Info, color: 'text-surface-500', bg: 'bg-surface-500/10' }
};

export default function NotificationsPage() {
    const { notifications, loading, fetchNotifications, markAsRead, markAllRead } = useNotificationStore();
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchNotifications();

        // Polling for new notifications every 30 seconds
        const interval = setInterval(() => fetchNotifications(), 30000);
        return () => clearInterval(interval);
    }, []);

    const filtered = notifications.filter(n => {
        if (filter === 'unread') return !n.read;
        return true;
    });

    return (
        <div className="max-w-3xl mx-auto space-y-6 page-enter page-enter-active">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Updates</h1>
                    <p className="text-surface-500 text-sm mt-1">Stay informed about your bookings and Hub status.</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex bg-surface-100 dark:bg-surface-800 p-1 rounded-2xl border border-surface-200 dark:border-surface-700">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${filter === 'all' ? 'bg-white dark:bg-surface-700 text-primary-500 shadow-sm' : 'text-surface-500 hover:text-surface-900 dark:hover:text-surface-100'}`}>
                            All
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${filter === 'unread' ? 'bg-white dark:bg-surface-700 text-primary-500 shadow-sm' : 'text-surface-500 hover:text-surface-900 dark:hover:text-surface-100'}`}>
                            Unread
                        </button>
                    </div>

                    <button
                        onClick={() => markAllRead()}
                        className="p-2.5 rounded-2xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-500 hover:text-primary-500 hover:border-primary-500/50 transition-all group"
                        title="Mark all as read">
                        <CheckCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            </div>

            {/* List */}
            {loading && notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 opacity-50">
                    <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-sm font-bold uppercase tracking-widest text-surface-400">Loading inbox...</p>
                </div>
            ) : filtered.length > 0 ? (
                <div className="space-y-3">
                    {filtered.map((n) => {
                        const config = typeConfig[n.type] || typeConfig.system;
                        const Icon = config.icon;

                        return (
                            <div
                                key={n.id}
                                onClick={() => !n.read && markAsRead(n.id)}
                                className={`group relative flex items-start gap-4 p-5 rounded-3xl border transition-all cursor-pointer
                                    ${n.read
                                        ? 'bg-white dark:bg-surface-800/20 border-surface-100 dark:border-surface-700/30'
                                        : 'bg-white dark:bg-surface-800 border-primary-500/30 shadow-lg shadow-primary-500/5'}`}>

                                {/* Icon container */}
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${config.bg}`}>
                                    <Icon className={`w-6 h-6 ${config.color}`} />
                                </div>

                                <div className="flex-1 min-w-0 pr-6">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className={`font-black tracking-tight truncate ${n.read ? 'text-surface-600 dark:text-surface-400' : 'text-surface-900 dark:text-surface-100'}`}>
                                            {n.title}
                                        </h3>
                                        {!n.read && <div className="w-2 h-2 rounded-full bg-primary-500 shadow-lg shadow-primary-500/50" />}
                                    </div>
                                    <p className={`text-sm leading-relaxed line-clamp-2 ${n.read ? 'text-surface-400 dark:text-surface-500 font-medium' : 'text-surface-600 dark:text-surface-300 font-semibold'}`}>
                                        {n.body}
                                    </p>
                                    <div className="flex items-center gap-2 mt-3 text-[10px] font-black uppercase tracking-wider text-surface-400">
                                        <Clock className="w-3 h-3" />
                                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                    </div>
                                </div>

                                {/* Hover actions */}
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-xl text-surface-400 hover:text-danger-500">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-32 bg-surface-50 dark:bg-surface-800/30 rounded-[3rem] border-2 border-dashed border-surface-200 dark:border-surface-700/50">
                    <div className="w-20 h-20 bg-surface-100 dark:bg-surface-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Bell className="w-10 h-10 text-surface-300" />
                    </div>
                    <h2 className="text-2xl font-black mb-2">No updates yet</h2>
                    <p className="text-surface-500 max-w-sm mx-auto font-medium">When you book spaces or equipment, you'll see confirmations and alerts here.</p>
                </div>
            )}

            {/* In-app Push Promo */}
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-primary-500/20">
                <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center shrink-0">
                        <Bell className="w-8 h-8" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h4 className="text-xl font-black">Enable Push Notifications</h4>
                        <p className="text-white/80 mt-2 font-medium leading-relaxed max-w-md">Never miss a booking update or a maintenance alert. Get real-time alerts even when the app is closed.</p>
                    </div>
                    <button className="px-8 py-4 bg-white text-primary-500 rounded-[1.25rem] font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-xl whitespace-nowrap">
                        Enable Browser Alerts
                    </button>
                </div>
            </div>
        </div>
    );
}
