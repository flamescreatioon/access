import { useState, useEffect } from 'react';
import { useBookingStore } from '../../stores/bookingStore';
import { useAuthStore } from '../../stores/authStore';
import { Link } from 'react-router-dom';
import {
    CalendarDays, Clock, MapPin, X, Check, ChevronRight,
    AlertTriangle, Building, Filter, Search, Users, Wrench,
    CheckCircle, XCircle, MoreVertical, Edit2
} from 'lucide-react';
import { format, formatDistanceToNow, isPast } from 'date-fns';

const statusConfig = {
    confirmed: { label: 'Confirmed', color: 'bg-success-500', textColor: 'text-success-500', bg: 'bg-success-500/10' },
    pending: { label: 'Pending', color: 'bg-warning-500', textColor: 'text-warning-500', bg: 'bg-warning-500/10' },
    cancelled: { label: 'Cancelled', color: 'bg-danger-500', textColor: 'text-danger-500', bg: 'bg-danger-500/10' },
    completed: { label: 'Completed', color: 'bg-surface-400', textColor: 'text-surface-500', bg: 'bg-surface-100 dark:bg-surface-700/50' },
    no_show: { label: 'No Show', color: 'bg-danger-500', textColor: 'text-danger-500', bg: 'bg-danger-500/10' },
};

function BookingCard({ booking, onCancel }) {
    const resource = booking.Space || booking.Equipment;
    const type = booking.type === 'space' ? 'Space' : 'Equipment';
    const status = statusConfig[booking.status] || statusConfig.confirmed;
    const start = new Date(booking.start_time);
    const end = new Date(booking.end_time);
    const isUpcoming = !isPast(start) && booking.status === 'confirmed';
    const hoursUntil = (start - new Date()) / 3600000;
    const canCancel = ['confirmed', 'pending'].includes(booking.status) && !isPast(end);

    return (
        <div className={`bg-white dark:bg-surface-800/50 rounded-2xl border border-surface-200 dark:border-surface-700/50 overflow-hidden transition-all hover:shadow-md ${booking.status === 'cancelled' ? 'opacity-60' : ''}`}>
            <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${status.bg} ${status.textColor}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${status.color}`} />
                                {status.label}
                            </span>
                            <span className="text-[10px] font-bold uppercase py-0.5 px-1.5 bg-surface-100 dark:bg-surface-700 text-surface-500 rounded">
                                {type}
                            </span>
                        </div>

                        <h3 className="font-bold text-sm truncate">{booking.title || resource?.name || 'Booking'}</h3>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-surface-500">
                            <span className="flex items-center gap-1">
                                <CalendarDays className="w-3 h-3" />
                                {format(start, 'EEE, MMM d')}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {format(start, 'HH:mm')} – {format(end, 'HH:mm')}
                            </span>
                            {resource?.location && (
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {resource.location}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                        {booking.type === 'space' ? <Building className="w-5 h-5 text-primary-500" /> : <Wrench className="w-5 h-5 text-primary-500" />}
                    </div>
                </div>

                {canCancel && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-surface-100 dark:border-surface-700/50">
                        <button onClick={() => onCancel(booking.id)}
                            className="flex-1 py-1.5 rounded-xl text-xs font-medium text-danger-500 bg-danger-500/10 hover:bg-danger-500/20 transition-colors flex items-center justify-center gap-1">
                            <X className="w-3 h-3" /> Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function AdminBookingCard({ booking, onUpdateStatus, onEdit }) {
    const resource = booking.Space || booking.Equipment;
    const user = booking.User;
    const status = statusConfig[booking.status] || statusConfig.confirmed;
    const start = new Date(booking.start_time);
    const end = new Date(booking.end_time);

    return (
        <div className="bg-white dark:bg-surface-800/50 rounded-2xl border border-surface-200 dark:border-surface-700/50 p-4 transition-all hover:border-primary-500/30 group">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${status.bg} ${status.textColor}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${status.color}`} />
                            {status.label}
                        </span>
                        <span className="text-[10px] font-bold uppercase py-0.5 px-1.5 bg-surface-100 dark:bg-surface-700 text-surface-500 rounded">
                            {booking.type}
                        </span>
                    </div>

                    <h3 className="font-bold text-base text-surface-900 dark:text-white truncate">
                        {booking.title || resource?.name}
                    </h3>

                    <div className="flex items-center gap-2 mt-1 text-sm text-surface-600 dark:text-surface-400">
                        <div className="w-5 h-5 rounded-full bg-surface-200 dark:bg-surface-700 flex items-center justify-center text-[10px] font-bold">
                            {user?.name?.charAt(0)}
                        </div>
                        <span className="font-medium truncate">{user?.name}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs text-surface-500">
                        <div className="flex items-center gap-2">
                            <CalendarDays className="w-3.5 h-3.5" />
                            {format(start, 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" />
                            {format(start, 'HH:mm')} - {format(end, 'HH:mm')}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    {booking.status === 'pending' && (
                        <>
                            <button onClick={() => onUpdateStatus(booking.id, 'confirmed')}
                                className="p-2 rounded-lg bg-success-500/10 text-success-500 hover:bg-success-500 hover:text-white transition-all shadow-sm"
                                title="Approve">
                                <CheckCircle className="w-5 h-5" />
                            </button>
                            <button onClick={() => onUpdateStatus(booking.id, 'cancelled', 'Rejected by Admin')}
                                className="p-2 rounded-lg bg-danger-500/10 text-danger-500 hover:bg-danger-500 hover:text-white transition-all shadow-sm"
                                title="Reject">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </>
                    )}
                    {booking.status === 'confirmed' && !isPast(start) && (
                        <button onClick={() => onUpdateStatus(booking.id, 'cancelled', 'Cancelled by Admin')}
                            className="p-2 rounded-lg bg-danger-500/10 text-danger-500 hover:bg-danger-500 hover:text-white transition-all shadow-sm"
                            title="Cancel Booking">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                    {onEdit && ['Admin'].includes(user?.role) && (
                        <button onClick={() => onEdit(booking)}
                            className="p-2 rounded-lg bg-primary-500/10 text-primary-500 hover:bg-primary-500 hover:text-white transition-all shadow-sm"
                            title="Edit">
                            <Edit2 className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {booking.notes && (
                <div className="mt-3 pt-3 border-t border-surface-100 dark:border-surface-700/50">
                    <p className="text-xs text-surface-500 italic">"{booking.notes}"</p>
                </div>
            )}
        </div>
    );
}

export default function BookingsPage() {
    const {
        bookings, adminBookings, isLoading,
        fetchBookings, fetchAllBookings,
        cancelBooking, updateBookingStatus
    } = useBookingStore();
    const { user } = useAuthStore();

    const [view, setView] = useState('user'); // 'user' or 'admin'
    const [tab, setTab] = useState('upcoming');
    const [adminFilter, setAdminFilter] = useState({ status: 'pending', type: '' });
    const [toast, setToast] = useState(null);

    const isAdmin = ['Admin', 'Hub Manager'].includes(user?.role);

    useEffect(() => {
        if (view === 'user') {
            fetchBookings();
        } else {
            fetchAllBookings(adminFilter);
        }
    }, [view, adminFilter]);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3500);
    };

    const handleCancel = async (id) => {
        const result = await cancelBooking(id);
        if (result.success) {
            showToast('Booking cancelled');
            fetchBookings();
        } else {
            showToast(result.error);
        }
    };

    const handleUpdateStatus = async (id, status, notes = '') => {
        const result = await updateBookingStatus(id, status, notes);
        if (result.success) {
            showToast('Booking updated');
            if (isAdmin) fetchAllBookings(adminFilter);
            else fetchBookings();
        } else {
            showToast(result.error);
        }
    };
    const handleEdit = (booking) => {
        // Implementation for edit modal if needed, otherwise just toast
        showToast('Edit feature coming soon in detailed modal');
    };

    const now = new Date();
    const upcoming = bookings.filter(b =>
        ['confirmed', 'pending'].includes(b.status) && new Date(b.end_time) > now
    );
    const past = bookings.filter(b =>
        b.status === 'completed' || (b.status === 'confirmed' && new Date(b.end_time) < now)
    );
    const cancelled = bookings.filter(b => b.status === 'cancelled');

    const tabs = [
        { key: 'upcoming', label: 'Upcoming', count: upcoming.length },
        { key: 'past', label: 'Past', count: past.length },
        { key: 'cancelled', label: 'Cancelled', count: cancelled.length },
    ];

    const currentBookings = tab === 'upcoming' ? upcoming : tab === 'past' ? past : cancelled;

    if (isLoading && view === 'user') {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 page-enter page-enter-active pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">
                        {view === 'admin' ? 'Hub Management: Bookings' : 'My Bookings'}
                    </h1>
                    <p className="text-surface-500 mt-1">
                        {view === 'admin' ? 'Review and manage all hub reservations' : 'Manage your space and equipment reservations'}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {isAdmin && (
                        <div className="flex p-1 bg-surface-100 dark:bg-surface-800 rounded-xl">
                            <button onClick={() => setView('user')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5
                                ${view === 'user' ? 'bg-white dark:bg-surface-700 shadow-sm text-primary-500' : 'text-surface-500'}`}>
                                <Clock className="w-3.5 h-3.5" /> Personal
                            </button>
                            <button onClick={() => setView('admin')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5
                                ${view === 'admin' ? 'bg-white dark:bg-surface-700 shadow-sm text-primary-500' : 'text-surface-500'}`}>
                                <Building className="w-3.5 h-3.5" /> Manage All
                            </button>
                        </div>
                    )}
                    <Link to="/spaces"
                        className="px-4 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-bold hover:bg-primary-600 transition-all flex items-center gap-2 justify-center shadow-lg shadow-primary-500/20 active:scale-95">
                        <CalendarDays className="w-4 h-4" /> New Booking
                    </Link>
                </div>
            </div>

            {view === 'user' ? (
                <>
                    {/* User Tabs */}
                    <div className="flex gap-1 bg-surface-100 dark:bg-surface-800 rounded-xl p-1 max-w-md">
                        {tabs.map(t => (
                            <button key={t.key} onClick={() => setTab(t.key)}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5
                                ${tab === t.key
                                        ? 'bg-white dark:bg-surface-700 shadow-sm text-primary-500'
                                        : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'}`}>
                                {t.label}
                                {t.count > 0 && (
                                    <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black leading-none
                                    ${tab === t.key ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-500' : 'bg-surface-200 dark:bg-surface-700'}`}>
                                        {t.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {currentBookings.map(booking => (
                            <BookingCard key={booking.id} booking={booking} onCancel={handleCancel} />
                        ))}
                    </div>

                    {currentBookings.length === 0 && (
                        <div className="text-center py-20 bg-surface-50 dark:bg-surface-800/20 rounded-3xl border border-dashed border-surface-200 dark:border-surface-700">
                            <CalendarDays className="w-12 h-12 mx-auto text-surface-300 mb-4" />
                            <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-1">No bookings found</h3>
                            <p className="text-surface-500 max-w-xs mx-auto text-sm">
                                {tab === 'upcoming' ? "You don't have any active reservations right now." : "Your history is empty."}
                            </p>
                            {tab === 'upcoming' && (
                                <Link to="/spaces" className="mt-6 inline-flex text-primary-500 font-bold items-center gap-2 hover:gap-3 transition-all text-sm px-6 py-2 rounded-xl bg-primary-50 dark:bg-primary-900/10">
                                    Start booking now <ChevronRight className="w-4 h-4" />
                                </Link>
                            )}
                        </div>
                    )}
                </>
            ) : (
                <div className="space-y-6">
                    {/* Admin Filters */}
                    <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-surface-800/50 p-4 rounded-2xl border border-surface-200 dark:border-surface-700/50">
                        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                            <Filter className="w-4 h-4 text-surface-400" />
                            <select
                                value={adminFilter.status}
                                onChange={(e) => setAdminFilter({ ...adminFilter, status: e.target.value })}
                                className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer w-full">
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                            <Search className="w-4 h-4 text-surface-400" />
                            <select
                                value={adminFilter.type}
                                onChange={(e) => setAdminFilter({ ...adminFilter, type: e.target.value })}
                                className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer w-full">
                                <option value="">All Types</option>
                                <option value="space">Spaces Only</option>
                                <option value="equipment">Equipment Only</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {adminBookings.map(booking => (
                            <AdminBookingCard
                                key={`admin-${booking.id}`}
                                booking={booking}
                                onUpdateStatus={handleUpdateStatus}
                                onEdit={handleEdit}
                            />
                        ))}
                    </div>

                    {adminBookings.length === 0 && !isLoading && (
                        <div className="text-center py-20">
                            <Search className="w-12 h-12 mx-auto text-surface-300 mb-4" />
                            <p className="text-surface-500">No bookings match your current filters.</p>
                        </div>
                    )}

                    {isLoading && (
                        <div className="text-center py-12">
                            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        </div>
                    )}
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-surface-900 dark:bg-surface-100 text-white dark:text-surface-900 px-6 py-3 rounded-2xl shadow-2xl text-sm font-bold animate-enter">
                    {toast}
                </div>
            )}
        </div>
    );
}
