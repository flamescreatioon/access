import { useAuthStore } from '../../stores/authStore';
import { User, Mail, Shield, Calendar, Settings, LogOut, Bell, Lock, Smartphone } from 'lucide-react';
import { format } from 'date-fns';

export default function ProfilePage() {
    const { user, logout } = useAuthStore();

    return (
        <div className="max-w-2xl mx-auto space-y-6 page-enter page-enter-active">
            <h1 className="text-2xl md:text-3xl font-bold">Profile</h1>

            {/* Profile Card */}
            <div className="bg-white dark:bg-surface-800/50 rounded-2xl border border-surface-200 dark:border-surface-700/50 overflow-hidden">
                <div className="h-24 bg-gradient-to-r from-primary-500 to-accent-500" />
                <div className="px-6 pb-6">
                    <div className="flex items-end gap-4 -mt-10">
                        <img src={user?.avatar} alt="" className="w-20 h-20 rounded-2xl border-4 border-white dark:border-surface-800 bg-surface-200" />
                        <div className="pb-1">
                            <h2 className="text-xl font-bold">{user?.firstName} {user?.lastName}</h2>
                            <p className="text-sm text-surface-500 capitalize">{user?.role?.replace('_', ' ')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info */}
            <div className="bg-white dark:bg-surface-800/50 rounded-2xl p-5 border border-surface-200 dark:border-surface-700/50 space-y-4">
                <h3 className="font-semibold">Account Information</h3>
                <div className="grid gap-4">
                    {[
                        { icon: Mail, label: 'Email', value: user?.email },
                        { icon: Shield, label: 'Role', value: user?.role?.replace('_', ' ') },
                        { icon: User, label: 'User ID', value: user?.id },
                    ].map(item => (
                        <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-800">
                            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                <item.icon className="w-5 h-5 text-primary-500" />
                            </div>
                            <div>
                                <p className="text-xs text-surface-500">{item.label}</p>
                                <p className="font-medium text-sm capitalize">{item.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Settings */}
            <div className="bg-white dark:bg-surface-800/50 rounded-2xl border border-surface-200 dark:border-surface-700/50">
                <h3 className="font-semibold px-5 pt-5 pb-2">Settings</h3>
                {[
                    { icon: Bell, label: 'Notifications', desc: 'Push & email preferences' },
                    { icon: Lock, label: 'Security', desc: 'Password & 2FA settings' },
                    { icon: Smartphone, label: 'Devices', desc: 'Manage logged-in devices' },
                ].map(item => (
                    <button key={item.label} className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors border-t border-surface-100 dark:border-surface-700/50 text-left">
                        <div className="w-9 h-9 rounded-lg bg-surface-100 dark:bg-surface-700 flex items-center justify-center">
                            <item.icon className="w-4 h-4 text-surface-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">{item.label}</p>
                            <p className="text-xs text-surface-500">{item.desc}</p>
                        </div>
                    </button>
                ))}
            </div>

            {/* Sign Out */}
            <button onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-danger-200 dark:border-danger-800 text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors font-medium text-sm">
                <LogOut className="w-4 h-4" /> Sign Out
            </button>
        </div>
    );
}
