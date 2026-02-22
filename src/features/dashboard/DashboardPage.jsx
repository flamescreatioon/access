import { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useMembershipStore } from '../../stores/membershipStore';
import { useBookingStore } from '../../stores/bookingStore';
import { useLogsStore } from '../../stores/logsStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useAnalyticsStore } from '../../stores/analyticsStore';
import { ROLES } from '../../lib/mockData';
import SetupTracker from '../../components/onboarding/SetupTracker';
import {
    CreditCard, CalendarDays, Activity, Users, TrendingUp,
    Shield, QrCode, AlertTriangle, ArrowUpRight, ArrowRight, Clock,
    CheckCircle2, XCircle, MonitorSmartphone, Bell,
    Wifi, WifiOff, Zap, BarChart3, UserCheck, Eye, Sparkles, Crown, AlertCircle, Info
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

/* ───────── Stat Card ───────── */
function StatCard({ icon: Icon, label, value, trend, color, bg, to }) {
    const content = (
        <div className={`bg-white dark:bg-surface-800/50 rounded-2xl p-5 border border-surface-200 dark:border-surface-700/50
            hover:shadow-lg hover:shadow-${color}/5 transition-all duration-300 group cursor-pointer relative overflow-hidden`}>
            {trend && <div className={`absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 rounded-full opacity-5 ${bg} blur-2xl`} />}
            <div className="flex items-start justify-between relative z-10">
                <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                </div>
                {trend && (
                    <span className={`flex items-center gap-0.5 text-[10px] font-black uppercase px-2 py-1 rounded-lg tracking-wider
                        ${trend.startsWith('+') ? 'text-success-500 bg-success-500/10' : 'text-danger-500 bg-danger-500/10'}`}>
                        <ArrowUpRight className={`w-3 h-3 ${!trend.startsWith('+') && 'rotate-90'}`} /> {trend}
                    </span>
                )}
            </div>
            <p className="mt-4 text-2xl font-black tracking-tight">{value}</p>
            <p className="text-[11px] font-bold uppercase tracking-widest text-surface-400 mt-1">{label}</p>
        </div>
    );
    return to ? <Link to={to}>{content}</Link> : content;
}

/* ───────── Mini Bar Chart ───────── */
function MiniChart({ data = [], color, label }) {
    const max = Math.max(...(data.length ? data : [1]));
    const [animate, setAnimate] = useState(false);
    useEffect(() => { setAnimate(true); }, []);

    return (
        <div>
            <div className="flex items-end gap-[4px] h-20 px-1">
                {(data.length ? data : [0, 0, 0, 0, 0, 0, 0]).map((v, i) => (
                    <div
                        key={i}
                        className={`flex-1 rounded-t-sm ${color} transition-all duration-700 ease-out hover:opacity-80`}
                        style={{
                            height: animate ? `${(v / max) * 100}%` : '0%',
                            minHeight: '4px',
                            minWidth: '4px',
                            opacity: 0.3 + (i / 10) * 0.7,
                            transitionDelay: `${i * 40}ms`
                        }}
                    />
                ))}
            </div>
            <div className="flex justify-between mt-3 text-[9px] text-surface-400 font-black uppercase tracking-widest">
                <span>Week 1</span>
                <span>{label}</span>
                <span>Live</span>
            </div>
        </div>
    );
}

/* ───────── Live Activity Row ───────── */
function LiveLogRow({ log, isAdmin }) {
    return (
        <div className="flex items-center gap-4 py-3.5 px-3 hover:bg-surface-50 dark:hover:bg-surface-800/50 rounded-2xl transition-all group border-b border-surface-100 dark:border-surface-700/30 last:border-0">
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${log.success ? 'bg-success-500 shadow-lg shadow-success-500/30' : 'bg-danger-500 shadow-lg shadow-danger-500/30'} group-hover:scale-125 transition-transform`} />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-black tracking-tight truncate group-hover:text-primary-500 transition-colors uppercase">{isAdmin ? log.memberName || 'Unknown' : log.location}</p>
                <p className="text-[10px] font-bold text-surface-500 mt-0.5 opacity-70">
                    {log.type?.replace(/_/g, ' ')} • {log.device || 'System'}
                </p>
            </div>
            <span className="text-[10px] font-black text-surface-400 whitespace-nowrap bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded-lg">
                {log.timestamp ? formatDistanceToNow(new Date(log.timestamp), { addSuffix: true }) : 'Just now'}
            </span>
        </div>
    );
}

export default function DashboardPage() {
    const { user } = useAuthStore();
    const { currentMembership, members, fetchCurrentMembership, fetchAllMembers } = useMembershipStore();
    const { bookings, fetchBookings } = useBookingStore();
    const { logs, fetchLogs } = useLogsStore();
    const { fetchNotifications, unreadCount } = useNotificationStore();
    const { status: onboardingStatus, fetchStatus: fetchOnboardingStatus } = useOnboardingStore();
    const { stats, growthData, entryTrends, fetchAllAnalytics } = useAnalyticsStore();

    const isAdmin = user?.role === ROLES.ADMIN || user?.role === ROLES.HUB_MANAGER;
    const isSecurity = user?.role === ROLES.SECURITY;
    const [loading, setLoading] = useState(true);
    const [isPoorConnection, setIsPoorConnection] = useState(false);

    useEffect(() => {
        const initializeDashboard = async () => {
            setLoading(true);
            const timeoutId = setTimeout(() => setIsPoorConnection(true), 12000);

            try {
                // 1. Fetch onboarding status and sync user state
                const statusData = await fetchOnboardingStatus();

                if (statusData?.user) {
                    const { updateUser, user: currentUser } = useAuthStore.getState();
                    if (currentUser?.activation_status !== statusData.user.activation_status ||
                        currentUser?.first_login_required !== statusData.user.first_login_required) {
                        updateUser(statusData.user);
                    }
                }

                // 2. Fetch Notifications (always safe)
                fetchNotifications();

                // 3. If fully active, fetch the rest of the business data
                const isActuallyActive = (statusData?.activationStatus || user?.activation_status) === 'ACTIVE' || isAdmin;
                if (isActuallyActive) {
                    const tasks = [fetchBookings()];

                    if (isAdmin || isSecurity) {
                        tasks.push(fetchLogs());
                    }

                    if (isAdmin) {
                        tasks.push(fetchAllMembers());
                        tasks.push(fetchAllAnalytics());
                    } else if (user?.id) {
                        tasks.push(fetchCurrentMembership(user.id));
                        tasks.push(useAnalyticsStore.getState().fetchUserImpact());
                    }

                    await Promise.all(tasks);
                }

                setIsPoorConnection(false);
            } catch (err) {
                console.error("Dashboard initialization error:", err);
                setIsPoorConnection(true);
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) {
            initializeDashboard();
        }

        // Smart Polling: Refresh data every 30 seconds
        const pollInterval = setInterval(() => {
            if (user?.id && !loading) {
                fetchBookings();
                if (isAdmin || isSecurity) fetchLogs();
                fetchNotifications();
            }
        }, 30000);

        return () => {
            clearInterval(pollInterval);
        };
    }, [user?.id, isAdmin, isSecurity, fetchBookings, fetchLogs, fetchNotifications, loading]);

    if (loading && !onboardingStatus) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] animate-pulse">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-xs font-black uppercase tracking-[0.2em] text-surface-400">Synchronizing Data</p>
            </div>
        );
    }

    const unread = unreadCount;
    // Use onboardingStatus as primary, user state as secondary. Admins/Managers are always active.
    const isFullyActive = (onboardingStatus?.activationStatus || user?.activation_status) === 'ACTIVE' || isAdmin;

    if (!isFullyActive && onboardingStatus) {
        return (
            <div className="space-y-8 page-enter page-enter-active max-w-4xl mx-auto py-8">
                <header>
                    <h1 className="text-4xl font-black tracking-tight">Complete Your Setup</h1>
                    <p className="text-surface-500 mt-2 font-medium">Follow the steps below to activate your hub access.</p>
                </header>
                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2">
                        <SetupTracker status={onboardingStatus} />
                    </div>
                    <div className="bg-primary-500 rounded-[2.5rem] p-8 text-white shadow-xl shadow-primary-500/20">
                        <h3 className="text-xl font-black mb-4">Why is this locked?</h3>
                        <p className="text-primary-100 text-sm font-medium mb-6">To ensure hub safety and operational excellence, all members must complete their profile and verify payment before full access is granted.</p>
                        <Link
                            to="/onboarding/setup"
                            className="w-full py-4 bg-white text-primary-600 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-primary-50 transition-all"
                        >
                            Start Setup Now
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const upcomingBookingsCount = bookings.filter(b => b.status === 'confirmed' && new Date(b.start_time) > new Date()).length;

    /* ───── Member UI ───── */
    if (!isAdmin) {
        const tier = currentMembership?.AccessTier;
        const { userImpact } = useAnalyticsStore();

        return (
            <div className="space-y-6 page-enter page-enter-active">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                            Hey, {user?.name?.split(' ')[0]}!
                        </h1>
                        <p className="text-surface-500 mt-1 font-medium">Your creative hub is ready for you.</p>
                    </div>
                    <Link to="/notifications" className="relative p-3 bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 hover:border-primary-500/50 transition-all shadow-sm">
                        <Bell className="w-6 h-6 text-surface-500" />
                        {unread > 0 && (
                            <span className="absolute top-2.5 right-2.5 w-5 h-5 bg-danger-500 text-white text-[10px] font-black border-2 border-white dark:border-surface-800 rounded-full flex items-center justify-center">
                                {unread}
                            </span>
                        )}
                    </Link>
                </header>

                {isPoorConnection && (
                    <div className="bg-warning-500/10 border border-warning-500/20 rounded-2xl p-4 flex items-center justify-between animate-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-warning-500/20 flex items-center justify-center">
                                <WifiOff className="w-5 h-5 text-warning-600" />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-tight text-warning-700">Network Signal Weak</p>
                                <p className="text-[10px] font-bold text-warning-600/80 uppercase">Data may be stale. Reconnecting...</p>
                            </div>
                        </div>
                        <button onClick={() => {
                            const initializeDashboard = async () => {
                                setLoading(true);
                                try {
                                    await fetchOnboardingStatus();
                                    await fetchBookings();
                                    if (isAdmin || isSecurity) await fetchLogs();
                                    setIsPoorConnection(false);
                                } catch (e) {
                                    console.error('Refresh failed');
                                } finally {
                                    setLoading(false);
                                }
                            };
                            initializeDashboard();
                        }} className="px-4 py-2 bg-warning-500 text-white text-[10px] font-black uppercase rounded-lg hover:bg-warning-600 transition-all">
                            Refresh
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard icon={Zap} label="Access Status" value={currentMembership?.status === 'Active' ? 'Active' : 'Inactive'} color="text-success-500" bg="bg-success-500/10" />
                    <StatCard icon={Shield} label="Tier" value={tier?.name || 'Guest'} color="text-primary-500" bg="bg-primary-500/10" to="/membership" />
                    <StatCard icon={CalendarDays} label="Upcoming" value={`${upcomingBookingsCount} active`} color="text-accent-500" bg="bg-accent-500/10" to="/bookings" />
                    <StatCard icon={Activity} label="Logs" value={logs.length} trend="+2" color="text-warning-500" bg="bg-warning-500/10" to="/activity" />
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Membership Hero */}
                        {currentMembership ? (
                            <div className="relative group overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary-600 to-primary-800 p-8 text-white shadow-2xl shadow-primary-500/20">
                                <div className="absolute top-0 right-0 w-64 h-64 -mr-32 -mt-32 bg-white/10 rounded-full blur-3xl transition-transform group-hover:scale-110 duration-700" />
                                <div className="absolute bottom-0 left-0 w-48 h-48 -ml-24 -mb-24 bg-accent-500/20 rounded-full blur-3xl" />

                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                                            <Crown className="w-6 h-6 text-warning-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Current Membership</p>
                                            <h2 className="text-2xl font-black">{tier?.name} Passport</h2>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 mb-8">
                                        <div>
                                            <p className="text-xs font-bold opacity-60">Expires In</p>
                                            <p className="text-xl font-black">{currentMembership.expiry_date ? formatDistanceToNow(new Date(currentMembership.expiry_date)) : 'N/A'}</p>
                                        </div>
                                        <div className="w-px h-10 bg-white/10" />
                                        <div>
                                            <p className="text-xs font-bold opacity-60">Status</p>
                                            <p className="text-xl font-black flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 bg-success-400 rounded-full animate-pulse" />
                                                Active
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-4">
                                        <Link to="/access-card" className="bg-white text-primary-600 px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl">
                                            <QrCode className="w-4 h-4" /> Go Digital
                                        </Link>
                                        <Link to="/spaces" className="bg-white/10 backdrop-blur hover:bg-white/20 border border-white/10 px-8 py-3.5 rounded-2xl font-black text-sm transition-all text-white">
                                            Book a Space
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-warning-500/10 border-2 border-dashed border-warning-500/30 rounded-[2.5rem] p-10 text-center">
                                <AlertTriangle className="w-12 h-12 text-warning-500 mx-auto mb-4" />
                                <h3 className="text-xl font-black text-surface-900 dark:text-surface-100">Membership Required</h3>
                                <p className="text-surface-500 mt-2 font-medium">Purchase a plan to start accessing the Hub and booking equipment.</p>
                                <Link to="/membership" className="mt-6 inline-block bg-primary-500 text-white px-8 py-3 rounded-2xl font-black text-sm">View Plans</Link>
                            </div>
                        )}

                        {/* Recent Activity Mini */}
                        <div className="bg-white dark:bg-surface-800/50 rounded-[2rem] p-6 border border-surface-200 dark:border-surface-700/50 shadow-sm">
                            <h2 className="font-black text-lg mb-4 flex items-center gap-2 uppercase tracking-tight">
                                <Activity className="w-5 h-5 text-accent-500" /> Recent Entry Logs
                            </h2>
                            <div className="space-y-0.5">
                                {logs.length > 0 ? logs.slice(0, 5).map(log => (
                                    <LiveLogRow key={log.id} log={log} isAdmin={false} />
                                )) : <p className="text-center py-12 text-surface-400 italic">No activity recorded yet.</p>}
                                {logs.length > 0 && (
                                    <Link to="/activity" className="block text-center pt-4 text-[10px] font-black uppercase text-primary-500 hover:underline tracking-widest">
                                        Show all access logs
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Monthly Impact Panel */}
                        <div className="bg-white dark:bg-surface-800/50 rounded-[2rem] p-6 border border-surface-200 dark:border-surface-700/50 shadow-sm">
                            <h3 className="font-black text-sm mb-6 flex items-center gap-2 uppercase tracking-widest text-surface-400">
                                <Sparkles className="w-4 h-4 text-primary-500" /> Monthly Impact
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-xs font-black uppercase mb-2">
                                        <span>Participation</span>
                                        <span className="text-primary-500">{userImpact.utilizationRate}%</span>
                                    </div>
                                    <div className="h-3 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden p-0.5">
                                        <div className="h-full bg-primary-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" style={{ width: `${userImpact.utilizationRate}%` }} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-surface-100 dark:border-surface-700/50">
                                    <div>
                                        <p className="text-xs font-bold text-surface-400 lowercase">Hours Logged</p>
                                        <p className="text-xl font-black">{userImpact.estimatedHours.toFixed(1)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-surface-400 lowercase">Equipment Used</p>
                                        <p className="text-xl font-black">{userImpact.uniqueEquipmentCount} types</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Tips */}
                        <div className="bg-accent-500/5 border border-accent-500/10 rounded-[2rem] p-6">
                            <h4 className="font-bold text-accent-600 dark:text-accent-400 flex items-center gap-2 mb-2">
                                <Info className="w-4 h-4" /> Did you know?
                            </h4>
                            <p className="text-xs text-accent-700/80 dark:text-accent-300/80 leading-relaxed font-medium">
                                You can book the 3D printers up to 48 hours in advance. Make sure to complete your safety module first!
                            </p>
                            <Link to="/equipment" className="mt-4 inline-flex items-center gap-1 text-[10px] font-black uppercase text-accent-500">
                                Browse Equipment →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /* ───── Admin UI ───── */
    return (
        <div className="space-y-6 page-enter page-enter-active">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center shadow-lg shadow-primary-500/20">
                            <MonitorSmartphone className="w-6 h-6 text-white" />
                        </div>
                        Hub Command
                    </h1>
                    <p className="text-surface-500 mt-1 font-medium">Real-time hub operations and member analytics.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-success-500/10 text-success-600 dark:text-success-400 rounded-xl border border-success-500/20 text-[10px] font-black uppercase tracking-wider">
                        <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
                        Network Live
                    </div>
                    <Link to="/notifications" className="relative p-2.5 bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 text-surface-500">
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger-500 rounded-full border-2 border-white dark:border-surface-800" />}
                    </Link>
                </div>
            </header>

            {isPoorConnection && (
                <div className="bg-warning-500/10 border border-warning-500/20 rounded-2xl p-4 flex items-center justify-between animate-in slide-in-from-top-4 duration-500 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-warning-500/20 flex items-center justify-center">
                            <WifiOff className="w-5 h-5 text-warning-600" />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-tight text-warning-700">Network Signal Weak</p>
                            <p className="text-[10px] font-bold text-warning-600/80 uppercase">Data may be stale. Reconnecting...</p>
                        </div>
                    </div>
                    <button onClick={() => window.location.reload()} className="px-4 py-2 bg-warning-500 text-white text-[10px] font-black uppercase rounded-lg hover:bg-warning-600 transition-all">
                        Refresh
                    </button>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <StatCard icon={Users} label="Total Members" value={stats.totalMembers} trend="" color="text-primary-500" bg="bg-primary-500/10" to="/members" />
                <StatCard icon={CheckCircle2} label="Active Today" value={stats.activeToday} trend="" color="text-success-500" bg="bg-success-500/10" to="/logs" />
                <StatCard icon={CalendarDays} label="Bookings" value={stats.totalBookings} trend="" color="text-warning-500" bg="bg-warning-500/10" to="/bookings" />
                <StatCard icon={AlertTriangle} label="Security Fail" value={stats.securityFailures} color="text-danger-500" bg="bg-danger-500/10" to="/logs" />
                <StatCard icon={TrendingUp} label="Daily Load" value={`${Math.round((stats.insideNow / (stats.capacityLimit || 200)) * 100)}%`} trend="" color="text-accent-500" bg="bg-accent-500/10" />
                <StatCard icon={Zap} label="Inside Now" value={stats.insideNow} color="text-primary-400" bg="bg-primary-400/10" />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-surface-800/50 rounded-[2rem] p-6 border border-surface-200 dark:border-surface-700/50">
                            <h3 className="font-black text-[10px] uppercase tracking-widest text-surface-400 mb-6 flex items-center border-b border-surface-100 dark:border-surface-700 pb-2">
                                <TrendingUp className="w-3.5 h-3.5 mr-2 text-primary-500" /> Member Growth (14d)
                            </h3>
                            <MiniChart data={growthData} color="bg-primary-500" label="Members" />
                        </div>
                        <div className="bg-white dark:bg-surface-800/50 rounded-[2rem] p-6 border border-surface-200 dark:border-surface-700/50">
                            <h3 className="font-black text-[10px] uppercase tracking-widest text-surface-400 mb-6 flex items-center border-b border-surface-100 dark:border-surface-700 pb-2">
                                <QrCode className="w-3.5 h-3.5 mr-2 text-accent-500" /> Entries (24h)
                            </h3>
                            <MiniChart data={entryTrends} color="bg-accent-500" label="Scans" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-surface-800/50 rounded-[2rem] p-6 border border-surface-200 dark:border-surface-700/50 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between mb-6 px-2">
                            <h2 className="font-black text-xl tracking-tight uppercase flex items-center gap-3">
                                <Activity className="w-6 h-6 text-accent-500" />
                                Real-time Entry Stream
                            </h2>
                            <Link to="/logs" className="p-2.5 bg-surface-100 dark:bg-surface-800 rounded-xl hover:text-primary-500 transition-colors">
                                <Eye className="w-5 h-5" />
                            </Link>
                        </div>
                        <div className="space-y-0.5 max-h-[400px] overflow-y-auto no-scrollbar">
                            {logs.length > 0 ? logs.slice(0, 10).map(log => (
                                <LiveLogRow key={log.id} log={log} isAdmin={true} />
                            )) : <p className="text-center py-24 text-surface-400 animate-pulse">Waiting for network signals...</p>}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-surface-800/50 rounded-[2rem] p-6 border border-surface-200 dark:border-surface-700/50 shadow-sm">
                        <h2 className="font-black text-[10px] uppercase tracking-[0.2em] text-surface-400 mb-6 border-b border-surface-100 dark:border-surface-700 pb-2 flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-2 text-warning-500" /> Network Alerts
                        </h2>
                        <div className="space-y-2">
                            <div className="flex items-start gap-4 p-4 bg-danger-500/5 border-l-4 border-l-danger-500 rounded-2xl">
                                <WifiOff className="w-5 h-5 text-danger-500 mt-1" />
                                <div>
                                    <p className="text-sm font-black uppercase text-danger-600">Lab Gate Offline</p>
                                    <p className="text-[10px] font-bold text-surface-500 mt-0.5">Disconnected 12m ago</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 bg-warning-500/5 border-l-4 border-l-warning-500 rounded-2xl">
                                <AlertCircle className="w-5 h-5 text-warning-500 mt-1" />
                                <div>
                                    <p className="text-sm font-black uppercase text-warning-600">Multiple Auth Failure</p>
                                    <p className="text-[10px] font-bold text-surface-500 mt-0.5">8 failed attempts at Main Entrance</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-surface-800 to-surface-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
                        <h3 className="text-xl font-black mb-1">Capacity Monitor</h3>
                        <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-6 border-b border-white/10 pb-2">Main Hall</p>

                        <div className="relative pt-10 pb-6 text-center">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full border-[10px] border-white/5" />
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full border-[10px] border-success-500 border-t-transparent -rotate-45"
                                style={{ strokeDasharray: '283', strokeDashoffset: `${283 * (1 - stats.insideNow / (stats.capacityLimit || 200))}` }} />
                            <p className="text-4xl font-black">{Math.round((stats.insideNow / (stats.capacityLimit || 200)) * 100)}<span className="text-lg text-white/40">%</span></p>
                            <p className="text-[10px] font-bold text-white/50 uppercase mt-1 tracking-widest">Normal Load</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="p-3 bg-white/5 rounded-2xl">
                                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest leading-none mb-1">In Hub</p>
                                <p className="text-lg font-black leading-none">{stats.insideNow}</p>
                            </div>
                            <div className="p-3 bg-white/5 rounded-2xl">
                                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest leading-none mb-1">Available</p>
                                <p className="text-lg font-black leading-none">{Math.max(0, (stats.capacityLimit || 200) - stats.insideNow)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
