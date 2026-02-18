import { useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useMembershipStore } from '../../stores/membershipStore';
import { useBookingStore } from '../../stores/bookingStore';
import { useLogsStore } from '../../stores/logsStore';
import { ROLES, ANALYTICS_DATA } from '../../lib/mockData';
import {
    CreditCard, CalendarDays, Activity, Users, TrendingUp,
    Shield, QrCode, AlertTriangle, ArrowUpRight, Clock
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

function StatCard({ icon: Icon, label, value, trend, color, bg }) {
    return (
        <div className="bg-white dark:bg-surface-800/50 rounded-2xl p-5 border border-surface-200 dark:border-surface-700/50 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-start justify-between">
                <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                </div>
                {trend && (
                    <span className="flex items-center gap-0.5 text-xs font-medium text-success-500 bg-success-500/10 px-2 py-1 rounded-full">
                        <ArrowUpRight className="w-3 h-3" /> {trend}
                    </span>
                )}
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight">{value}</p>
            <p className="text-sm text-surface-500 mt-0.5">{label}</p>
        </div>
    );
}

function MiniChart({ data, color }) {
    const max = Math.max(...data);
    return (
        <div className="flex items-end gap-1 h-16">
            {data.map((v, i) => (
                <div
                    key={i}
                    className={`flex-1 rounded-t-sm ${color} transition-all hover:opacity-80`}
                    style={{ height: `${(v / max) * 100}%`, minWidth: '4px', opacity: 0.5 + (i / data.length) * 0.5 }}
                />
            ))}
        </div>
    );
}

export default function DashboardPage() {
    const { user } = useAuthStore();
    const { currentMembership, members, fetchCurrentMembership, isLoading: membershipLoading } = useMembershipStore();
    const { bookings, fetchBookings, isLoading: bookingsLoading } = useBookingStore();
    const { logs, fetchLogs, isLoading: logsLoading } = useLogsStore();
    const isAdmin = user?.role === ROLES.ADMIN || user?.role === ROLES.HUB_MANAGER;

    useEffect(() => {
        if (user) {
            fetchCurrentMembership(user.id);
            fetchBookings();
            fetchLogs();
        }
    }, [user, fetchCurrentMembership, fetchBookings, fetchLogs]);

    const recentLogs = logs.slice(0, 5);
    const activeMembers = members.filter(m => m.status === 'active').length;
    const upcomingBookings = bookings.filter(b => new Date(b.startTime) > new Date() && b.status !== 'cancelled');

    if (membershipLoading || bookingsLoading || logsLoading) {
        return <div className="flex items-center justify-center min-h-[50vh]"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div></div>;
    }

    return (
        <div className="space-y-6 page-enter page-enter-active">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                    {isAdmin ? 'Admin Dashboard' : `Welcome back, ${user?.firstName}!`}
                </h1>
                <p className="text-surface-500 mt-1">
                    {isAdmin ? 'Overview of hub operations and analytics' : 'Here\'s what\'s happening with your access'}
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {isAdmin ? (
                    <>
                        <StatCard icon={Users} label="Active Members" value={activeMembers} trend="+12%" color="text-primary-500" bg="bg-primary-100 dark:bg-primary-900/30" />
                        <StatCard icon={QrCode} label="QR Scans Today" value={ANALYTICS_DATA.qrScansPerDay[ANALYTICS_DATA.qrScansPerDay.length - 1]} trend="+8%" color="text-accent-500" bg="bg-accent-100 dark:bg-accent-900/30" />
                        <StatCard icon={AlertTriangle} label="Failed Attempts" value={ANALYTICS_DATA.failedAttempts[ANALYTICS_DATA.failedAttempts.length - 1]} color="text-danger-500" bg="bg-danger-100 dark:bg-danger-900/30" />
                        <StatCard icon={CalendarDays} label="Bookings Today" value={ANALYTICS_DATA.bookingFrequency[ANALYTICS_DATA.bookingFrequency.length - 1]} trend="+15%" color="text-success-500" bg="bg-success-100 dark:bg-success-900/30" />
                    </>
                ) : (
                    currentMembership ? (
                        <>
                            <StatCard icon={Shield} label="Access Status" value={currentMembership.status === 'active' ? 'Active' : 'Inactive'} color="text-success-500" bg="bg-success-100 dark:bg-success-900/30" />
                            <StatCard icon={CreditCard} label="Membership" value={currentMembership.tier.name} color="text-primary-500" bg="bg-primary-100 dark:bg-primary-900/30" />
                            <StatCard icon={CalendarDays} label="Upcoming" value={`${upcomingBookings.length} bookings`} color="text-accent-500" bg="bg-accent-100 dark:bg-accent-900/30" />
                            <StatCard icon={Activity} label="Total Access" value={currentMembership.accessCount} trend="+5%" color="text-warning-500" bg="bg-warning-100 dark:bg-warning-900/30" />
                        </>
                    ) : (
                        <div className="col-span-full p-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-xl text-center">
                            No active membership found. Please contact support.
                        </div>
                    )
                )}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Chart / Access Card Preview */}
                {isAdmin ? (
                    <div className="lg:col-span-2 bg-white dark:bg-surface-800/50 rounded-2xl p-5 border border-surface-200 dark:border-surface-700/50">
                        <h2 className="font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary-500" /> daily Active Users</h2>
                        <MiniChart data={ANALYTICS_DATA.dailyActiveUsers} color="bg-primary-500" />
                        <div className="flex justify-between mt-2 text-xs text-surface-400">
                            <span>14 days ago</span><span>Today</span>
                        </div>
                    </div>
                ) : (
                    currentMembership ? (
                        <div className="lg:col-span-2 bg-primary-600 rounded-2xl p-6 text-white relative overflow-hidden">
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
                    ) : null
                )}

                {/* Recent Activity */}
                <div className="bg-white dark:bg-surface-800/50 rounded-2xl p-5 border border-surface-200 dark:border-surface-700/50">
                    <h2 className="font-semibold mb-3 flex items-center gap-2"><Activity className="w-5 h-5 text-accent-500" /> Recent Activity</h2>
                    <div className="space-y-3">
                        {recentLogs.length > 0 ? recentLogs.map(log => (
                            <div key={log.id} className="flex items-start gap-3 text-sm">
                                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${log.success ? 'bg-success-400' : 'bg-danger-400'}`} />
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium truncate">{isAdmin ? log.memberName : log.location}</p>
                                    <p className="text-xs text-surface-500">{log.type.replace('_', ' ')} • {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</p>
                                </div>
                            </div>
                        )) : <p className="text-sm text-surface-500">No recent activity</p>}
                    </div>
                </div>
            </div>

            {/* Admin Extra Charts */}
            {isAdmin && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-surface-800/50 rounded-2xl p-5 border border-surface-200 dark:border-surface-700/50">
                        <h3 className="text-sm font-medium text-surface-500 mb-3">QR Scans / Day</h3>
                        <MiniChart data={ANALYTICS_DATA.qrScansPerDay} color="bg-accent-500" />
                    </div>
                    <div className="bg-white dark:bg-surface-800/50 rounded-2xl p-5 border border-surface-200 dark:border-surface-700/50">
                        <h3 className="text-sm font-medium text-surface-500 mb-3">Booking Frequency</h3>
                        <MiniChart data={ANALYTICS_DATA.bookingFrequency} color="bg-success-500" />
                    </div>
                    <div className="bg-white dark:bg-surface-800/50 rounded-2xl p-5 border border-surface-200 dark:border-surface-700/50">
                        <h3 className="text-sm font-medium text-surface-500 mb-3">Membership Upgrades</h3>
                        <MiniChart data={ANALYTICS_DATA.membershipUpgrades} color="bg-warning-500" />
                    </div>
                </div>
            )}
        </div>
    );
}
