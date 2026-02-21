import { useState, useEffect } from 'react';
import api from '../../lib/api';
import {
    Smartphone, Shield, Check, Clock, MapPin,
    AlertTriangle, RefreshCw, Fingerprint
} from 'lucide-react';

export default function DeviceActivation() {
    const [device, setDevice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [form, setForm] = useState({ name: '', location: '' });
    const [toast, setToast] = useState(null);

    const fetchDevice = async () => {
        setLoading(true);
        try {
            const res = await api.get('/devices/my-device');
            setDevice(res.data);
        } catch (err) {
            if (err.response?.status === 404) {
                setDevice(null);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDevice(); }, []);

    const generateFingerprint = () => {
        const nav = navigator;
        const data = [
            nav.userAgent,
            nav.language,
            screen.width + 'x' + screen.height,
            screen.colorDepth,
            new Date().getTimezoneOffset(),
            nav.hardwareConcurrency || 0,
        ].join('|');
        // Simple hash
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            hash = ((hash << 5) - hash) + data.charCodeAt(i);
            hash |= 0;
        }
        return 'FP-' + Math.abs(hash).toString(36).toUpperCase();
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setRegistering(true);
        try {
            const fingerprint = generateFingerprint();
            const res = await api.post('/devices/register', {
                name: form.name || undefined,
                location: form.location || undefined,
                device_fingerprint: fingerprint,
            });
            setDevice(res.data.device);
            setToast('Device registered! Awaiting admin activation.');
        } catch (err) {
            setToast(err.response?.data?.message || 'Registration failed');
        } finally {
            setRegistering(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const statusConfig = {
        ACTIVE_SCANNER: { color: 'success', icon: Check, label: 'Active Scanner', desc: 'Your device is authorized for scanning.' },
        PENDING_ACTIVATION: { color: 'warning', icon: Clock, label: 'Pending Activation', desc: 'Awaiting admin approval. Contact your administrator.' },
        SUSPENDED: { color: 'danger', icon: AlertTriangle, label: 'Suspended', desc: 'Your scanner has been suspended by admin.' },
        REVOKED: { color: 'danger', icon: AlertTriangle, label: 'Revoked', desc: 'Your scanner has been revoked.' },
    };

    const status = device ? statusConfig[device.status] : null;

    return (
        <div className="max-w-md mx-auto space-y-6 page-enter page-enter-active">
            <div className="text-center">
                <h1 className="text-2xl md:text-3xl font-bold">Device Setup</h1>
                <p className="text-surface-500 mt-1">Register this device as a scanner</p>
            </div>

            {device ? (
                /* Device Status Card */
                <div className="bg-white dark:bg-surface-800/50 rounded-3xl border border-surface-200 dark:border-surface-700/50 shadow-xl overflow-hidden">
                    <div className={`bg-${status.color}-500/10 p-6 text-center`}>
                        <div className={`w-16 h-16 mx-auto rounded-2xl bg-${status.color}-500/20 flex items-center justify-center mb-3`}>
                            <status.icon className={`w-8 h-8 text-${status.color}-500`} />
                        </div>
                        <h2 className="text-xl font-bold">{status.label}</h2>
                        <p className="text-sm text-surface-500 mt-1">{status.desc}</p>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-surface-50 dark:bg-surface-700/50 rounded-xl p-3">
                                <p className="text-[10px] text-surface-400 uppercase tracking-wider">Device Name</p>
                                <p className="font-semibold text-sm mt-1 flex items-center gap-1.5">
                                    <Smartphone className="w-3.5 h-3.5 text-primary-500" />
                                    {device.name}
                                </p>
                            </div>
                            <div className="bg-surface-50 dark:bg-surface-700/50 rounded-xl p-3">
                                <p className="text-[10px] text-surface-400 uppercase tracking-wider">Location</p>
                                <p className="font-semibold text-sm mt-1 flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-accent-500" />
                                    {device.location}
                                </p>
                            </div>
                        </div>

                        {device.status === 'ACTIVE_SCANNER' && (
                            <div className="bg-success-500/5 border border-success-500/20 rounded-xl p-3">
                                <div className="flex items-center gap-2 text-success-600 dark:text-success-400">
                                    <Shield className="w-4 h-4" />
                                    <span className="font-medium text-sm">Scanner Token Active</span>
                                </div>
                                <p className="text-xs text-surface-500 mt-1">
                                    Last activity: {device.last_activity
                                        ? new Date(device.last_activity).toLocaleString()
                                        : 'No scans yet'}
                                </p>
                            </div>
                        )}

                        <button onClick={fetchDevice}
                            className="w-full py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 text-sm font-medium hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors flex items-center justify-center gap-2">
                            <RefreshCw className="w-4 h-4" /> Refresh Status
                        </button>
                    </div>
                </div>
            ) : (
                /* Registration Form */
                <form onSubmit={handleRegister}
                    className="bg-white dark:bg-surface-800/50 rounded-3xl border border-surface-200 dark:border-surface-700/50 shadow-xl p-6 space-y-4">
                    <div className="text-center mb-4">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-500/10 flex items-center justify-center mb-3">
                            <Fingerprint className="w-8 h-8 text-primary-500" />
                        </div>
                        <h2 className="font-bold text-lg">Register This Device</h2>
                        <p className="text-sm text-surface-500 mt-1">
                            Your device fingerprint will be captured automatically
                        </p>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-surface-500 mb-1 block">Device Name (optional)</label>
                        <input type="text" placeholder="e.g. Main Entrance Scanner"
                            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-transparent text-sm focus:outline-none focus:border-primary-500 transition-colors" />
                    </div>

                    <div>
                        <label className="text-xs font-medium text-surface-500 mb-1 block">Location (optional)</label>
                        <input type="text" placeholder="e.g. Front Door, Gate A"
                            value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-transparent text-sm focus:outline-none focus:border-primary-500 transition-colors" />
                    </div>

                    <button type="submit" disabled={registering}
                        className="w-full py-3 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors shadow-md shadow-primary-500/20 flex items-center justify-center gap-2">
                        {registering ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <><Smartphone className="w-5 h-5" /> Register Device</>
                        )}
                    </button>
                </form>
            )}

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 bg-surface-900 dark:bg-surface-100 text-white dark:text-surface-900 px-6 py-3 rounded-xl shadow-2xl text-sm font-medium">
                    {toast}
                </div>
            )}
        </div>
    );
}
