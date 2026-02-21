import { useState, useEffect } from 'react';
import api from '../../lib/api';
import {
    MonitorSmartphone, Smartphone, Shield, Check, X, Ban,
    Clock, MapPin, MoreVertical, RefreshCw, User, AlertTriangle,
    Wifi, WifiOff, Power, ChevronDown, ScanLine
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const statusConfig = {
    ACTIVE_SCANNER: { label: 'Active', color: 'success', icon: Check },
    PENDING_ACTIVATION: { label: 'Pending', color: 'warning', icon: Clock },
    SUSPENDED: { label: 'Suspended', color: 'danger', icon: Ban },
    REVOKED: { label: 'Revoked', color: 'surface', icon: X },
};

function ScannerDeviceCard({ device, onAction, actionLoading }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const cfg = statusConfig[device.status] || statusConfig.PENDING_ACTIVATION;
    const StatusIcon = cfg.icon;
    const owner = device.User;

    return (
        <div className="bg-white dark:bg-surface-800/50 rounded-2xl border border-surface-200 dark:border-surface-700/50 overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="p-5">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center">
                            <Smartphone className="w-6 h-6 text-primary-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm">{device.name}</h3>
                            <div className="flex items-center gap-1.5 text-xs text-surface-500 mt-0.5">
                                <MapPin className="w-3 h-3" />
                                {device.location || 'Unassigned'}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold
                            bg-${cfg.color}-500/10 text-${cfg.color}-600 dark:text-${cfg.color}-400`}>
                            <StatusIcon className="w-3 h-3" />
                            {cfg.label}
                        </span>
                        <div className="relative">
                            <button onClick={() => setMenuOpen(!menuOpen)}
                                className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
                                <MoreVertical className="w-4 h-4 text-surface-400" />
                            </button>
                            {menuOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                                    <div className="absolute right-0 top-10 w-48 bg-white dark:bg-surface-800 rounded-xl shadow-2xl border border-surface-200 dark:border-surface-700 py-1 z-20">
                                        {device.status === 'PENDING_ACTIVATION' && (
                                            <button onClick={() => { onAction(device.id, 'activate'); setMenuOpen(false); }}
                                                disabled={actionLoading}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-50 dark:hover:bg-surface-700 text-success-600">
                                                <Check className="w-4 h-4" /> Approve & Activate
                                            </button>
                                        )}
                                        {device.status === 'SUSPENDED' && (
                                            <button onClick={() => { onAction(device.id, 'activate'); setMenuOpen(false); }}
                                                disabled={actionLoading}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-50 dark:hover:bg-surface-700 text-success-600">
                                                <Check className="w-4 h-4" /> Reactivate
                                            </button>
                                        )}
                                        {device.status === 'ACTIVE_SCANNER' && (
                                            <button onClick={() => { onAction(device.id, 'suspend'); setMenuOpen(false); }}
                                                disabled={actionLoading}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-50 dark:hover:bg-surface-700 text-warning-600">
                                                <Ban className="w-4 h-4" /> Suspend
                                            </button>
                                        )}
                                        {device.status !== 'REVOKED' && (
                                            <>
                                                <hr className="my-1 border-surface-200 dark:border-surface-700" />
                                                <button onClick={() => { onAction(device.id, 'revoke'); setMenuOpen(false); }}
                                                    disabled={actionLoading}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-50 dark:hover:bg-surface-700 text-danger-500">
                                                    <Power className="w-4 h-4" /> Revoke
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Owner Info */}
                {owner && (
                    <div className="flex items-center gap-2 mt-4 p-3 bg-surface-50 dark:bg-surface-700/50 rounded-xl">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-xs font-bold">
                            {(owner.name || '?').split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{owner.name}</p>
                            <p className="text-xs text-surface-500">{owner.role}</p>
                        </div>
                    </div>
                )}

                {/* Timestamps */}
                <div className="mt-3 space-y-1 text-xs text-surface-400">
                    <p>Registered {formatDistanceToNow(new Date(device.createdAt), { addSuffix: true })}</p>
                    {device.activated_at && (
                        <p>Activated {formatDistanceToNow(new Date(device.activated_at), { addSuffix: true })}</p>
                    )}
                    {device.last_activity && (
                        <p>Last scan {formatDistanceToNow(new Date(device.last_activity), { addSuffix: true })}</p>
                    )}
                </div>
            </div>

            {/* Quick Action for Pending */}
            {device.status === 'PENDING_ACTIVATION' && (
                <div className="flex border-t border-surface-200 dark:border-surface-700">
                    <button onClick={() => onAction(device.id, 'revoke')} disabled={actionLoading}
                        className="flex-1 py-3 text-sm font-medium text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors flex items-center justify-center gap-1.5">
                        <X className="w-4 h-4" /> Reject
                    </button>
                    <div className="w-px bg-surface-200 dark:bg-surface-700" />
                    <button onClick={() => onAction(device.id, 'activate')} disabled={actionLoading}
                        className="flex-1 py-3 text-sm font-bold text-success-600 hover:bg-success-50 dark:hover:bg-success-900/20 transition-colors flex items-center justify-center gap-1.5">
                        <Check className="w-4 h-4" /> Approve
                    </button>
                </div>
            )}
        </div>
    );
}

export default function DevicesPage() {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [actionLoading, setActionLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const fetchDevices = async () => {
        setLoading(true);
        try {
            const res = await api.get('/devices');
            setDevices(res.data);
        } catch (err) {
            console.error('Error fetching devices:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDevices(); }, []);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const handleAction = async (deviceId, action) => {
        setActionLoading(true);
        try {
            const endpoint = `/devices/${deviceId}/${action}`;
            const res = await api.put(endpoint);
            showToast(res.data.message || `Device ${action}d successfully`);
            fetchDevices(); // refresh list
        } catch (err) {
            showToast(err.response?.data?.message || `Failed to ${action} device`);
        } finally {
            setActionLoading(false);
        }
    };

    const filtered = devices.filter(d => {
        if (filter === 'pending') return d.status === 'PENDING_ACTIVATION';
        if (filter === 'active') return d.status === 'ACTIVE_SCANNER';
        if (filter === 'suspended') return d.status === 'SUSPENDED';
        if (filter === 'revoked') return d.status === 'REVOKED';
        return true;
    });

    const counts = {
        all: devices.length,
        pending: devices.filter(d => d.status === 'PENDING_ACTIVATION').length,
        active: devices.filter(d => d.status === 'ACTIVE_SCANNER').length,
        suspended: devices.filter(d => d.status === 'SUSPENDED').length,
        revoked: devices.filter(d => d.status === 'REVOKED').length,
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Scanner Devices</h1>
                    <p className="text-surface-500 mt-1">Manage hub manager scanner devices</p>
                </div>
                <button onClick={fetchDevices}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm font-medium hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors">
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* Status Overview */}
            {counts.pending > 0 && (
                <div className="flex items-center gap-3 p-4 bg-warning-500/10 border border-warning-500/20 rounded-2xl">
                    <AlertTriangle className="w-5 h-5 text-warning-500 shrink-0" />
                    <div>
                        <p className="font-medium text-sm text-warning-700 dark:text-warning-300">
                            {counts.pending} device{counts.pending > 1 ? 's' : ''} awaiting approval
                        </p>
                        <p className="text-xs text-warning-600/60 dark:text-warning-400/60">
                            Hub managers cannot scan until their device is activated
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-surface-800/50 rounded-xl p-4 border border-surface-200 dark:border-surface-700/50 text-center">
                    <p className="text-2xl font-bold">{counts.all}</p>
                    <p className="text-xs text-surface-500 mt-1">Total</p>
                </div>
                <div className="bg-white dark:bg-surface-800/50 rounded-xl p-4 border border-surface-200 dark:border-surface-700/50 text-center">
                    <p className="text-2xl font-bold text-success-500">{counts.active}</p>
                    <p className="text-xs text-surface-500 mt-1">Active</p>
                </div>
                <div className="bg-white dark:bg-surface-800/50 rounded-xl p-4 border border-surface-200 dark:border-surface-700/50 text-center">
                    <p className={`text-2xl font-bold ${counts.pending > 0 ? 'text-warning-500' : ''}`}>{counts.pending}</p>
                    <p className="text-xs text-surface-500 mt-1">Pending</p>
                </div>
                <div className="bg-white dark:bg-surface-800/50 rounded-xl p-4 border border-surface-200 dark:border-surface-700/50 text-center">
                    <p className={`text-2xl font-bold ${counts.suspended > 0 ? 'text-danger-500' : ''}`}>{counts.suspended}</p>
                    <p className="text-xs text-surface-500 mt-1">Suspended</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
                {[
                    { key: 'all', label: 'All' },
                    { key: 'pending', label: 'Pending' },
                    { key: 'active', label: 'Active' },
                    { key: 'suspended', label: 'Suspended' },
                    { key: 'revoked', label: 'Revoked' },
                ].map(f => (
                    <button key={f.key} onClick={() => setFilter(f.key)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap
                        ${filter === f.key
                                ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                                : 'bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-700'}`}>
                        {f.label}
                        <span className="ml-1 opacity-60">({counts[f.key]})</span>
                    </button>
                ))}
            </div>

            {/* Device Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(device => (
                    <ScannerDeviceCard
                        key={device.id}
                        device={device}
                        onAction={handleAction}
                        actionLoading={actionLoading}
                    />
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-16 text-surface-500">
                    <ScanLine className="w-12 h-12 mx-auto text-surface-300 mb-3" />
                    <p className="text-lg font-medium">No devices found</p>
                    <p className="text-sm mt-1">
                        {filter !== 'all' ? 'Try adjusting your filter' : 'Hub managers need to register their devices first'}
                    </p>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 bg-surface-900 dark:bg-surface-100 text-white dark:text-surface-900 px-6 py-3 rounded-xl shadow-2xl text-sm font-medium animate-in slide-in-from-bottom-4">
                    ✓ {toast}
                </div>
            )}
        </div>
    );
}
