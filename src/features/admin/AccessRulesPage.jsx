import { useState } from 'react';
import { MEMBERSHIP_TIERS, ROOMS, EQUIPMENT } from '../../lib/mockData';
import {
    Shield, Clock, Plus, Edit2, Trash2, CheckCircle2,
    XCircle, ChevronDown, Crown, Calendar, Lock,
    Settings, DoorOpen, Wrench
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

function TierBadge({ name }) {
    const tier = MEMBERSHIP_TIERS.find(t => t.name === name);
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-surface-100 dark:bg-surface-700">
            <Crown className="w-3 h-3" style={{ color: tier?.color || '#64748b' }} />
            {name}
        </span>
    );
}

function RuleCard({ rule, onToggle, onDelete }) {
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
                                <Calendar className="w-3 h-3" /> {rule.schedule}
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
                    {rule.tiers.length > 0 ? rule.tiers.map(t => (
                        <TierBadge key={t} name={t} />
                    )) : (
                        <span className="text-xs text-surface-400 italic">No tiers assigned</span>
                    )}
                </div>

                {/* Rooms */}
                <div className="flex items-center gap-1.5 mt-2 text-xs text-surface-500">
                    <DoorOpen className="w-3 h-3" />
                    {rule.rooms.join(', ')}
                </div>
            </div>

            <button onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-center gap-1 py-2 text-xs text-surface-400 hover:text-surface-600 bg-surface-50 dark:bg-surface-800 border-t border-surface-200 dark:border-surface-700 transition-colors">
                <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                {expanded ? 'Less' : 'Actions'}
            </button>
            {expanded && (
                <div className="px-5 pb-4 flex gap-2 bg-surface-50/50 dark:bg-surface-800/30">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 transition-colors">
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
    const [rules, setRules] = useState(mockRules);
    const [showTiers, setShowTiers] = useState(false);
    const [toast, setToast] = useState(null);

    const toggleRule = (id) => {
        setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
    };

    const deleteRule = (id) => {
        setRules(prev => prev.filter(r => r.id !== id));
        setToast('Rule deleted');
        setTimeout(() => setToast(null), 3000);
    };

    const activeRules = rules.filter(r => r.active).length;

    return (
        <div className="space-y-6 page-enter page-enter-active">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Access Rules & Tiers</h1>
                    <p className="text-surface-500 mt-1">{activeRules} active rules • {MEMBERSHIP_TIERS.length} membership tiers</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowTiers(!showTiers)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm font-medium hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors">
                        <Crown className="w-4 h-4" /> Manage Tiers
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors shadow-md shadow-primary-500/20">
                        <Plus className="w-4 h-4" /> New Rule
                    </button>
                </div>
            </div>

            {/* Tier Management Panel */}
            {showTiers && (
                <div className="bg-white dark:bg-surface-800/50 rounded-2xl p-5 border border-surface-200 dark:border-surface-700/50">
                    <h2 className="font-semibold mb-4 flex items-center gap-2">
                        <Crown className="w-5 h-5 text-warning-500" /> Membership Tiers
                    </h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {MEMBERSHIP_TIERS.map(tier => (
                            <div key={tier.id} className="rounded-xl border border-surface-200 dark:border-surface-700 p-4 hover:shadow-md transition-all">
                                <div className="flex items-center gap-2 mb-3">
                                    <Crown className="w-5 h-5" style={{ color: tier.color }} />
                                    <h3 className="font-semibold">{tier.name}</h3>
                                </div>
                                <div className="space-y-2 text-xs text-surface-500">
                                    <div className="flex justify-between">
                                        <span>Price</span>
                                        <span className="font-semibold text-surface-900 dark:text-white">${tier.price}/mo</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Max Booking Hours</span>
                                        <span className="font-semibold text-surface-900 dark:text-white">{tier.maxBookingHours === -1 ? 'Unlimited' : `${tier.maxBookingHours}h`}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Max Rooms</span>
                                        <span className="font-semibold text-surface-900 dark:text-white">{tier.maxRooms === -1 ? 'All' : tier.maxRooms}</span>
                                    </div>
                                </div>
                                <button className="mt-3 w-full py-1.5 rounded-lg text-xs font-medium bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors">
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
                    <RuleCard key={rule.id} rule={rule} onToggle={toggleRule} onDelete={deleteRule} />
                ))}
            </div>

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 bg-surface-900 dark:bg-surface-100 text-white dark:text-surface-900 px-6 py-3 rounded-xl shadow-2xl text-sm font-medium">
                    ✓ {toast}
                </div>
            )}
        </div>
    );
}
