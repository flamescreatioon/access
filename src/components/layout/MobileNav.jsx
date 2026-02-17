import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { ROLES } from '../../lib/mockData';
import {
    LayoutDashboard, CreditCard, CalendarDays, Activity, Crown, Users, Shield, UserCheck
} from 'lucide-react';

const memberNav = [
    { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { to: '/access-card', label: 'Access', icon: CreditCard },
    { to: '/bookings', label: 'Bookings', icon: CalendarDays },
    { to: '/activity', label: 'Activity', icon: Activity },
    { to: '/membership', label: 'Plan', icon: Crown },
];

const adminNav = [
    { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { to: '/members', label: 'Members', icon: Users },
    { to: '/logs', label: 'Logs', icon: Activity },
    { to: '/bookings', label: 'Bookings', icon: CalendarDays },
    { to: '/visitors', label: 'Visitors', icon: UserCheck },
];

export default function MobileNav() {
    const { user } = useAuthStore();
    const isAdmin = user?.role === ROLES.ADMIN || user?.role === ROLES.HUB_MANAGER;
    const navItems = isAdmin ? adminNav : memberNav;

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-surface-900/90 backdrop-blur-xl border-t border-surface-200 dark:border-surface-800 safe-area-bottom">
            <div className="flex items-center justify-around h-16 px-1">
                {navItems.map(item => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl text-xs font-medium transition-all
              ${isActive
                                ? 'text-primary-600 dark:text-primary-400'
                                : 'text-surface-400 dark:text-surface-500'}`
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
                ))}
            </div>
        </nav>
    );
}
