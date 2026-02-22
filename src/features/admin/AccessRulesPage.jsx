import { useState, useEffect } from 'react';
import api from '../../lib/api';
import {
    Shield, Clock, Plus, Edit2, Trash2, CheckCircle2,
    XCircle, ChevronDown, Crown, Calendar, Lock,
    Settings, DoorOpen, Wrench, AlertCircle
} from 'lucide-react';

const mockRules = [
    {
        id: 'r1', name: 'Standard Weekday Access', type: 'time_window',
        schedule: 'Mon–Fri, 8:00 AM – 8:00 PM',
        tiers: ['Basic', 'Professional'],
        rooms: ['Innovation Lab A', 'Focus Room 1', 'Focus Room 2', 'Brainstorm Pod'],
        active: true,
    },
    {
        id: 'r2', name: '24/7 Full Access', type: 'unrestricted',
        schedule: 'Always',
        tiers: ['Enterprise', 'VIP'],
        rooms: ['All Rooms'],
        active: true,
    },
    {
        id: 'r3', name: 'Workshop Hours Only', type: 'time_window',
        schedule: 'Mon–Sat, 9:00 AM – 6:00 PM',
        tiers: ['Basic'],
        rooms: ['Workshop Studio'],
        active: true,
    },
    {
        id: 'r4', name: 'Server Room Restricted', type: 'restricted',
        schedule: 'Admin Override Only',
        tiers: ['VIP'],
        rooms: ['Server Room'],
        active: true,
    },
    {
        id: 'r5', name: 'Holiday Lockdown', type: 'time_window',
        schedule: 'Dec 24–26, Closed',
        tiers: [],
        rooms: ['All Rooms'],
        active: false,
    },
];

const typeStyles = {
    time_window: { color: 'text-primary-500 bg-primary-500/10', label: 'Time Window', icon: Clock },
    unrestricted: { color: 'text-success-500 bg-success-500/10', label: 'Unrestricted', icon: CheckCircle2 },
    restricted: { color: 'text-danger-500 bg-danger-500/10', label: 'Restricted', icon: Lock },
};

function TierBadge({ name, tiers }) {
    const tier = tiers?.find(t => t.name === name);
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-surface-100 dark:bg-surface-700">
            <Crown className="w-3 h-3" style={{ color: tier?.color || '#64748b' }} />
            {name}
        </span>
    );
}

function RuleCard({ rule, onToggle, onDelete, onEdit, tiers }) {
    const [expanded, setExpanded] = useState(false);
    const typeInfo = typeStyles[rule.type] || typeStyles.time_window;
    const TypeIcon = typeInfo.icon;

    return (
        <div className={`bg-white dark:bg-surface-800/50 rounded-2xl border transition-all duration-300 hover:shadow-lg overflow-hidden
            ${rule.active ? 'border-surface-200 dark:border-surface-700/50' : 'border-dashed border-surface-300 dark:border-surface-600 opacity-60'}`}>
            <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeInfo.color}`}>
                            <TypeIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold">{rule.name}</h3>
                            <p className="text-xs text-surface-500 flex items-center gap-1 mt-0.5">
                                <Calendar className="w-3 h-3" /> {rule.schedule || 'No schedule set'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
                            {typeInfo.label}
                        </span>
                        <button
                            onClick={() => onToggle(rule.id)}
                            className={`relative w-10 h-6 rounded-full transition-colors ${rule.active ? 'bg-success-500' : 'bg-surface-300 dark:bg-surface-600'}`}>
                            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${rule.active ? 'left-[18px]' : 'left-0.5'}`} />
                        </button>
                    </div>
                </div>

                {/* Tier Tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                    {rule.tiers && rule.tiers.length > 0 ? rule.tiers.map(t => (
                        <TierBadge key={t} name={t} tiers={tiers} />
                    )) : (
                        <span className="text-xs text-surface-400 italic">No tiers assigned</span>
                    )}
                </div>

                {/* Rooms */}
                <div className="flex items-center gap-1.5 mt-2 text-xs text-surface-500">
                    <DoorOpen className="w-3 h-3" />
                    {rule.spaces && rule.spaces.length > 0 ? rule.spaces.join(', ') : 'No spaces assigned'}
                </div>
            </div>

            <button onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-center gap-1 py-2 text-xs text-surface-400 hover:text-surface-600 bg-surface-50 dark:bg-surface-800 border-t border-surface-200 dark:border-surface-700 transition-colors">
                <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                {expanded ? 'Less' : 'Actions'}
            </button>
            {expanded && (
                <div className="px-5 pb-4 flex gap-2 bg-surface-50/50 dark:bg-surface-800/30">
                    <button onClick={() => onEdit(rule)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 transition-colors">
                        <Edit2 className="w-3 h-3" /> Edit Rule
                    </button>
                    <button onClick={() => onDelete(rule.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-danger-50 dark:bg-danger-900/20 text-danger-500 hover:bg-danger-100 transition-colors">
                        <Trash2 className="w-3 h-3" /> Delete
                    </button>
                </div>
            )}
        </div>
    );
}

export default function AccessRulesPage() {
    const [rules, setRules] = useState([]);
    const [tiers, setTiers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showTiers, setShowTiers] = useState(false);
    const [toast, setToast] = useState(null);

    // Modal State
    const [tierModal, setTierModal] = useState({ open: false, data: null });
    const [ruleModal, setRuleModal] = useState({ open: false, data: null });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [rulesRes, tiersRes] = await Promise.all([
                api.get('/access/rules'),
                api.get('/memberships/tiers')
            ]);
            setRules(rulesRes.data);
            setTiers(tiersRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            showToast('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleRule = async (id) => {
        const rule = rules.find(r => r.id === id);
        try {
            await api.put(`/access/rules/${id}`, { active: !rule.active });
            setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
            showToast('Rule status updated');
        } catch (error) {
            showToast('Failed to update rule');
        }
    };

    const deleteRule = async (id) => {
        if (!window.confirm('Are you sure you want to delete this rule?')) return;
        try {
            await api.delete(`/access/rules/${id}`);
            setRules(prev => prev.filter(r => r.id !== id));
            showToast('Rule deleted');
        } catch (error) {
            showToast('Failed to delete rule');
        }
    };

    const handleSaveRule = async (data) => {
        try {
            if (data.id) {
                const res = await api.put(`/access/rules/${data.id}`, data);
                setRules(prev => prev.map(r => r.id === data.id ? res.data : r));
                showToast('Rule updated');
            } else {
                const res = await api.post('/access/rules', data);
                setRules(prev => [res.data, ...prev]);
                showToast('Rule created');
            }
            setRuleModal({ open: false, data: null });
        } catch (error) {
            showToast('Failed to save rule');
        }
    };

    const handleSaveTier = async (data) => {
        try {
            if (data.id) {
                const res = await api.put(`/memberships/tiers/${data.id}`, data);
                setTiers(prev => prev.map(t => t.id === data.id ? res.data : t));
                showToast('Tier updated');
            } else {
                const res = await api.post('/memberships/tiers', data);
                setTiers(prev => [...prev, res.data]);
                showToast('Tier created');
            }
            setTierModal({ open: false, data: null });
        } catch (error) {
            showToast('Failed to save tier');
        }
    };

    const activeRulesCount = rules.filter(r => r.active).length;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-surface-500 animate-pulse">Loading access policies...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 page-enter page-enter-active">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Access Rules & Tiers</h1>
                    <p className="text-surface-500 mt-1">{activeRulesCount} active rules • {tiers.length} membership tiers</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowTiers(!showTiers)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm font-medium hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors">
                        <Crown className="w-4 h-4" /> Manage Tiers
                    </button>
                    <button onClick={() => setRuleModal({ open: true, data: null })}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors shadow-md shadow-primary-500/20">
                        <Plus className="w-4 h-4" /> New Rule
                    </button>
                </div>
            </div>

            {/* Tier Management Panel */}
            {showTiers && (
                <div className="bg-white dark:bg-surface-800/50 rounded-2xl p-5 border border-surface-200 dark:border-surface-700/50">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold flex items-center gap-2">
                            <Crown className="w-5 h-5 text-warning-500" /> Membership Tiers
                        </h2>
                        <button onClick={() => setTierModal({ open: true, data: null })}
                            className="text-xs font-medium text-primary-500 hover:text-primary-600 flex items-center gap-1">
                            <Plus className="w-3 h-3" /> New Tier
                        </button>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {tiers.map(tier => (
                            <div key={tier.id} className="rounded-xl border border-surface-200 dark:border-surface-700 p-4 hover:shadow-md transition-all">
                                <div className="flex items-center gap-2 mb-3">
                                    <Crown className="w-5 h-5" style={{ color: tier.color }} />
                                    <h3 className="font-semibold">{tier.name}</h3>
                                </div>
                                <div className="space-y-2 text-xs text-surface-500">
                                    <div className="flex justify-between">
                                        <span>Price</span>
                                        <span className="font-semibold text-surface-900 dark:text-white">₦{tier.price}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Max Booking Hours</span>
                                        <span className="font-semibold text-surface-900 dark:text-white">{tier.max_booking_hours === -1 ? 'Unlimited' : `${tier.max_booking_hours}h`}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Max Rooms</span>
                                        <span className="font-semibold text-surface-900 dark:text-white">{tier.max_rooms === -1 ? 'All' : tier.max_rooms}</span>
                                    </div>
                                </div>
                                <button onClick={() => setTierModal({ open: true, data: tier })}
                                    className="mt-3 w-full py-1.5 rounded-lg text-xs font-medium bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors">
                                    Edit Tier
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Rules List */}
            <div className="grid md:grid-cols-2 gap-4">
                {rules.map(rule => (
                    <RuleCard key={rule.id} rule={rule} onToggle={toggleRule} onDelete={deleteRule} onEdit={(r) => setRuleModal({ open: true, data: r })} tiers={tiers} />
                ))}
            </div>

            {/* Modal - Rule */}
            {ruleModal.open && (
                <RuleModal
                    rule={ruleModal.data}
                    tiers={tiers}
                    onClose={() => setRuleModal({ open: false, data: null })}
                    onSave={handleSaveRule}
                />
            )}

            {/* Modal - Tier */}
            {tierModal.open && (
                <TierModal
                    tier={tierModal.data}
                    onClose={() => setTierModal({ open: false, data: null })}
                    onSave={handleSaveTier}
                />
            )}

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 bg-surface-900 dark:bg-surface-100 text-white dark:text-surface-900 px-6 py-3 rounded-xl shadow-2xl text-sm font-medium">
                    Success: {toast}
                </div>
            )}
        </div>
    );
}

function RuleModal({ rule, tiers, onClose, onSave }) {
    const [formData, setFormData] = useState(rule || {
        name: '',
        type: 'time_window',
        schedule: '',
        tiers: [],
        spaces: [],
        active: true
    });

    const isEdit = !!rule;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-surface-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white dark:bg-surface-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-surface-100 dark:border-surface-700">
                    <h2 className="text-xl font-bold">{isEdit ? 'Edit Access Rule' : 'New Access Rule'}</h2>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5 ml-1">Rule Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-900 border-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                            placeholder="e.g. Standard Weekday Access"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5 ml-1">Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-900 border-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                            >
                                <option value="time_window">Time Window</option>
                                <option value="unrestricted">Unrestricted</option>
                                <option value="restricted">Restricted</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5 ml-1">Schedule</label>
                            <input
                                type="text"
                                value={formData.schedule}
                                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-900 border-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                placeholder="e.g. Mon–Fri, 8AM–8PM"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5 ml-1">Allowed Tiers (comma separated)</label>
                        <input
                            type="text"
                            value={formData.tiers.join(', ')}
                            onChange={(e) => setFormData({ ...formData, tiers: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                            className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-900 border-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-sm"
                            placeholder="Basic, Professional"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5 ml-1">Target Spaces (comma separated)</label>
                        <input
                            type="text"
                            value={formData.spaces.join(', ')}
                            onChange={(e) => setFormData({ ...formData, spaces: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                            className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-900 border-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-sm"
                            placeholder="Innovation Lab A, Focus Room 1"
                        />
                    </div>
                </div>
                <div className="p-6 bg-surface-50 dark:bg-surface-900/50 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl font-semibold text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                        Cancel
                    </button>
                    <button onClick={() => onSave(formData)} className="flex-[2] py-3 rounded-xl font-semibold bg-primary-500 text-white hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/20">
                        {isEdit ? 'Update Rule' : 'Create Rule'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function TierModal({ tier, onClose, onSave }) {
    const [formData, setFormData] = useState(tier || {
        name: '',
        price: '',
        color: '#6366f1',
        max_booking_hours: 8,
        max_rooms: 2,
        priority_booking: false,
        peak_access: false
    });

    const isEdit = !!tier;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-surface-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white dark:bg-surface-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-surface-100 dark:border-surface-700">
                    <h2 className="text-xl font-bold">{isEdit ? 'Edit Membership Tier' : 'New Membership Tier'}</h2>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5 ml-1">Tier Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-900 border-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                placeholder="Basic"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5 ml-1">Color (Hex)</label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    className="w-12 h-12 rounded-xl overflow-hidden border-none p-0 cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    className="flex-1 px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-900 border-none focus:ring-2 focus:ring-primary-500 transition-all font-mono"
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5 ml-1">Monthly Price (₦)</label>
                        <input
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-900 border-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                            placeholder="0"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5 ml-1">Max Booking Hours</label>
                            <input
                                type="number"
                                value={formData.max_booking_hours}
                                onChange={(e) => setFormData({ ...formData, max_booking_hours: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-900 border-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                placeholder="-1 for unlimited"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5 ml-1">Max Spaces</label>
                            <input
                                type="number"
                                value={formData.max_rooms}
                                onChange={(e) => setFormData({ ...formData, max_rooms: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-900 border-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                                placeholder="-1 for all"
                            />
                        </div>
                    </div>
                    <div className="flex gap-4 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.priority_booking}
                                onChange={(e) => setFormData({ ...formData, priority_booking: e.target.checked })}
                                className="w-5 h-5 rounded border-surface-300 text-primary-500 focus:ring-primary-500"
                            />
                            <span className="text-sm font-medium">Priority Booking</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.peak_access}
                                onChange={(e) => setFormData({ ...formData, peak_access: e.target.checked })}
                                className="w-5 h-5 rounded border-surface-300 text-primary-500 focus:ring-primary-500"
                            />
                            <span className="text-sm font-medium">Peak Access</span>
                        </label>
                    </div>
                </div>
                <div className="p-6 bg-surface-50 dark:bg-surface-900/50 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl font-semibold text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                        Cancel
                    </button>
                    <button onClick={() => onSave(formData)} className="flex-[2] py-3 rounded-xl font-semibold bg-primary-500 text-white hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/20">
                        {isEdit ? 'Update Tier' : 'Create Tier'}
                    </button>
                </div>
            </div>
        </div>
    );
}

