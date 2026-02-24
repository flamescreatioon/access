import { useState, useEffect } from 'react';
import api from '../../lib/api';
import {
    Shield, Clock, Users, Timer, AlertTriangle, List,
    Plus, Edit2, Trash2, Save, X, Settings, Gauge,
    Ban, Eye, ChevronDown, RefreshCw, Sliders
} from 'lucide-react';

const FIELD_CONFIG = [
    {
        key: 'weekly_hour_limit',
        label: 'Weekly Hour Limit',
        description: 'Max hours a user can book in a rolling 7-day window. Use -1 for unlimited.',
        icon: Clock,
        type: 'number',
        step: 0.5,
        color: 'text-primary-500 bg-primary-500/10',
        unit: 'hours',
    },
    {
        key: 'max_active_bookings',
        label: 'Max Active Bookings',
        description: 'Max number of future confirmed bookings per user. Use -1 for unlimited.',
        icon: List,
        type: 'number',
        step: 1,
        color: 'text-accent-500 bg-accent-500/10',
        unit: 'bookings',
    },
    {
        key: 'cooldown_hours',
        label: 'Cooldown Period',
        description: 'Hours before a user can rebook the same resource. Use 0 to disable.',
        icon: Timer,
        type: 'number',
        step: 1,
        color: 'text-warning-500 bg-warning-500/10',
        unit: 'hours',
    },
    {
        key: 'lock_duration_seconds',
        label: 'Slot Lock Duration',
        description: 'Seconds a slot is held for a user during booking. Prevents race conditions.',
        icon: Shield,
        type: 'number',
        step: 30,
        color: 'text-primary-600 bg-primary-600/10',
        unit: 'seconds',
    },
    {
        key: 'no_show_warning_threshold',
        label: 'No-Show Warning At',
        description: 'Number of no-shows before user receives a warning.',
        icon: Eye,
        type: 'number',
        step: 1,
        color: 'text-surface-500 bg-surface-500/10',
        unit: 'no-shows',
    },
    {
        key: 'no_show_quota_reduction_threshold',
        label: 'No-Show Quota Cut At',
        description: 'No-shows before weekly limit is halved (50% reduction).',
        icon: AlertTriangle,
        type: 'number',
        step: 1,
        color: 'text-warning-500 bg-warning-500/10',
        unit: 'no-shows',
    },
    {
        key: 'no_show_suspension_threshold',
        label: 'No-Show Suspension At',
        description: 'No-shows before user is temporarily banned from booking.',
        icon: Ban,
        type: 'number',
        step: 1,
        color: 'text-danger-500 bg-danger-500/10',
        unit: 'no-shows',
    },
    {
        key: 'no_show_window_days',
        label: 'No-Show Window',
        description: 'Rolling window (in days) for counting no-shows.',
        icon: RefreshCw,
        type: 'number',
        step: 1,
        color: 'text-surface-500 bg-surface-500/10',
        unit: 'days',
    },
    {
        key: 'waitlist_enabled',
        label: 'Waitlist Enabled',
        description: 'Allow users to join a FIFO queue when a slot is fully booked.',
        icon: Users,
        type: 'toggle',
        color: 'text-success-500 bg-success-500/10',
    },
    {
        key: 'waitlist_claim_minutes',
        label: 'Waitlist Claim Window',
        description: 'Minutes a waitlisted user has to claim an offered slot.',
        icon: Gauge,
        type: 'number',
        step: 1,
        color: 'text-success-500 bg-success-500/10',
        unit: 'minutes',
    },
];

function showToast(msg, setter) {
    setter(msg);
    setTimeout(() => setter(null), 3000);
}

function ConfigCard({ config, onEdit, onDelete }) {
    const [expanded, setExpanded] = useState(false);
    const isGlobal = config.resource_type === 'global';
    const typeLabel = isGlobal ? 'Global Default' : config.resource_type === 'space' ? 'Spaces' : 'Equipment';
    const typeColor = isGlobal
        ? 'text-primary-500 bg-primary-500/10'
        : config.resource_type === 'space'
            ? 'text-accent-500 bg-accent-500/10'
            : 'text-warning-500 bg-warning-500/10';

    return (
        <div className="bg-white dark:bg-surface-800/50 rounded-2xl border border-surface-200 dark:border-surface-700/50 transition-all duration-300 hover:shadow-lg overflow-hidden">
            <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeColor}`}>
                            <Sliders className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold">{typeLabel}</h3>
                            <p className="text-xs text-surface-500 mt-0.5">
                                {config.resource_id ? `Resource #${config.resource_id}` : 'Applies to all'}
                            </p>
                        </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${typeColor}`}>
                        {typeLabel}
                    </span>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="bg-surface-50 dark:bg-surface-900/50 rounded-xl p-3 text-center">
                        <p className="text-lg font-bold">{config.weekly_hour_limit < 0 ? '∞' : config.weekly_hour_limit}</p>
                        <p className="text-[10px] text-surface-500 uppercase tracking-wider font-semibold mt-0.5">hrs/week</p>
                    </div>
                    <div className="bg-surface-50 dark:bg-surface-900/50 rounded-xl p-3 text-center">
                        <p className="text-lg font-bold">{config.max_active_bookings < 0 ? '∞' : config.max_active_bookings}</p>
                        <p className="text-[10px] text-surface-500 uppercase tracking-wider font-semibold mt-0.5">max active</p>
                    </div>
                    <div className="bg-surface-50 dark:bg-surface-900/50 rounded-xl p-3 text-center">
                        <p className="text-lg font-bold">{config.cooldown_hours}h</p>
                        <p className="text-[10px] text-surface-500 uppercase tracking-wider font-semibold mt-0.5">cooldown</p>
                    </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                    {config.waitlist_enabled && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-success-500 bg-success-500/10">
                            <Users className="w-3 h-3" /> Waitlist On
                        </span>
                    )}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-surface-100 dark:bg-surface-700">
                        <Ban className="w-3 h-3" /> Suspend at {config.no_show_suspension_threshold} no-shows
                    </span>
                </div>
            </div>

            <button onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-center gap-1 py-2 text-xs text-surface-400 hover:text-surface-600 bg-surface-50 dark:bg-surface-800 border-t border-surface-200 dark:border-surface-700 transition-colors">
                <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                {expanded ? 'Less' : 'Actions'}
            </button>
            {expanded && (
                <div className="px-5 pb-4 flex gap-2 bg-surface-50/50 dark:bg-surface-800/30">
                    <button onClick={() => onEdit(config)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 transition-colors">
                        <Edit2 className="w-3 h-3" /> Edit Config
                    </button>
                    {!isGlobal && (
                        <button onClick={() => onDelete(config.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-danger-50 dark:bg-danger-900/20 text-danger-500 hover:bg-danger-100 transition-colors">
                            <Trash2 className="w-3 h-3" /> Delete
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

function ConfigModal({ config, onClose, onSave }) {
    const isEdit = !!config;
    const [formData, setFormData] = useState(config || {
        resource_type: 'global',
        resource_id: null,
        weekly_hour_limit: 6.0,
        max_active_bookings: 3,
        cooldown_hours: 24,
        lock_duration_seconds: 300,
        no_show_warning_threshold: 1,
        no_show_quota_reduction_threshold: 2,
        no_show_suspension_threshold: 3,
        no_show_window_days: 30,
        waitlist_enabled: false,
        waitlist_claim_minutes: 10,
    });
    const [saving, setSaving] = useState(false);

    const handleChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        setSaving(true);
        await onSave(formData);
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-surface-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white dark:bg-surface-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-surface-100 dark:border-surface-700">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Settings className="w-5 h-5 text-primary-500" />
                            {isEdit ? 'Edit Booking Rules' : 'New Booking Rules'}
                        </h2>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
                    {/* Scope */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5 ml-1">Scope</label>
                            <select
                                value={formData.resource_type}
                                onChange={(e) => handleChange('resource_type', e.target.value)}
                                disabled={isEdit && formData.resource_type === 'global'}
                                className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-900 border-none focus:ring-2 focus:ring-primary-500 transition-all font-medium disabled:opacity-50"
                            >
                                <option value="global">Global Default</option>
                                <option value="space">Spaces</option>
                                <option value="equipment">Equipment</option>
                            </select>
                        </div>
                        {formData.resource_type !== 'global' && (
                            <div>
                                <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5 ml-1">Resource ID</label>
                                <input
                                    type="number"
                                    value={formData.resource_id || ''}
                                    onChange={(e) => handleChange('resource_id', e.target.value ? parseInt(e.target.value) : null)}
                                    placeholder="Leave empty for all"
                                    className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-900 border-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                />
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-surface-200 dark:border-surface-700" />

                    {/* Fields */}
                    {FIELD_CONFIG.map(field => {
                        const Icon = field.icon;
                        return (
                            <div key={field.key} className="flex items-start gap-3">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${field.color}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <label className="block text-sm font-semibold mb-0.5">{field.label}</label>
                                    <p className="text-xs text-surface-500 mb-2">{field.description}</p>
                                    {field.type === 'toggle' ? (
                                        <button
                                            onClick={() => handleChange(field.key, !formData[field.key])}
                                            className={`relative w-12 h-7 rounded-full transition-colors ${formData[field.key] ? 'bg-success-500' : 'bg-surface-300 dark:bg-surface-600'}`}
                                        >
                                            <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-all ${formData[field.key] ? 'left-[22px]' : 'left-0.5'}`} />
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={formData[field.key]}
                                                onChange={(e) => handleChange(field.key, parseFloat(e.target.value) || 0)}
                                                step={field.step}
                                                className="w-28 px-3 py-2 rounded-xl bg-surface-50 dark:bg-surface-900 border-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-sm"
                                            />
                                            {field.unit && (
                                                <span className="text-xs text-surface-400 font-medium">{field.unit}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="p-6 bg-surface-50 dark:bg-surface-900/50 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl font-semibold text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={saving}
                        className="flex-[2] py-3 rounded-xl font-semibold bg-primary-500 text-white hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/20 disabled:opacity-50 flex items-center justify-center gap-2">
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : isEdit ? 'Update Rules' : 'Create Rules'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function BookingConfigPage() {
    const [configs, setConfigs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modal, setModal] = useState({ open: false, data: null });
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/booking-config');
            setConfigs(res.data);
        } catch (error) {
            console.error('Error fetching configs:', error);
            showToast('Failed to load booking rules', setToast);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (data) => {
        try {
            if (data.id) {
                const res = await api.put(`/booking-config/${data.id}`, data);
                setConfigs(prev => prev.map(c => c.id === data.id ? res.data : c));
                showToast('Rules updated successfully', setToast);
            } else {
                const res = await api.post('/booking-config', data);
                setConfigs(prev => [...prev, res.data]);
                showToast('Rules created successfully', setToast);
            }
            setModal({ open: false, data: null });
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to save rules', setToast);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this configuration? The global defaults will apply instead.')) return;
        try {
            await api.delete(`/booking-config/${id}`);
            setConfigs(prev => prev.filter(c => c.id !== id));
            showToast('Configuration deleted', setToast);
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to delete', setToast);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-surface-500 animate-pulse">Loading booking rules...</p>
            </div>
        );
    }

    const globalConfig = configs.find(c => c.resource_type === 'global' && !c.resource_id);
    const specificConfigs = configs.filter(c => !(c.resource_type === 'global' && !c.resource_id));

    return (
        <div className="space-y-6 page-enter page-enter-active">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Booking Rules</h1>
                    <p className="text-surface-500 mt-1">
                        Configure fairness limits, cooldowns, no-show penalties & waitlists
                    </p>
                </div>
                <button onClick={() => setModal({ open: true, data: null })}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors shadow-md shadow-primary-500/20">
                    <Plus className="w-4 h-4" /> New Override
                </button>
            </div>

            {/* Info Banner */}
            <div className="bg-primary-50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-800/30 rounded-2xl p-4 flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-semibold text-primary-700 dark:text-primary-400">How Rules Work</p>
                    <p className="text-xs text-primary-600 dark:text-primary-500 mt-0.5">
                        The global config applies to all bookings. You can create overrides for specific resource types (all spaces or all equipment) or for individual resources. More specific rules override general ones.
                    </p>
                </div>
            </div>

            {/* Global Config */}
            {globalConfig && (
                <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-surface-400 mb-3 flex items-center gap-2">
                        <Settings className="w-4 h-4" /> Global Defaults
                    </h2>
                    <ConfigCard config={globalConfig} onEdit={(c) => setModal({ open: true, data: c })} onDelete={handleDelete} />
                </div>
            )}

            {/* Specific Configs */}
            {specificConfigs.length > 0 && (
                <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-surface-400 mb-3 flex items-center gap-2">
                        <Sliders className="w-4 h-4" /> Resource Overrides
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {specificConfigs.map(config => (
                            <ConfigCard key={config.id} config={config} onEdit={(c) => setModal({ open: true, data: c })} onDelete={handleDelete} />
                        ))}
                    </div>
                </div>
            )}

            {specificConfigs.length === 0 && (
                <div className="text-center py-12 text-surface-400">
                    <Sliders className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No resource-specific overrides yet</p>
                    <p className="text-xs mt-1">All bookings use the global defaults above</p>
                </div>
            )}

            {/* Modal */}
            {modal.open && (
                <ConfigModal
                    config={modal.data}
                    onClose={() => setModal({ open: false, data: null })}
                    onSave={handleSave}
                />
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
