import { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useMembershipStore } from '../../stores/membershipStore';
import { useBookingStore } from '../../stores/bookingStore';
import { useLogsStore } from '../../stores/logsStore';
import { ROLES, ANALYTICS_DATA, ROOMS } from '../../lib/mockData';
import {
    CreditCard, CalendarDays, Activity, Users, TrendingUp,
    Shield, QrCode, AlertTriangle, ArrowUpRight, Clock,
    CheckCircle2, XCircle, MonitorSmartphone, Bell,
    Wifi, WifiOff, Zap, BarChart3, UserCheck, Eye
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

/* ───────── Stat Card ───────── */
function StatCard({ icon: Icon, label, value, trend, color, bg, to }) {
    const content = (
        <div className={`bg-white dark:bg-surface-800/50 rounded-2xl p-5 border border-surface-200 dark:border-surface-700/50
            hover:shadow-lg hover:shadow-${color}/5 transition-all duration-300 group cursor-pointer`}>
            <div className="flex items-start justify-between">
                <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                </div>
                {trend && (
                    <span className={`flex items-center gap-0.5 text-xs font-medium px-2 py-1 rounded-full
                        ${trend.startsWith('+') ? 'text-success-500 bg-success-500/10' : 'text-danger-500 bg-danger-500/10'}`}>
                        <ArrowUpRight className={`w-3 h-3 ${!trend.startsWith('+') && 'rotate-90'}`} /> {trend}
                    </span>
                )}
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight">{value}</p>
            <p className="text-sm text-surface-500 mt-0.5">{label}</p>
        </div>
    );
    return to ? <Link to={to}>{content}</Link> : content;
}

/* ───────── Mini Bar Chart ───────── */
function MiniChart({ data, color, label }) {
    const max = Math.max(...data);
    const [animate, setAnimate] = useState(false);
    useEffect(() => { setAnimate(true); }, []);

    return (
        <div>
            <div className="flex items-end gap-[3px] h-20">
                {data.map((v, i) => (
                    <div
                        key={i}
                        className={`flex-1 rounded-t ${color} transition-all duration-700 ease-out hover:opacity-80`}
                        style={{
                            height: animate ? `${(v / max) * 100}%` : '0%',
                            minWidth: '6px',
                            opacity: 0.4 + (i / data.length) * 0.6,
                            transitionDelay: `${i * 30}ms`
                        }}
                        title={`${v}`}
                    />
                ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-surface-400 font-medium">
                <span>14 days ago</span>
                <span>{label}</span>
                <span>Today</span>
            </div>
        </div>
    );
}

/* ───────── Alert Item ───────── */
function AlertItem({ icon: Icon, title, description, severity, time }) {
    const severityStyles = {
        critical: 'border-l-danger-500 bg-danger-500/5',
        warning: 'border-l-warning-500 bg-warning-500/5',
        info: 'border-l-primary-500 bg-primary-500/5',
    };
    const iconStyles = {
        critical: 'text-danger-500',
        warning: 'text-warning-500',
        info: 'text-primary-500',
    };

    return (
        <div className={`flex items-start gap-3 p-3 rounded-xl border-l-4 ${severityStyles[severity]} transition-all hover:shadow-sm`}>
            <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${iconStyles[severity]}`} />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-surface-500 mt-0.5">{description}</p>
            </div>
            <span className="text-[10px] text-surface-400 whitespace-nowrap">{time}</span>
        </div>
    );
}

/* ───────── Live Activity Row ───────── */
function LiveLogRow({ log, isAdmin }) {
    return (
        <div className="flex items-center gap-3 py-2.5 px-1 border-b border-surface-100 dark:border-surface-800 last:border-0 hover:bg-surface-50/50 dark:hover:bg-surface-800/30 rounded-lg transition-colors">
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${log.success ? 'bg-success-400 shadow-sm shadow-success-400/50' : 'bg-danger-400 shadow-sm shadow-danger-400/50'}`} />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{isAdmin ? log.memberName : log.location}</p>
                <p className="text-[11px] text-surface-500">{log.type.replace('_', ' ')} • {log.device}</p>
            </div>
            <span className="text-[10px] text-surface-400 whitespace-nowrap">
                {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
            </span>
        </div>
    );
}

/* ───────── Room Occupancy Card ───────── */
function RoomOccupancy() {
    // Mock occupancy data
    const roomStatus = ROOMS.slice(0, 6).map(r => ({
        ...r,
        occupied: Math.random() > 0.4,
        currentUser: Math.random() > 0.5 ? 'Alex Chen' : 'Morgan Rodriguez',
        until: new Date(Date.now() + Math.random() * 3 * 3600000).toISOString(),
    }));

    return (
        <div className="space-y-2">
            {roomStatus.map(room => (
                <div key={room.id} className="flex items-center gap-3 py-2">
                    <span className="text-lg">{room.image}</span>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{room.name}</p>
                        <p className="text-[11px] text-surface-500">
                            {room.occupied ? `Until ${format(new Date(room.until), 'h:mm a')}` : 'Available'}
                        </p>
                    </div>
                    <span className={`w-2.5 h-2.5 rounded-full ${room.occupied ? 'bg-warning-400' : 'bg-success-400'}`} />
                </div>
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════ */
/* ───────── MAIN DASHBOARD ─────────── */
/* ═══════════════════════════════════════ */

export default function DashboardPage() {
    const { user } = useAuthStore();
    const { currentMembership, members, fetchCurrentMembership, fetchAllMembers, isLoading: membershipLoading } = useMembershipStore();
    const { bookings, fetchBookings, isLoading: bookingsLoading } = useBookingStore();
    const { logs, fetchLogs, isLoading: logsLoading } = useLogsStore();
    const isAdmin = user?.role === ROLES.ADMIN || user?.role === ROLES.HUB_MANAGER;

    useEffect(() => {
        if (user) {
            fetchBookings();
            fetchLogs();
            if (isAdmin) {
                fetchAllMembers();
            } else {
                fetchCurrentMembership(user.id);
            }
        }
    }, [user, isAdmin, fetchCurrentMembership, fetchAllMembers, fetchBookings, fetchLogs]);

    const recentLogs = logs.slice(0, 8);
    const activeMembers = members.filter(m => (m.status || '').toLowerCase() === 'active').length;
    const expiredMembers = members.filter(m => (m.status || '').toLowerCase() === 'expired' || (m.status || '').toLowerCase() === 'inactive').length;
    const suspendedMembers = members.filter(m => (m.status || '').toLowerCase() === 'suspended').length;
    const upcomingBookings = bookings.filter(b => new Date(b.startTime) > new Date() && b.status !== 'cancelled');
    const todayLogs = logs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString());
    const todayFailed = todayLogs.filter(l => !l.success).length;
    const todayBookings = bookings.filter(b => new Date(b.startTime).toDateString() === new Date().toDateString());

    // Mock device data
    const devices = [
        { name: 'Front Scanner', status: 'online', lastPing: '2m ago' },
        { name: 'Lab Door', status: 'online', lastPing: '1m ago' },
        { name: 'Workshop Gate', status: 'offline', lastPing: '34m ago' },
        { name: 'Server Room', status: 'online', lastPing: '30s ago' },
    ];

    // Mock alerts
    const alerts = [
        { icon: WifiOff, title: 'Device Offline', description: 'Workshop Gate scanner has been offline for 34 minutes', severity: 'critical', time: '34m ago' },
        { icon: AlertTriangle, title: 'Multiple Failed Attempts', description: '6 failed access attempts in the last hour at Main Entrance', severity: 'warning', time: '12m ago' },
        { icon: Bell, title: 'Memberships Expiring', description: `${Math.max(1, expiredMembers)} memberships expire within the next 7 days`, severity: 'info', time: 'Today' },
    ];

    const isLoading = membershipLoading || bookingsLoading || logsLoading;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-surface-500 animate-pulse">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    /* ───── Member Dashboard ───── */
    if (!isAdmin) {
        return (
            <div className="space-y-6 page-enter page-enter-active">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">
                        Welcome back, {user?.name?.split(' ')[0]}!
                    </h1>
                    <p className="text-surface-500 mt-1">Here's what's happening with your access</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {currentMembership ? (
                        <>
                            <StatCard icon={Shield} label="Access Status" value={currentMembership.status === 'active' ? 'Active' : 'Inactive'} color="text-success-500" bg="bg-success-100 dark:bg-success-900/30" />
                            <StatCard icon={CreditCard} label="Membership" value={currentMembership.tier.name} color="text-primary-500" bg="bg-primary-100 dark:bg-primary-900/30" />
                            <StatCard icon={CalendarDays} label="Upcoming" value={`${upcomingBookings.length} bookings`} color="text-accent-500" bg="bg-accent-100 dark:bg-accent-900/30" to="/bookings" />
                            <StatCard icon={Activity} label="Total Access" value={currentMembership.accessCount} trend="+5%" color="text-warning-500" bg="bg-warning-100 dark:bg-warning-900/30" to="/activity" />
                        </>
                    ) : (
                        <div className="col-span-full p-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-xl text-center">
                            No active membership found. Please contact support.
                        </div>
                    )}
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {currentMembership && (
                        <div className="lg:col-span-2 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white relative overflow-hidden">
                            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                            <div className="absolute right-4 top-4 w-16 h-16 bg-white/10 rounded-full blur-lg" />
                            <p className="text-sm opacity-80">Quick Access</p>
                            <h2 className="text-xl font-bold mt-1">{currentMembership.tier.name} Member</h2>
                            <p className="text-sm opacity-70 mt-2 flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                Expires {formatDistanceToNow(new Date(currentMembership.expiryDate), { addSuffix: true })}
                            </p>
                            <div className="mt-4 flex gap-3">
                                <Link to="/access-card" className="bg-white/20 hover:bg-white/30 backdrop-blur px-4 py-2 rounded-xl text-sm font-medium transition-colors">Open Access Card</Link>
                                <Link to="/bookings" className="bg-white/10 hover:bg-white/20 backdrop-blur px-4 py-2 rounded-xl text-sm font-medium transition-colors">Book a Room</Link>
                            </div>
                        </div>
                    )}
                    <div className="bg-white dark:bg-surface-800/50 rounded-2xl p-5 border border-surface-200 dark:border-surface-700/50">
                        <h2 className="font-semibold mb-3 flex items-center gap-2"><Activity className="w-5 h-5 text-accent-500" /> Recent Activity</h2>
                        <div className="space-y-1">
                            {recentLogs.length > 0 ? recentLogs.slice(0, 5).map(log => (
                                <LiveLogRow key={log.id} log={log} isAdmin={false} />
                            )) : <p className="text-sm text-surface-500">No recent activity</p>}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /* ───── Admin Dashboard ───── */
    return (
        <div className="space-y-6 page-enter page-enter-active">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        Control Center
                    </h1>
                    <p className="text-surface-500 mt-1">Real-time overview of hub operations</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-surface-400">
                    <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse" />
                    <span>Live • Updated {format(new Date(), 'h:mm a')}</span>
                </div>
            </div>

            {/* ── Quick Metrics Row ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <StatCard icon={Users} label="Active Members" value={activeMembers} trend="+12%" color="text-primary-500" bg="bg-primary-100 dark:bg-primary-900/30" to="/members" />
                <StatCard icon={UserCheck} label="Expired" value={expiredMembers} color="text-warning-500" bg="bg-warning-100 dark:bg-warning-900/30" to="/members" />
                <StatCard icon={Shield} label="Suspended" value={suspendedMembers} color="text-danger-500" bg="bg-danger-100 dark:bg-danger-900/30" to="/members" />
                <StatCard icon={QrCode} label="Today's Scans" value={todayLogs.length || ANALYTICS_DATA.qrScansPerDay.at(-1)} trend="+8%" color="text-accent-500" bg="bg-accent-100 dark:bg-accent-900/30" to="/logs" />
                <StatCard icon={AlertTriangle} label="Failed Today" value={todayFailed || ANALYTICS_DATA.failedAttempts.at(-1)} color="text-danger-500" bg="bg-danger-100 dark:bg-danger-900/30" to="/logs" />
                <StatCard icon={CalendarDays} label="Bookings Today" value={todayBookings.length || ANALYTICS_DATA.bookingFrequency.at(-1)} trend="+15%" color="text-success-500" bg="bg-success-100 dark:bg-success-900/30" to="/bookings" />
            </div>

            {/* ── Main Content Grid ── */}
            <div className="grid lg:grid-cols-3 gap-6">

                {/* Left: Activity Feed (2 cols) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Charts Row */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-surface-800/50 rounded-2xl p-5 border border-surface-200 dark:border-surface-700/50">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold flex items-center gap-2 text-sm">
                                    <TrendingUp className="w-4 h-4 text-primary-500" /> Daily Active Users
                                </h3>
                                <span className="text-xs text-surface-400">{ANALYTICS_DATA.dailyActiveUsers.at(-1)} today</span>
                            </div>
                            <MiniChart data={ANALYTICS_DATA.dailyActiveUsers} color="bg-primary-500" label="DAU" />
                        </div>
                        <div className="bg-white dark:bg-surface-800/50 rounded-2xl p-5 border border-surface-200 dark:border-surface-700/50">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold flex items-center gap-2 text-sm">
                                    <QrCode className="w-4 h-4 text-accent-500" /> QR Scans
                                </h3>
                                <span className="text-xs text-surface-400">{ANALYTICS_DATA.qrScansPerDay.at(-1)} today</span>
                            </div>
                            <MiniChart data={ANALYTICS_DATA.qrScansPerDay} color="bg-accent-500" label="Scans" />
                        </div>
                    </div>

                    {/* Live Access Feed */}
                    <div className="bg-white dark:bg-surface-800/50 rounded-2xl p-5 border border-surface-200 dark:border-surface-700/50">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold flex items-center gap-2">
                                <Activity className="w-5 h-5 text-accent-500" />
                                Live Activity Feed
                            </h2>
                            <Link to="/logs" className="text-xs text-primary-500 hover:text-primary-400 font-medium flex items-center gap-1">
                                View All <Eye className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="space-y-0.5 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
                            {recentLogs.length > 0 ? recentLogs.map(log => (
                                <LiveLogRow key={log.id} log={log} isAdmin={true} />
                            )) : <p className="text-sm text-surface-500 py-4 text-center">No recent activity</p>}
                        </div>
                    </div>

                    {/* More Charts */}
                    <div className="grid sm:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-surface-800/50 rounded-2xl p-5 border border-surface-200 dark:border-surface-700/50">
                            <h3 className="text-xs font-medium text-surface-500 uppercase tracking-wider mb-3">Booking Frequency</h3>
                            <MiniChart data={ANALYTICS_DATA.bookingFrequency} color="bg-success-500" label="Bookings" />
                        </div>
                        <div className="bg-white dark:bg-surface-800/50 rounded-2xl p-5 border border-surface-200 dark:border-surface-700/50">
                            <h3 className="text-xs font-medium text-surface-500 uppercase tracking-wider mb-3">Failed Attempts</h3>
                            <MiniChart data={ANALYTICS_DATA.failedAttempts} color="bg-danger-500" label="Failures" />
                        </div>
                        <div className="bg-white dark:bg-surface-800/50 rounded-2xl p-5 border border-surface-200 dark:border-surface-700/50">
                            <h3 className="text-xs font-medium text-surface-500 uppercase tracking-wider mb-3">Membership Upgrades</h3>
                            <MiniChart data={ANALYTICS_DATA.membershipUpgrades} color="bg-warning-500" label="Upgrades" />
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">

                    {/* Alerts Panel */}
                    <div className="bg-white dark:bg-surface-800/50 rounded-2xl p-5 border border-surface-200 dark:border-surface-700/50">
                        <h2 className="font-semibold flex items-center gap-2 mb-4">
                            <AlertTriangle className="w-5 h-5 text-warning-500" />
                            Alerts
                            <span className="ml-auto text-xs bg-danger-500 text-white px-2 py-0.5 rounded-full">{alerts.length}</span>
                        </h2>
                        <div className="space-y-2">
                            {alerts.map((alert, i) => (
                                <AlertItem key={i} {...alert} />
                            ))}
                        </div>
                    </div>

                    {/* Device Status */}
                    <div className="bg-white dark:bg-surface-800/50 rounded-2xl p-5 border border-surface-200 dark:border-surface-700/50">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold flex items-center gap-2">
                                <MonitorSmartphone className="w-5 h-5 text-primary-500" />
                                Devices
                            </h2>
                            <Link to="/devices" className="text-xs text-primary-500 hover:text-primary-400 font-medium">
                                Manage →
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {devices.map((d, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    {d.status === 'online'
                                        ? <Wifi className="w-4 h-4 text-success-500" />
                                        : <WifiOff className="w-4 h-4 text-danger-500" />
                                    }
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium">{d.name}</p>
                                        <p className="text-[11px] text-surface-500">Last ping: {d.lastPing}</p>
                                    </div>
                                    <span className={`w-2 h-2 rounded-full ${d.status === 'online' ? 'bg-success-400' : 'bg-danger-400 animate-pulse'}`} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Room Occupancy */}
                    <div className="bg-white dark:bg-surface-800/50 rounded-2xl p-5 border border-surface-200 dark:border-surface-700/50">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-accent-500" />
                                Room Status
                            </h2>
                            <Link to="/bookings" className="text-xs text-primary-500 hover:text-primary-400 font-medium">
                                Bookings →
                            </Link>
                        </div>
                        <RoomOccupancy />
                    </div>
                </div>
            </div>
        </div>
    );
}
