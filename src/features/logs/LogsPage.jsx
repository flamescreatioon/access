import { useState, useMemo, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useLogsStore } from '../../stores/logsStore';
import { ROLES } from '../../lib/mockData';
import { format, formatDistanceToNow } from 'date-fns';
import {
    Search, Filter, Download, Calendar,
    CheckCircle2, XCircle, MapPin, Smartphone,
    Shield, Clock
} from 'lucide-react';

export default function LogsPage() {
    const { user } = useAuthStore();
    const { logs, getFilteredLogs, getMyLogs, exportCSV, fetchLogs } = useLogsStore();
    const isAdmin = user?.role === ROLES.ADMIN || user?.role === ROLES.HUB_MANAGER || user?.role === ROLES.SECURITY;

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [dateRange, setDateRange] = useState({ from: '', to: '' });

    // Get base logs depending on role
    const baseLogs = useMemo(() => {
        if (isAdmin) return logs;
        return getMyLogs(user?.id);
    }, [isAdmin, logs, user?.id, getMyLogs]);

    // Apply local filtering if not using store's getFilteredLogs for everything (or use store's logic)
    // Since store provides getFilteredLogs which operates on ALL logs, we might need to be careful for non-admins.
    // However, for simplicity and security (client-side), we can filter `baseLogs`.

    const filteredLogs = useMemo(() => {
        let results = baseLogs;

        if (search) {
            const q = search.toLowerCase();
            results = results.filter(l =>
                l.memberName.toLowerCase().includes(q) ||
                l.location.toLowerCase().includes(q) ||
                l.device.toLowerCase().includes(q) ||
                l.type.toLowerCase().includes(q)
            );
        }

        if (typeFilter && typeFilter !== 'all') {
            results = results.filter(l => l.type === typeFilter);
        }

        if (dateRange.from) {
            results = results.filter(l => new Date(l.timestamp) >= new Date(dateRange.from));
        }
        if (dateRange.to) {
            // Set to end of day
            const toDate = new Date(dateRange.to);
            toDate.setHours(23, 59, 59, 999);
            results = results.filter(l => new Date(l.timestamp) <= toDate);
        }

        return results;
    }, [baseLogs, search, typeFilter, dateRange]);

    const getTypeColor = (type) => {
        switch (type) {
            case 'entry': return 'text-success-500 bg-success-500/10';
            case 'exit': return 'text-surface-500 bg-surface-500/10';
            case 'denied': return 'text-danger-500 bg-danger-500/10';
            case 'room_access': return 'text-primary-500 bg-primary-500/10';
            case 'equipment_use': return 'text-accent-500 bg-accent-500/10';
            default: return 'text-surface-500 bg-surface-500/10';
        }
    };

    const totalLogs = filteredLogs.length;
    const grantedLogs = filteredLogs.filter(l => l.success).length;
    const deniedLogs = filteredLogs.filter(l => !l.success).length;
    const grantRate = totalLogs > 0 ? Math.round((grantedLogs / totalLogs) * 100) : 0;

    return (
        <div className="space-y-6 page-enter page-enter-active">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">
                        {isAdmin ? 'Access Logs' : 'My Activity'}
                    </h1>
                    <p className="text-surface-500 mt-1">
                        {isAdmin ? 'Monitor center usage & security events' : 'History of your visits and usage'}
                    </p>
                </div>
                {isAdmin && (
                    <button
                        onClick={exportCSV}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm font-medium hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                )}
            </div>

            {/* Stats Summary */}
            {isAdmin && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white dark:bg-surface-800/50 rounded-xl p-4 border border-surface-200 dark:border-surface-700/50">
                        <p className="text-xs text-surface-500 font-medium uppercase tracking-wider">Total Events</p>
                        <p className="text-2xl font-bold mt-1">{totalLogs}</p>
                    </div>
                    <div className="bg-white dark:bg-surface-800/50 rounded-xl p-4 border border-surface-200 dark:border-surface-700/50">
                        <p className="text-xs text-success-500 font-medium uppercase tracking-wider">Granted</p>
                        <p className="text-2xl font-bold mt-1 text-success-500">{grantedLogs}</p>
                    </div>
                    <div className="bg-white dark:bg-surface-800/50 rounded-xl p-4 border border-surface-200 dark:border-surface-700/50">
                        <p className="text-xs text-danger-500 font-medium uppercase tracking-wider">Denied</p>
                        <p className="text-2xl font-bold mt-1 text-danger-500">{deniedLogs}</p>
                    </div>
                    <div className="bg-white dark:bg-surface-800/50 rounded-xl p-4 border border-surface-200 dark:border-surface-700/50">
                        <p className="text-xs text-primary-500 font-medium uppercase tracking-wider">Grant Rate</p>
                        <div className="flex items-end gap-2 mt-1">
                            <p className="text-2xl font-bold text-primary-500">{grantRate}%</p>
                            <div className="flex-1 h-2 bg-surface-100 dark:bg-surface-700 rounded-full mb-1.5 overflow-hidden">
                                <div className="h-full bg-primary-500 rounded-full transition-all duration-500" style={{ width: `${grantRate}%` }} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white dark:bg-surface-800/50 rounded-2xl p-4 border border-surface-200 dark:border-surface-700/50 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            className="input pl-9 w-full"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                        <select
                            className="input pl-9 w-full appearance-none"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="all">All Events</option>
                            <option value="entry">Entry</option>
                            <option value="exit">Exit</option>
                            <option value="room_access">Room Access</option>
                            <option value="equipment_use">Equipment</option>
                            <option value="denied">Denied / Failed</option>
                        </select>
                    </div>

                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                        <input
                            type="date"
                            className="input pl-9 w-full"
                            value={dateRange.from}
                            onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                        />
                    </div>

                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                        <input
                            type="date"
                            className="input pl-9 w-full"
                            value={dateRange.to}
                            onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                        />
                    </div>
                </div>
            </div>

            {/* Logs Table/List */}
            <div className="bg-white dark:bg-surface-800/50 rounded-2xl border border-surface-200 dark:border-surface-700/50 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-surface-50 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
                            <tr>
                                <th className="px-6 py-4 font-medium text-surface-500">Status</th>
                                <th className="px-6 py-4 font-medium text-surface-500">Timestamp</th>
                                {isAdmin && <th className="px-6 py-4 font-medium text-surface-500">Member</th>}
                                <th className="px-6 py-4 font-medium text-surface-500">Type</th>
                                <th className="px-6 py-4 font-medium text-surface-500">Location</th>
                                <th className="px-6 py-4 font-medium text-surface-500">Device</th>
                                <th className="px-6 py-4 font-medium text-surface-500">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                            {filteredLogs.length > 0 ? (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-surface-50 dark:hover:bg-surface-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            {log.success ? (
                                                <CheckCircle2 className="w-5 h-5 text-success-500" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-danger-500" />
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-surface-900 dark:text-white">
                                                {format(new Date(log.timestamp), 'MMM d, HH:mm')}
                                            </div>
                                            <div className="text-xs text-surface-500">
                                                {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                                            </div>
                                        </td>
                                        {isAdmin && (
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-surface-900 dark:text-white">{log.memberName}</div>
                                                <div className="text-xs text-surface-500">ID: {log.memberId}</div>
                                            </td>
                                        )}
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getTypeColor(log.type)}`}>
                                                {log.type.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-surface-400" />
                                                <span>{log.location}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-surface-500">
                                            <div className="flex items-center gap-2">
                                                <Smartphone className="w-4 h-4 text-surface-400" />
                                                <span className="truncate max-w-[120px]" title={log.device}>{log.device}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {log.reason && (
                                                <span className="text-danger-500 text-xs font-medium bg-danger-500/10 px-2 py-1 rounded">
                                                    {log.reason.replace('_', ' ')}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={isAdmin ? 7 : 6} className="px-6 py-12 text-center text-surface-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Clock className="w-8 h-8 text-surface-300" />
                                            <p>No activity logs found matching your criteria</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
