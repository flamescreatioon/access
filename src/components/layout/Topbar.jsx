import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../../stores/themeStore';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { Sun, Moon, Bell, Menu, X, Search, LogOut, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Topbar({ onMenuToggle, menuOpen }) {
    const { dark, toggle } = useThemeStore();
    const { user, logout } = useAuthStore();
    const { notifications, unreadCount, markAsRead, markAllRead } = useNotificationStore();
    const [showNotif, setShowNotif] = useState(false);
    const [showUser, setShowUser] = useState(false);
    const notifRef = useRef(null);
    const userRef = useRef(null);
    const navigate = useNavigate();
    const unread = unreadCount;

    useEffect(() => {
        const handleClick = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
            if (userRef.current && !userRef.current.contains(e.target)) setShowUser(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const typeColors = {
        warning: 'bg-warning-400', info: 'bg-primary-400', success: 'bg-success-400', error: 'bg-danger-400',
    };

    return (
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 md:px-6 bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-b border-surface-200 dark:border-surface-800">
            {/* Left */}
            <div className="flex items-center gap-3">
                <button onClick={onMenuToggle} className="md:hidden p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                    {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
                <div className="hidden md:flex items-center gap-2 bg-surface-100 dark:bg-surface-800 rounded-xl px-3 py-2 w-64">
                    <Search className="w-4 h-4 text-surface-400" />
                    <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm w-full placeholder:text-surface-400" />
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
                <button onClick={toggle} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors" title="Toggle theme">
                    {dark ? <Sun className="w-5 h-5 text-warning-400" /> : <Moon className="w-5 h-5 text-surface-500" />}
                </button>

                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                    <button onClick={() => setShowNotif(!showNotif)} className="relative p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                        <Bell className="w-5 h-5" />
                        {unread > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-danger-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center pulse-dot">
                                {unread}
                            </span>
                        )}
                    </button>

                    {showNotif && (
                        <div className="absolute right-0 top-12 w-80 md:w-96 bg-white dark:bg-surface-800 rounded-2xl shadow-2xl border border-surface-200 dark:border-surface-700 overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-200 dark:border-surface-700">
                                <h3 className="font-semibold text-sm">Notifications</h3>
                                {unread > 0 && (
                                    <button onClick={markAllRead} className="text-xs text-primary-500 hover:text-primary-600 font-medium">Mark all read</button>
                                )}
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <p className="p-4 text-sm text-surface-500 text-center">No notifications</p>
                                ) : (
                                    notifications.slice(0, 8).map(n => (
                                        <button
                                            key={n.id}
                                            onClick={() => { markAsRead(n.id); }}
                                            className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors border-b border-surface-100 dark:border-surface-700/50
                        ${!n.read ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}>
                                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${typeColors[n.type]}`} />
                                            <div className="min-w-0">
                                                <p className={`text-sm ${!n.read ? 'font-semibold' : 'font-medium'}`}>{n.title}</p>
                                                <p className="text-xs text-surface-500 mt-0.5 line-clamp-2">{n.body}</p>
                                                <p className="text-xs text-surface-400 mt-1">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* User Menu */}
                <div className="relative hidden md:block" ref={userRef}>
                    <button onClick={() => setShowUser(!showUser)} className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                        <img src={user?.avatar} alt="" className="w-8 h-8 rounded-full" />
                    </button>
                    {showUser && (
                        <div className="absolute right-0 top-12 w-56 bg-white dark:bg-surface-800 rounded-2xl shadow-2xl border border-surface-200 dark:border-surface-700 py-2">
                            <div className="px-4 py-2 border-b border-surface-200 dark:border-surface-700">
                                <p className="font-medium text-sm">{user?.firstName} {user?.lastName}</p>
                                <p className="text-xs text-surface-500">{user?.email}</p>
                            </div>
                            <button
                                onClick={() => { navigate('/profile'); setShowUser(false); }}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors">
                                <User className="w-4 h-4" /> Profile
                            </button>
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors">
                                <LogOut className="w-4 h-4" /> Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
