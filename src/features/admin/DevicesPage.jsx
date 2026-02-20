import { useState } from 'react';
import {
    MonitorSmartphone, Wifi, WifiOff, Shield, RotateCw,
    AlertTriangle, MapPin, Clock, MoreVertical, Plus,
    Unlock, Power, Key, Activity, ChevronDown
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const mockDevices = [
    {
        id: 'd1', name: 'Main Entrance Scanner', type: 'door', location: 'Ground Floor - Main Lobby',
        status: 'online', apiKey: 'dev_ak_***********f3a2', firmware: 'v2.4.1',
        lastPing: new Date(Date.now() - 120000).toISOString(),
        todayScans: 145, failedAttempts: 3,
        battery: null, // wall powered
    },
    {
        id: 'd2', name: 'Innovation Lab A Door', type: 'door', location: 'Floor 1 - Innovation Lab',
        status: 'online', apiKey: 'dev_ak_***********b7c1', firmware: 'v2.4.1',
        lastPing: new Date(Date.now() - 60000).toISOString(),
        todayScans: 67, failedAttempts: 1,
        battery: null,
    },
    {
        id: 'd3', name: 'Workshop Gate', type: 'door', location: 'Floor 2 - Workshop Studio',
        status: 'offline', apiKey: 'dev_ak_***********e9d4', firmware: 'v2.3.8',
        lastPing: new Date(Date.now() - 34 * 60000).toISOString(),
        todayScans: 12, failedAttempts: 0,
        battery: null,
    },
    {
        id: 'd4', name: 'Server Room Lock', type: 'door', location: 'Floor 3 - Server Room',
        status: 'online', apiKey: 'dev_ak_***********a1b5', firmware: 'v2.4.1',
        lastPing: new Date(Date.now() - 30000).toISOString(),
        todayScans: 8, failedAttempts: 0,
        battery: null,
    },
    {
        id: 'd5', name: '3D Printer Monitor', type: 'equipment', location: 'Floor 2 - Workshop Studio',
        status: 'online', apiKey: 'dev_ak_***********c3f7', firmware: 'v1.2.0',
        lastPing: new Date(Date.now() - 180000).toISOString(),
        todayScans: 5, failedAttempts: 0,
        battery: 87,
    },
    {
        id: 'd6', name: 'Parking Barrier', type: 'door', location: 'Parking Level B1',
        status: 'online', apiKey: 'dev_ak_***********d8e2', firmware: 'v2.4.0',
        lastPing: new Date(Date.now() - 45000).toISOString(),
        todayScans: 34, failedAttempts: 2,
        battery: null,
    },
];

const typeIcons = {
    door: '🚪',
    equipment: '⚙️',
    scanner: '📡',
};

function DeviceCard({ device, onAction }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const isOnline = device.status === 'online';

    return (
        <div className={`bg-white dark:bg-surface-800/50 rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-lg
            ${isOnline ? 'border-surface-200 dark:border-surface-700/50' : 'border-danger-300 dark:border-danger-800/50'}`}>
            <div className="p-5">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl
                            ${isOnline ? 'bg-surface-100 dark:bg-surface-700' : 'bg-danger-100 dark:bg-danger-900/20'}`}>
                            {typeIcons[device.type] || '📡'}
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm">{device.name}</h3>
                            <div className="flex items-center gap-1.5 text-xs text-surface-500 mt-0.5">
                                <MapPin className="w-3 h-3" />
                                {device.location}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                            ${isOnline ? 'bg-success-100 dark:bg-success-900/20 text-success-600 dark:text-success-400'
                                : 'bg-danger-100 dark:bg-danger-900/20 text-danger-600 dark:text-danger-400 animate-pulse'}`}>
                            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                            {isOnline ? 'Online' : 'Offline'}
                        </span>
                        <div className="relative">
                            <button onClick={() => setMenuOpen(!menuOpen)}
                                className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
                                <MoreVertical className="w-4 h-4 text-surface-400" />
                            </button>
                            {menuOpen && (
                                <div className="absolute right-0 top-10 w-48 bg-white dark:bg-surface-800 rounded-xl shadow-2xl border border-surface-200 dark:border-surface-700 py-1 z-10">
                                    <button onClick={() => { onAction(device.id, 'test_unlock'); setMenuOpen(false); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-50 dark:hover:bg-surface-700 text-primary-500">
                                        <Unlock className="w-4 h-4" /> Test Unlock
                                    </button>
                                    <button onClick={() => { onAction(device.id, 'rotate_key'); setMenuOpen(false); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-50 dark:hover:bg-surface-700 text-warning-500">
                                        <Key className="w-4 h-4" /> Rotate API Key
                                    </button>
                                    <button onClick={() => { onAction(device.id, 'restart'); setMenuOpen(false); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-50 dark:hover:bg-surface-700 text-accent-500">
                                        <RotateCw className="w-4 h-4" /> Restart Device
                                    </button>
                                    <hr className="my-1 border-surface-200 dark:border-surface-700" />
                                    <button onClick={() => { onAction(device.id, 'disable'); setMenuOpen(false); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-50 dark:hover:bg-surface-700 text-danger-500">
                                        <Power className="w-4 h-4" /> Disable Device
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="text-center">
                        <p className="text-lg font-bold">{device.todayScans}</p>
                        <p className="text-[10px] text-surface-500 uppercase">Scans Today</p>
                    </div>
                    <div className="text-center">
                        <p className={`text-lg font-bold ${device.failedAttempts > 0 ? 'text-danger-500' : ''}`}>{device.failedAttempts}</p>
                        <p className="text-[10px] text-surface-500 uppercase">Failed</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-bold">{device.firmware}</p>
                        <p className="text-[10px] text-surface-500 uppercase">Firmware</p>
                    </div>
                </div>
            </div>

            {/* Expandable Details */}
            <button onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-center gap-1 py-2 text-xs text-surface-400 hover:text-surface-600 bg-surface-50 dark:bg-surface-800 border-t border-surface-200 dark:border-surface-700 transition-colors">
                <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                {expanded ? 'Less' : 'Details'}
            </button>
            {expanded && (
                <div className="px-5 pb-4 space-y-2 text-sm bg-surface-50/50 dark:bg-surface-800/30">
                    <div className="flex justify-between">
                        <span className="text-surface-500">API Key</span>
                        <code className="text-xs bg-surface-100 dark:bg-surface-700 px-2 py-0.5 rounded">{device.apiKey}</code>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-surface-500">Last Ping</span>
                        <span>{formatDistanceToNow(new Date(device.lastPing), { addSuffix: true })}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-surface-500">Type</span>
                        <span className="capitalize">{device.type}</span>
                    </div>
                    {device.battery !== null && (
                        <div className="flex justify-between items-center">
                            <span className="text-surface-500">Battery</span>
                            <div className="flex items-center gap-2">
                                <div className="w-16 h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${device.battery > 50 ? 'bg-success-500' : device.battery > 20 ? 'bg-warning-500' : 'bg-danger-500'}`}
                                        style={{ width: `${device.battery}%` }} />
                                </div>
                                <span className="text-xs">{device.battery}%</span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function DevicesPage() {
    const [devices, setDevices] = useState(mockDevices);
    const [filter, setFilter] = useState('all');
    const [showRegister, setShowRegister] = useState(false);
    const [toast, setToast] = useState(null);

    const filtered = devices.filter(d => {
        if (filter === 'online') return d.status === 'online';
        if (filter === 'offline') return d.status === 'offline';
        return true;
    });

    const onlineCount = devices.filter(d => d.status === 'online').length;
    const offlineCount = devices.filter(d => d.status === 'offline').length;

    const handleAction = (deviceId, action) => {
        const device = devices.find(d => d.id === deviceId);
        const messages = {
            test_unlock: `Test unlock sent to ${device.name}`,
            rotate_key: `API key rotated for ${device.name}`,
            restart: `Restart command sent to ${device.name}`,
            disable: `${device.name} has been disabled`,
        };
        setToast(messages[action]);
        setTimeout(() => setToast(null), 3000);
    };

    return (
        <div className="space-y-6 page-enter page-enter-active">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Devices</h1>
                    <p className="text-surface-500 mt-1">Manage access control hardware</p>
                </div>
                <button onClick={() => setShowRegister(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors shadow-md shadow-primary-500/20">
                    <Plus className="w-4 h-4" /> Register Device
                </button>
            </div>

            {/* Status Overview */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-white dark:bg-surface-800/50 rounded-xl p-4 border border-surface-200 dark:border-surface-700/50 text-center">
                    <p className="text-2xl font-bold">{devices.length}</p>
                    <p className="text-xs text-surface-500 mt-1">Total Devices</p>
                </div>
                <div className="bg-white dark:bg-surface-800/50 rounded-xl p-4 border border-surface-200 dark:border-surface-700/50 text-center">
                    <p className="text-2xl font-bold text-success-500">{onlineCount}</p>
                    <p className="text-xs text-surface-500 mt-1">Online</p>
                </div>
                <div className="bg-white dark:bg-surface-800/50 rounded-xl p-4 border border-surface-200 dark:border-surface-700/50 text-center">
                    <p className={`text-2xl font-bold ${offlineCount > 0 ? 'text-danger-500' : ''}`}>{offlineCount}</p>
                    <p className="text-xs text-surface-500 mt-1">Offline</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
                {['all', 'online', 'offline'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize
                        ${filter === f ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20' : 'bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-700'}`}>
                        {f}
                    </button>
                ))}
            </div>

            {/* Device Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(device => (
                    <DeviceCard key={device.id} device={device} onAction={handleAction} />
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-12 text-surface-500">
                    <MonitorSmartphone className="w-12 h-12 mx-auto text-surface-300 mb-3" />
                    <p className="text-lg">No devices found</p>
                    <p className="text-sm mt-1">Try adjusting your filter</p>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 bg-surface-900 dark:bg-surface-100 text-white dark:text-surface-900 px-6 py-3 rounded-xl shadow-2xl text-sm font-medium animate-in slide-in-from-bottom-4">
                    ✓ {toast}
                </div>
            )}

            {/* Register Device Modal */}
            {showRegister && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-surface-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-lg font-bold mb-4">Register New Device</h3>
                        <div className="space-y-3">
                            <input type="text" placeholder="Device Name" className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-transparent text-sm focus:outline-none focus:border-primary-500" />
                            <select className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-transparent text-sm">
                                <option>Door Scanner</option>
                                <option>Equipment Monitor</option>
                                <option>Parking Barrier</option>
                            </select>
                            <input type="text" placeholder="Location" className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-transparent text-sm focus:outline-none focus:border-primary-500" />
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowRegister(false)} className="flex-1 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 text-sm font-medium">Cancel</button>
                            <button onClick={() => { setShowRegister(false); setToast('Device registered (mock)'); setTimeout(() => setToast(null), 3000); }}
                                className="flex-1 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors shadow-md shadow-primary-500/20">
                                Register
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
