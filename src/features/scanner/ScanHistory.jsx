import { useState, useEffect } from 'react';
import api from '../../lib/api';
import {
    Activity, Check, Ban, Clock, Shield, AlertTriangle,
    TrendingUp, Users, RefreshCw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ScanHistory() {
    const [scans, setScans] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [scansRes, statsRes] = await Promise.all([
                api.get('/scan/recent?limit=50'),
                api.get('/scan/stats'),
            ]);
            setScans(scansRes.data);
            setStats(statsRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const decisionStyles = {
        Grant: { bg: 'bg-success-500/10', text: 'text-success-600 dark:text-success-400', icon: Check, label: 'Granted' },
        Deny: { bg: 'bg-danger-500/10', text: 'text-danger-600 dark:text-danger-400', icon: Ban, label: 'Denied' },
        Pending: { bg: 'bg-warning-500/10', text: 'text-warning-600 dark:text-warning-400', icon: Clock, label: 'Pending' },
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 page-enter page-enter-active">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Scan History</h1>
                    <p className="text-surface-500 mt-1">Today's scanning activity</p>
                </div>
                <button onClick={fetchData}
                    className="p-2.5 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors">
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white dark:bg-surface-800/50 rounded-2xl p-4 border border-surface-200 dark:border-surface-700/50">
                        <div className="flex items-center gap-2 text-surface-500 mb-2">
                            <Activity className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase">Total</span>
                        </div>
                        <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <div className="bg-white dark:bg-surface-800/50 rounded-2xl p-4 border border-surface-200 dark:border-surface-700/50">
                        <div className="flex items-center gap-2 text-success-500 mb-2">
                            <Check className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase">Granted</span>
                        </div>
                        <p className="text-2xl font-bold text-success-600 dark:text-success-400">{stats.granted}</p>
                    </div>
                    <div className="bg-white dark:bg-surface-800/50 rounded-2xl p-4 border border-surface-200 dark:border-surface-700/50">
                        <div className="flex items-center gap-2 text-danger-500 mb-2">
                            <Ban className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase">Denied</span>
                        </div>
                        <p className="text-2xl font-bold text-danger-600 dark:text-danger-400">{stats.denied}</p>
                    </div>
                    <div className="bg-white dark:bg-surface-800/50 rounded-2xl p-4 border border-surface-200 dark:border-surface-700/50">
                        <div className="flex items-center gap-2 text-warning-500 mb-2">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase">Overrides</span>
                        </div>
                        <p className="text-2xl font-bold text-warning-600 dark:text-warning-400">{stats.overrides}</p>
                    </div>
                </div>
            )}

            {/* Scan Log */}
            <div className="space-y-2">
                {scans.length === 0 ? (
                    <div className="text-center py-16 text-surface-500">
                        <Activity className="w-12 h-12 mx-auto text-surface-300 mb-3" />
                        <p className="text-lg font-medium">No scans yet</p>
                        <p className="text-sm mt-1">Start scanning to see activity here</p>
                    </div>
                ) : (
                    scans.map(scan => {
                        const style = decisionStyles[scan.decision] || decisionStyles.Pending;
                        const Icon = style.icon;
                        return (
                            <div key={scan.id}
                                className="flex items-center gap-3 p-4 bg-white dark:bg-surface-800/50 rounded-2xl border border-surface-200 dark:border-surface-700/50 hover:shadow-md transition-shadow">
                                <div className={`w-10 h-10 rounded-xl ${style.bg} flex items-center justify-center shrink-0`}>
                                    <Icon className={`w-5 h-5 ${style.text}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-sm">{scan.User?.name || `User #${scan.user_id}`}</p>
                                        {scan.override && (
                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-warning-500/10 text-warning-600">OVERRIDE</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-surface-500 mt-0.5">
                                        {style.label}
                                        {scan.deny_reason && ` • ${scan.deny_reason.replace(/_/g, ' ')}`}
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <span className={`inline-block px-2 py-1 rounded-lg text-xs font-semibold ${style.bg} ${style.text}`}>
                                        {style.label}
                                    </span>
                                    <p className="text-[10px] text-surface-400 mt-1">
                                        {formatDistanceToNow(new Date(scan.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
