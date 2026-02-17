import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { UserPlus, Clock, Trash2, QrCode, Shield, Calendar } from 'lucide-react';
import { format, formatDistanceToNow, addHours } from 'date-fns';

export default function VisitorManagement() {
    const [visitors, setVisitors] = useState([
        { id: 'v1', name: 'Jane Doe', email: 'jane@example.com', purpose: 'Meeting', host: 'Alex Chen', status: 'active', createdAt: new Date(Date.now() - 3600000).toISOString(), expiresAt: addHours(new Date(), 2).toISOString(), qrToken: 'VISIT:v1:guest:' + Date.now() },
        { id: 'v2', name: 'John Smith', email: 'john@example.com', purpose: 'Workshop', host: 'Morgan Rodriguez', status: 'expired', createdAt: new Date(Date.now() - 86400000).toISOString(), expiresAt: new Date(Date.now() - 43200000).toISOString(), qrToken: 'VISIT:v2:guest:' + Date.now() },
    ]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', purpose: '', hours: 4 });
    const [selectedVisitor, setSelectedVisitor] = useState(null);

    const createPass = () => {
        const newVisitor = {
            id: `v${Date.now()}`,
            name: form.name,
            email: form.email,
            purpose: form.purpose,
            host: 'Admin',
            status: 'active',
            createdAt: new Date().toISOString(),
            expiresAt: addHours(new Date(), form.hours).toISOString(),
            qrToken: `VISIT:${Date.now()}:guest:${Math.random().toString(36).slice(2)}`,
        };
        setVisitors(prev => [newVisitor, ...prev]);
        setShowForm(false);
        setForm({ name: '', email: '', purpose: '', hours: 4 });
    };

    const revokePass = (id) => {
        setVisitors(prev => prev.map(v => v.id === id ? { ...v, status: 'revoked' } : v));
    };

    return (
        <div className="space-y-6 page-enter page-enter-active">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Visitors</h1>
                    <p className="text-surface-500 mt-1">Manage visitor access passes</p>
                </div>
                <button onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors shadow-md shadow-primary-500/20">
                    <UserPlus className="w-4 h-4" /> Create Pass
                </button>
            </div>

            {/* Visitor List */}
            <div className="space-y-3">
                {visitors.map(v => {
                    const isExpired = new Date(v.expiresAt) < new Date();
                    const isActive = v.status === 'active' && !isExpired;
                    return (
                        <div key={v.id} className="bg-white dark:bg-surface-800/50 rounded-2xl border border-surface-200 dark:border-surface-700/50 p-5 hover:shadow-lg transition-all">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg
                    ${isActive ? 'bg-success-100 dark:bg-success-900/20' : 'bg-surface-100 dark:bg-surface-700'}`}>
                                        👤
                                    </div>
                                    <div>
                                        <p className="font-semibold">{v.name}</p>
                                        <p className="text-sm text-surface-500">{v.email}</p>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-surface-400">
                                            <span>📋 {v.purpose}</span>
                                            <span>🙋 Host: {v.host}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold
                    ${isActive ? 'bg-success-100 dark:bg-success-900/20 text-success-600' : 'bg-surface-100 dark:bg-surface-700 text-surface-500'}`}>
                                        {isActive ? 'Active' : v.status === 'revoked' ? 'Revoked' : 'Expired'}
                                    </span>
                                    <div className="flex items-center gap-1 text-xs text-surface-400">
                                        <Clock className="w-3 h-3" />
                                        {isActive ? `Expires ${formatDistanceToNow(new Date(v.expiresAt), { addSuffix: true })}` : 'Expired'}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button onClick={() => setSelectedVisitor(selectedVisitor?.id === v.id ? null : v)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 transition-colors">
                                    <QrCode className="w-3.5 h-3.5" /> {selectedVisitor?.id === v.id ? 'Hide' : 'Show'} QR
                                </button>
                                {isActive && (
                                    <button onClick={() => revokePass(v.id)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-danger-50 dark:bg-danger-900/20 text-danger-500 hover:bg-danger-100 transition-colors">
                                        <Trash2 className="w-3.5 h-3.5" /> Revoke
                                    </button>
                                )}
                            </div>
                            {selectedVisitor?.id === v.id && (
                                <div className="mt-4 flex justify-center p-4 bg-white rounded-xl border border-surface-200 dark:border-surface-700">
                                    <QRCodeSVG value={v.qrToken} size={160} level="M" fgColor="#0f172a" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Create Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-surface-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-lg font-bold mb-4">Create Visitor Pass</h3>
                        <div className="space-y-3">
                            <input type="text" placeholder="Visitor Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-transparent text-sm focus:outline-none focus:border-primary-500" />
                            <input type="email" placeholder="Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-transparent text-sm focus:outline-none focus:border-primary-500" />
                            <input type="text" placeholder="Purpose of Visit" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-transparent text-sm focus:outline-none focus:border-primary-500" />
                            <div>
                                <label className="text-sm text-surface-500 mb-1 block">Access Duration</label>
                                <select value={form.hours} onChange={(e) => setForm({ ...form, hours: Number(e.target.value) })}
                                    className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-transparent text-sm">
                                    {[1, 2, 4, 8, 12].map(h => <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 text-sm font-medium">Cancel</button>
                            <button onClick={createPass} disabled={!form.name}
                                className="flex-1 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors shadow-md shadow-primary-500/20 disabled:opacity-50">
                                Create Pass
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
