import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { ROLES } from '../../lib/mockData';
import {
    LayoutDashboard, CreditCard, CalendarDays, Activity, Crown,
    Users, Shield, MonitorSmartphone, UserCheck, UserPlus,
    ScanLine, Smartphone, History,
    MoreHorizontal, X, LogOut, User
} from 'lucide-react';

const memberNav = [
    { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { to: '/access-card', label: 'Access', icon: CreditCard },
    { to: '/bookings', label: 'Bookings', icon: CalendarDays },
    { to: '/activity', label: 'Activity', icon: Activity },
    { to: '/membership', label: 'Plan', icon: Crown },
];

// Hub Manager: scanner-first experience
const hmPrimary = [
    { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { to: '/scanner', label: 'Scanner', icon: ScanLine },
    { to: '/scan-history', label: 'History', icon: History },
    { to: '/members', label: 'Members', icon: Users },
];
const hmMore = [
    { to: '/device-setup', label: 'Device Setup', icon: Smartphone },
    { to: '/logs', label: 'Logs', icon: Activity },
    { to: '/bookings', label: 'Bookings', icon: CalendarDays },
    { to: '/visitors', label: 'Visitors', icon: UserCheck },
    { to: '/profile', label: 'Profile', icon: User },
];

// Admin: management-first + scanner
const adminPrimary = [
    { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { to: '/scanner', label: 'Scanner', icon: ScanLine },
    { to: '/members', label: 'Members', icon: Users },
    { to: '/logs', label: 'Logs', icon: Activity },
];
const adminMore = [
    { to: '/users', label: 'Users', icon: UserPlus },
    { to: '/access-rules', label: 'Access Rules', icon: Shield },
    { to: '/devices', label: 'Devices', icon: MonitorSmartphone },
    { to: '/scan-history', label: 'Scan History', icon: History },
    { to: '/bookings', label: 'Bookings', icon: CalendarDays },
    { to: '/visitors', label: 'Visitors', icon: UserCheck },
    { to: '/profile', label: 'Profile', icon: User },
];

function NavItem({ item, onClick }) {
    return (
        <NavLink to={item.to} onClick={onClick}
            className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl text-xs font-medium transition-all
                ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-surface-400 dark:text-surface-500'}`
            }>
            {({ isActive }) => (
                <>
                    <div className={`p-1 rounded-lg transition-colors ${isActive ? 'bg-primary-100 dark:bg-primary-900/40' : ''}`}>
                        <item.icon className="w-5 h-5" />
                    </div>
                    <span>{item.label}</span>
                </>
            )}
        </NavLink>
    );
}

export default function MobileNav() {
    const { user, logout } = useAuthStore();
    const [moreOpen, setMoreOpen] = useState(false);

    // Member nav — simple bottom bar
    if (user?.role === ROLES.MEMBER || (!user?.role)) {
        return (
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-surface-900/90 backdrop-blur-xl border-t border-surface-200 dark:border-surface-800 safe-area-bottom">
                <div className="flex items-center justify-around h-16 px-1">
                    {memberNav.map(item => <NavItem key={item.to} item={item} />)}
                </div>
            </nav>
        );
    }

    // Admin or Hub Manager — primary bar + "More" menu
    const primaryItems = user?.role === ROLES.ADMIN ? adminPrimary : hmPrimary;
    const moreItems = user?.role === ROLES.ADMIN ? adminMore : hmMore;

    return (
        <>
            {moreOpen && (
                <div className="md:hidden fixed inset-0 z-[60]">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMoreOpen(false)} />
                    <div className="absolute bottom-20 left-4 right-4 bg-white dark:bg-surface-800 rounded-2xl shadow-2xl border border-surface-200 dark:border-surface-700 p-3 animate-in slide-in-from-bottom-4">
                        <div className="grid grid-cols-3 gap-1">
                            {moreItems.map(item => (
                                <NavLink key={item.to} to={item.to} onClick={() => setMoreOpen(false)}
                                    className={({ isActive }) =>
                                        `flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-xs font-medium transition-all
                                        ${isActive ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-700'}`
                                    }>
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                </NavLink>
                            ))}
                            <button onClick={() => { logout(); setMoreOpen(false); }}
                                className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-xs font-medium text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-all">
                                <LogOut className="w-5 h-5" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-surface-900/90 backdrop-blur-xl border-t border-surface-200 dark:border-surface-800 safe-area-bottom">
                <div className="flex items-center justify-around h-16 px-1">
                    {primaryItems.map(item => <NavItem key={item.to} item={item} onClick={() => setMoreOpen(false)} />)}
                    <button onClick={() => setMoreOpen(!moreOpen)}
                        className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl text-xs font-medium transition-all
                        ${moreOpen ? 'text-primary-600 dark:text-primary-400' : 'text-surface-400 dark:text-surface-500'}`}>
                        <div className={`p-1 rounded-lg transition-colors ${moreOpen ? 'bg-primary-100 dark:bg-primary-900/40' : ''}`}>
                            {moreOpen ? <X className="w-5 h-5" /> : <MoreHorizontal className="w-5 h-5" />}
                        </div>
                        <span>More</span>
                    </button>
                </div>
            </nav>
        </>
    );
}
