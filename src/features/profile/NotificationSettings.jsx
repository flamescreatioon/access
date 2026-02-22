import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { useSecurityStore } from '../../stores/securityStore';
import {
    Bell, Smartphone, Mail, Shield, Calendar,
    Lock, Unlock, Zap, CheckCircle2, AlertTriangle, Info,
    ChevronRight, Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function NotificationSettings() {
    const { user, updateUser } = useAuthStore();
    const { updateSettings } = useSecurityStore();
    const {
        pushStatus, isPushSupported,
        requestPushPermission, unsubscribeFromPush
    } = useNotificationStore();

    const [saving, setSaving] = useState(false);

    const notificationSettings = user.settings?.notifications || {
        push: true,
        email: true,
        types: {
            booking: true,
            access: true,
            security: true,
            system: true,
            membership: true
        }
    };

    const toggleMainChannel = async (channel) => {
        const value = !notificationSettings[channel];
        await handleUpdate({ ...notificationSettings, [channel]: value });
    };

    const toggleType = async (type) => {
        const newTypes = {
            ...notificationSettings.types,
            [type]: !notificationSettings.types?.[type]
        };
        await handleUpdate({ ...notificationSettings, types: newTypes });
    };

    const handleUpdate = async (newNotificationSettings) => {
        setSaving(true);
        const newSettings = {
            ...user.settings,
            notifications: newNotificationSettings
        };

        const res = await updateSettings(newSettings);
        if (res) {
            updateUser({ settings: newSettings });
            toast.success('Preferences synced');
        } else {
            toast.error('Failed to sync preferences');
        }
        setSaving(false);
    };

    const handlePushToggle = async () => {
        if (pushStatus === 'granted') {
            const ok = await unsubscribeFromPush();
            if (ok) toast.success('Push disabled for this device');
        } else {
            const ok = await requestPushPermission();
            if (ok) toast.success('Push enabled for this device');
            else toast.error('Check browser permissions');
        }
    };

    const sections = [
        {
            title: 'Master Channels',
            items: [
                { id: 'push', icon: Smartphone, label: 'Browser Push', desc: 'Desktop and Mobile system alerts.', color: 'text-primary-500' },
                { id: 'email', icon: Mail, label: 'Email Digest', desc: 'Activity summaries and invoices.', color: 'text-indigo-500' },
            ]
        },
        {
            title: 'Event Alerts',
            items: [
                { id: 'booking', icon: Calendar, label: 'Reservations', desc: 'Confirmations, changes, and reminders.', color: 'text-success-500' },
                { id: 'access', icon: Unlock, label: 'Access Events', desc: 'Check-ins and restricted area alerts.', color: 'text-warning-500' },
                { id: 'security', icon: Shield, label: 'Identity Security', desc: 'Login alerts and password changes.', color: 'text-danger-500' },
                { id: 'membership', icon: Zap, label: 'Membership', desc: 'Renewals, billing, and tier changes.', color: 'text-primary-500' },
                { id: 'system', icon: Info, label: 'Hub Intelligence', desc: 'Platform updates and maintenance.', color: 'text-surface-400' },
            ]
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Push Permission Banner */}
            {isPushSupported && (
                <div className={`p-6 rounded-[2rem] border-2 transition-all ${pushStatus === 'granted'
                    ? 'bg-success-500/5 border-success-500/10'
                    : 'bg-primary-500/5 border-primary-500/10'
                    }`}>
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${pushStatus === 'granted' ? 'bg-success-500 text-white shadow-success-500/20' : 'bg-primary-500 text-white shadow-primary-500/20'
                            }`}>
                            <Smartphone className="w-8 h-8" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h4 className="text-xl font-black tracking-tight capitalize">
                                {pushStatus === 'granted' ? 'System Alerts Active' : 'Enable Mobile Experience'}
                            </h4>
                            <p className="text-xs font-bold text-surface-500 mt-1 uppercase tracking-wider">
                                {pushStatus === 'granted'
                                    ? 'This device is receiving high-priority hub signals.'
                                    : 'Recieve real-time push alerts even when the browser is closed.'}
                            </p>
                        </div>
                        <button
                            onClick={handlePushToggle}
                            className={`px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl ${pushStatus === 'granted'
                                ? 'bg-white dark:bg-surface-800 text-danger-500 border border-danger-500/10 hover:bg-danger-500/5 shadow-danger-500/5'
                                : 'bg-primary-500 text-white hover:scale-105 shadow-primary-500/20'
                                }`}
                        >
                            {pushStatus === 'granted' ? 'Disable Device Push' : 'Activate Intelligence'}
                        </button>
                    </div>
                </div>
            )}

            {sections.map((section, idx) => (
                <div key={idx} className="bg-white dark:bg-surface-800/50 rounded-[3rem] p-8 border border-surface-200 dark:border-surface-700/50">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-surface-400 mb-8 px-2 flex items-center gap-3">
                        <Settings className="w-4 h-4" /> {section.title}
                    </h3>

                    <div className="grid gap-4">
                        {section.items.map((item) => {
                            const isType = section.title === 'Event Alerts';
                            const active = isType
                                ? notificationSettings.types?.[item.id] !== false
                                : notificationSettings[item.id] !== false;

                            return (
                                <div key={item.id} className="group flex items-center justify-between p-5 rounded-[2rem] bg-surface-50 dark:bg-surface-900/30 border border-surface-100 dark:border-surface-800 hover:border-primary-500/20 transition-all">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center transition-all ${active ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'bg-surface-200 dark:bg-surface-800 text-surface-400 opacity-50'
                                            }`}>
                                            <item.icon className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-black text-lg tracking-tight">{item.label}</h4>
                                                {active && <div className="w-1.5 h-1.5 rounded-full bg-success-500 shadow-sm shadow-success-500/50" />}
                                            </div>
                                            <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest leading-tight mt-0.5">{item.desc}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => isType ? toggleType(item.id) : toggleMainChannel(item.id)}
                                        disabled={saving}
                                        className={`w-14 h-8 rounded-full relative transition-all duration-300 ${active ? 'bg-primary-500 shadow-lg shadow-primary-500/10' : 'bg-surface-200 dark:bg-surface-700'}`}
                                    >
                                        <div className={`absolute top-1.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${active ? 'right-1.5' : 'left-1.5'}`} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            <div className="p-8 bg-warning-500/5 border border-warning-500/10 rounded-[2.5rem] flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-warning-500 shrink-0 mt-1" />
                <div>
                    <h4 className="font-black text-sm tracking-tight">Intelligence Latency</h4>
                    <p className="text-xs font-medium text-surface-500 mt-1">
                        Disabling notifications might lead to delayed awareness of critical hub events, including security breaches or booking expirations.
                    </p>
                </div>
            </div>
        </div>
    );
}
