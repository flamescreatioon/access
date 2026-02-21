import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { ROLES } from '../../lib/mockData';
import {
    LayoutDashboard, CreditCard, CalendarDays, Activity,
    Crown, Users, Shield, MonitorSmartphone, BookOpen,
    UserCheck, UserPlus, Settings, LogOut, Zap,
    ScanLine, Smartphone, History
} from 'lucide-react';

const memberNav = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/access-card', label: 'My Access Card', icon: CreditCard },
    { to: '/bookings', label: 'Bookings', icon: CalendarDays },
    { to: '/activity', label: 'Activity', icon: Activity },
    { to: '/membership', label: 'Membership', icon: Crown },
];

const hubManagerNav = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/scanner', label: 'Scanner', icon: ScanLine },
    { to: '/scan-history', label: 'Scan History', icon: History },
    { to: '/device-setup', label: 'Device Setup', icon: Smartphone },
    { to: '/members', label: 'Members', icon: Users },
    { to: '/logs', label: 'Logs', icon: Activity },
    { to: '/bookings', label: 'Bookings', icon: CalendarDays },
    { to: '/visitors', label: 'Visitors', icon: UserCheck },
];

const adminNav = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/scanner', label: 'Scanner', icon: ScanLine },
    { to: '/members', label: 'Members', icon: Users },
    { to: '/users', label: 'Users', icon: UserPlus },
    { to: '/access-rules', label: 'Access Rules', icon: Shield },
    { to: '/logs', label: 'Logs', icon: Activity },
    { to: '/devices', label: 'Devices', icon: MonitorSmartphone },
    { to: '/bookings', label: 'Bookings', icon: CalendarDays },
    { to: '/visitors', label: 'Visitors', icon: UserCheck },
];

export default function Sidebar({ collapsed, onToggle }) {
    const { user, logout } = useAuthStore();
    const navItems = user?.role === ROLES.ADMIN ? adminNav
        : user?.role === ROLES.HUB_MANAGER ? hubManagerNav
            : memberNav;

    return (
        <aside className={`hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-40 transition-all duration-300 border-r border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900
      ${collapsed ? 'w-[68px]' : 'w-[260px]'}`}>

            {/* Logo */}
            <div className="flex items-center gap-3 px-4 h-16 border-b border-surface-200 dark:border-surface-800">
                <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-white" />
                </div>
                {!collapsed && <span className="font-bold text-lg tracking-tight text-primary-600">HubAccess</span>}
            </div>

            {/* Nav Items */}
            <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
                {navItems.map(item => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
              ${isActive
                                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-sm'
                                : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100'}`
                        }>
                        <item.icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110`} />
                        {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* User Section */}
            <div className="p-3 border-t border-surface-200 dark:border-surface-800">
                <NavLink
                    to="/profile"
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                    <img src={user?.avatar} alt="" className="w-8 h-8 rounded-full bg-surface-200" />
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-surface-900 dark:text-surface-100 truncate">{user?.name}</p>
                            <p className="text-xs text-surface-500 capitalize">{user?.role}</p>
                        </div>
                    )}
                </NavLink>
                <button
                    onClick={logout}
                    className="mt-1 flex items-center gap-3 px-3 py-2 w-full rounded-xl text-sm text-danger-500 hover:bg-danger-500/10 transition-colors">
                    <LogOut className="w-5 h-5 shrink-0" />
                    {!collapsed && <span>Sign Out</span>}
                </button>
            </div>
        </aside>
    );
}
