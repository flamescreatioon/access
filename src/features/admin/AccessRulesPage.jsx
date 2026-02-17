import { Shield, MonitorSmartphone, Settings } from 'lucide-react';

export default function AccessRulesPage() {
    const rules = [
        { id: 1, name: 'Main Entrance', type: 'entry', schedule: '24/7', tiers: ['Basic', 'Pro', 'Enterprise', 'VIP'], status: 'enabled' },
        { id: 2, name: 'Workshop Studio', type: 'room', schedule: '8AM - 10PM', tiers: ['Pro', 'Enterprise', 'VIP'], status: 'enabled' },
        { id: 3, name: 'Recording Studio', type: 'room', schedule: '9AM - 8PM', tiers: ['Enterprise', 'VIP'], status: 'enabled' },
        { id: 4, name: 'Equipment Room', type: 'access', schedule: '8AM - 6PM', tiers: ['Pro', 'Enterprise', 'VIP'], status: 'enabled' },
        { id: 5, name: 'After Hours Access', type: 'entry', schedule: '10PM - 8AM', tiers: ['VIP'], status: 'enabled' },
        { id: 6, name: 'Conference Hall', type: 'room', schedule: '8AM - 10PM', tiers: ['Basic', 'Pro', 'Enterprise', 'VIP'], status: 'disabled' },
    ];

    return (
        <div className="space-y-6 page-enter page-enter-active">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">Access Rules</h1>
                <p className="text-surface-500 mt-1">Configure access policies and schedules</p>
            </div>
            <div className="space-y-3">
                {rules.map(rule => (
                    <div key={rule.id} className="bg-white dark:bg-surface-800/50 rounded-2xl p-5 border border-surface-200 dark:border-surface-700/50 hover:shadow-lg transition-all">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-primary-500" />
                                </div>
                                <div>
                                    <p className="font-semibold">{rule.name}</p>
                                    <p className="text-sm text-surface-500">🕐 {rule.schedule} • {rule.type}</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize
                ${rule.status === 'enabled' ? 'bg-success-100 dark:bg-success-900/20 text-success-600' : 'bg-surface-100 dark:bg-surface-700 text-surface-500'}`}>
                                {rule.status}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                            {rule.tiers.map(t => (
                                <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-accent-50 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400">{t}</span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
