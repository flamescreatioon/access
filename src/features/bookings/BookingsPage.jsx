import { useState, useEffect } from 'react';
import { useBookingStore } from '../../stores/bookingStore';
import { Link } from 'react-router-dom';
import {
    CalendarDays, Clock, MapPin, X, Check, ChevronRight,
    AlertTriangle, Building, Filter, Search
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
    const space = booking.Space;
    const status = statusConfig[booking.status] || statusConfig.confirmed;
    const start = new Date(booking.start_time);
    const end = new Date(booking.end_time);
    const isUpcoming = !isPast(start) && booking.status === 'confirmed';
    const hoursUntil = (start - new Date()) / 3600000;
    const canCancel = isUpcoming && hoursUntil > 0;

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
                            {isUpcoming && hoursUntil < 2 && (
                                <span className="text-[10px] text-warning-500 font-medium flex items-center gap-0.5">
                                    <AlertTriangle className="w-3 h-3" /> Starting soon
                                </span>
                            )}
                        </div>

                        <h3 className="font-bold text-sm truncate">{booking.title || space?.name || 'Booking'}</h3>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-surface-500">
                            <span className="flex items-center gap-1">
                                <CalendarDays className="w-3 h-3" />
                                {format(start, 'EEE, MMM d')}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {format(start, 'HH:mm')} – {format(end, 'HH:mm')}
                            </span>
                            {space?.location && (
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {space.location}
                                </span>
                            )}
                        </div>

                        {isUpcoming && (
                            <p className="text-[11px] text-primary-500 font-medium mt-1.5">
                                {formatDistanceToNow(start, { addSuffix: true })}
                            </p>
                        )}
                    </div>

                    {/* Space type icon */}
                    <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                        <Building className="w-5 h-5 text-primary-500" />
                    </div>
                </div>

                {/* Actions */}
                {canCancel && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-surface-100 dark:border-surface-700/50">
                        {space && (
                            <Link to={`/spaces/${space.id}`}
                                className="flex-1 text-center py-2 rounded-xl text-xs font-medium bg-surface-50 dark:bg-surface-700/50 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
                                View Space
                            </Link>
                        )}
                        <button onClick={() => onCancel(booking.id)}
                            className="flex-1 py-2 rounded-xl text-xs font-medium text-danger-500 bg-danger-500/10 hover:bg-danger-500/20 transition-colors flex items-center justify-center gap-1">
                            <X className="w-3 h-3" /> Cancel
                        </button>
                    </div>
                )}

                {booking.status === 'cancelled' && booking.cancel_reason && (
                    <p className="text-[11px] text-surface-400 mt-2 italic">
                        Reason: {booking.cancel_reason}
                    </p>
                )}
            </div>
        </div>
    );
}

export default function BookingsPage() {
    const { bookings, isLoading, fetchBookings, cancelBooking } = useBookingStore();
    const [tab, setTab] = useState('upcoming');
    const [cancellingId, setCancellingId] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => { fetchBookings(); }, []);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3500);
    };

    const handleCancel = async (id) => {
        setCancellingId(id);
        const result = await cancelBooking(id);
        setCancellingId(null);
        if (result.success) {
            showToast(result.data?.late_cancellation
                ? '⚠️ Late cancellation recorded'
                : '✅ Booking cancelled');
        } else {
            showToast(`❌ ${result.error}`);
        }
    };

    const now = new Date();
    const upcoming = bookings.filter(b =>
        ['confirmed', 'pending'].includes(b.status) && new Date(b.start_time) > now
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

    const current = tab === 'upcoming' ? upcoming : tab === 'past' ? past : cancelled;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 page-enter page-enter-active">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">My Bookings</h1>
                    <p className="text-surface-500 mt-1">Manage your space reservations</p>
                </div>
                <Link to="/spaces"
                    className="px-4 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-bold hover:bg-primary-600 transition-colors flex items-center gap-2 justify-center shadow-lg shadow-primary-500/20">
                    <CalendarDays className="w-4 h-4" /> Book a Space
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-surface-100 dark:bg-surface-800 rounded-xl p-1">
                {tabs.map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5
                        ${tab === t.key
                                ? 'bg-white dark:bg-surface-700 shadow-sm text-primary-500'
                                : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'}`}>
                        {t.label}
                        {t.count > 0 && (
                            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold
                            ${tab === t.key ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-500' : 'bg-surface-200 dark:bg-surface-700'}`}>
                                {t.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Booking List */}
            <div className="grid sm:grid-cols-2 gap-3">
                {current.map(booking => (
                    <BookingCard key={booking.id} booking={booking} onCancel={handleCancel} />
                ))}
            </div>

            {current.length === 0 && (
                <div className="text-center py-16 text-surface-500">
                    <CalendarDays className="w-12 h-12 mx-auto text-surface-300 mb-3" />
                    <p className="text-lg font-medium">
                        {tab === 'upcoming' ? 'No upcoming bookings' : tab === 'past' ? 'No past bookings' : 'No cancelled bookings'}
                    </p>
                    {tab === 'upcoming' && (
                        <Link to="/spaces" className="text-primary-500 text-sm font-medium mt-2 inline-flex items-center gap-1 hover:gap-2 transition-all">
                            Browse available spaces <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    )}
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[51] bg-surface-900 dark:bg-surface-100 text-white dark:text-surface-900 px-6 py-3 rounded-xl shadow-2xl text-sm font-medium">
                    {toast}
                </div>
            )}
        </div>
    );
}
