import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSpaceStore } from '../../stores/spaceStore';
import { useBookingStore } from '../../stores/bookingStore';
import {
    ChevronLeft, Users, MapPin, Clock, Calendar, Check, X,
    Shield, Star, Wifi, Monitor, Coffee, Info, AlertTriangle, Zap
} from 'lucide-react';
import { format, addDays } from 'date-fns';

export default function SpaceDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentSpace, availability, loading, fetchSpaceById, fetchAvailability, clearCurrent } = useSpaceStore();
    const { createBooking } = useBookingStore();

    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        fetchSpaceById(id);
        return () => clearCurrent();
    }, [id]);

    useEffect(() => {
        if (id && selectedDate) fetchAvailability(id, selectedDate);
    }, [id, selectedDate]);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3500);
    };

    const toggleSlot = (hour) => {
        setSelectedSlots(prev => {
            if (prev.includes(hour)) return prev.filter(h => h !== hour);
            const newSlots = [...prev, hour].sort((a, b) => a - b);
            // Enforce contiguous
            for (let i = 1; i < newSlots.length; i++) {
                if (newSlots[i] - newSlots[i - 1] !== 1) {
                    showToast('Select contiguous time slots');
                    return prev;
                }
            }
            // Enforce max hours
            if (currentSpace?.max_booking_hours > 0 && newSlots.length > currentSpace.max_booking_hours) {
                showToast(`Max ${currentSpace.max_booking_hours} hours per booking`);
                return prev;
            }
            return newSlots;
        });
    };

    const handleBook = async () => {
        if (selectedSlots.length === 0) return;
        setBookingLoading(true);

        const startHour = Math.min(...selectedSlots);
        const endHour = Math.max(...selectedSlots) + 1;

        const start = new Date(selectedDate);
        start.setHours(startHour, 0, 0, 0);
        const end = new Date(selectedDate);
        end.setHours(endHour, 0, 0, 0);

        const result = await createBooking({
            space_id: parseInt(id),
            start_time: start.toISOString(),
            end_time: end.toISOString(),
            title: currentSpace?.name,
        });

        setBookingLoading(false);
        setShowConfirm(false);

        if (result.success) {
            showToast('✅ Booking confirmed!');
            setSelectedSlots([]);
            fetchAvailability(id, selectedDate);
        } else {
            showToast(`❌ ${result.error}`);
        }
    };

    // Date picker (7 days)
    const dates = Array.from({ length: 7 }, (_, i) => {
        const d = addDays(new Date(), i);
        return { value: format(d, 'yyyy-MM-dd'), label: format(d, 'EEE'), date: format(d, 'd'), month: format(d, 'MMM') };
    });

    if (loading || !currentSpace) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const amenities = Array.isArray(currentSpace.amenities) ? currentSpace.amenities : [];
    const tierName = currentSpace.MinTier?.name;
    const tierColor = currentSpace.MinTier?.color || '#6366f1';
    const slots = availability?.slots || [];

    return (
        <div className="max-w-4xl mx-auto space-y-6 page-enter page-enter-active">
            {/* Back */}
            <button onClick={() => navigate('/spaces')}
                className="flex items-center gap-1 text-sm text-surface-500 hover:text-primary-500 transition-colors">
                <ChevronLeft className="w-4 h-4" /> All Spaces
            </button>

            {/* Header */}
            <div className="bg-white dark:bg-surface-800/50 rounded-3xl border border-surface-200 dark:border-surface-700/50 overflow-hidden">
                <div className="h-48 md:h-56 relative" style={{
                    background: `linear-gradient(135deg, ${tierColor}30, ${tierColor}60)`,
                }}>
                    {tierName && (
                        <div className="absolute top-4 right-4 px-3 py-1.5 rounded-xl text-sm font-bold bg-white/90 dark:bg-surface-800/90 backdrop-blur"
                            style={{ color: tierColor }}>
                            <Shield className="w-3.5 h-3.5 inline-block mr-1" />
                            {tierName}+ Required
                        </div>
                    )}
                </div>

                <div className="p-6 -mt-12 relative">
                    <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-lg p-6 border border-surface-100 dark:border-surface-700/50">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold">{currentSpace.name}</h1>
                                <div className="flex items-center gap-4 mt-2 text-sm text-surface-500">
                                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {currentSpace.location}</span>
                                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {currentSpace.capacity} people</span>
                                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Max {currentSpace.max_booking_hours}hrs</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold">
                                    {parseFloat(currentSpace.hourly_rate) > 0
                                        ? <>${currentSpace.hourly_rate}<span className="text-sm font-normal text-surface-500">/hr</span></>
                                        : <span className="text-success-500">Free</span>}
                                </div>
                            </div>
                        </div>

                        <p className="mt-4 text-surface-600 dark:text-surface-400 text-sm leading-relaxed">{currentSpace.description}</p>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Left: Info */}
                <div className="space-y-4">
                    {/* Amenities */}
                    <div className="bg-white dark:bg-surface-800/50 rounded-2xl p-5 border border-surface-200 dark:border-surface-700/50">
                        <h3 className="font-semibold text-sm mb-3">Amenities</h3>
                        <div className="space-y-2">
                            {amenities.map((a, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                                    <Check className="w-3.5 h-3.5 text-success-500 shrink-0" />
                                    {a}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Rules */}
                    {currentSpace.rules && (
                        <div className="bg-warning-500/5 rounded-2xl p-5 border border-warning-500/20">
                            <h3 className="font-semibold text-sm mb-2 flex items-center gap-1.5">
                                <Info className="w-4 h-4 text-warning-500" /> Rules
                            </h3>
                            <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">{currentSpace.rules}</p>
                        </div>
                    )}
                </div>

                {/* Right: Booking */}
                <div className="md:col-span-2 space-y-4">
                    {/* Date Picker */}
                    <div className="bg-white dark:bg-surface-800/50 rounded-2xl p-5 border border-surface-200 dark:border-surface-700/50">
                        <h3 className="font-semibold text-sm mb-3 flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-primary-500" /> Select Date
                        </h3>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {dates.map(d => (
                                <button key={d.value} onClick={() => { setSelectedDate(d.value); setSelectedSlots([]); }}
                                    className={`flex flex-col items-center px-4 py-3 rounded-xl text-sm transition-all shrink-0
                                    ${selectedDate === d.value
                                            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                                            : 'bg-surface-50 dark:bg-surface-700/50 hover:bg-surface-100 dark:hover:bg-surface-700'}`}>
                                    <span className="text-[10px] uppercase opacity-70">{d.label}</span>
                                    <span className="text-lg font-bold">{d.date}</span>
                                    <span className="text-[10px] opacity-60">{d.month}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Time Slots */}
                    <div className="bg-white dark:bg-surface-800/50 rounded-2xl p-5 border border-surface-200 dark:border-surface-700/50">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-sm flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-primary-500" /> Time Slots
                            </h3>
                            {selectedSlots.length > 0 && (
                                <span className="text-xs text-primary-500 font-medium">
                                    {selectedSlots.length} hr{selectedSlots.length > 1 ? 's' : ''} selected
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                            {slots.map(slot => {
                                const isSelected = selectedSlots.includes(slot.hour);
                                return (
                                    <button key={slot.hour}
                                        onClick={() => slot.available && toggleSlot(slot.hour)}
                                        disabled={!slot.available}
                                        className={`py-3 rounded-xl text-sm font-medium transition-all
                                        ${isSelected
                                                ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20 scale-[1.02]'
                                                : slot.available
                                                    ? 'bg-success-500/10 text-success-700 dark:text-success-400 hover:bg-success-500/20'
                                                    : 'bg-surface-100 dark:bg-surface-700/50 text-surface-400 cursor-not-allowed line-through'}`}>
                                        {slot.label}
                                    </button>
                                );
                            })}
                        </div>

                        {slots.length === 0 && (
                            <p className="text-center text-sm text-surface-400 py-8">Loading availability...</p>
                        )}

                        {/* Legend */}
                        <div className="flex items-center gap-4 mt-4 text-[10px] text-surface-400">
                            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-success-500/10 border border-success-500/30" /> Available</span>
                            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-primary-500" /> Selected</span>
                            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-surface-200 dark:bg-surface-700" /> Booked</span>
                        </div>
                    </div>

                    {/* Book Button */}
                    {selectedSlots.length > 0 && (
                        <div className="bg-white dark:bg-surface-800/50 rounded-2xl p-5 border border-surface-200 dark:border-surface-700/50 animate-in slide-in-from-bottom-4">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-sm font-semibold">Booking Summary</p>
                                    <p className="text-xs text-surface-500 mt-0.5">
                                        {format(new Date(selectedDate), 'EEEE, MMM d')} · {Math.min(...selectedSlots)}:00 – {Math.max(...selectedSlots) + 1}:00
                                    </p>
                                </div>
                                <div className="text-right">
                                    {parseFloat(currentSpace.hourly_rate) > 0 && (
                                        <p className="text-lg font-bold">${(parseFloat(currentSpace.hourly_rate) * selectedSlots.length).toFixed(2)}</p>
                                    )}
                                </div>
                            </div>

                            <button onClick={() => setShowConfirm(true)}
                                className="w-full py-3.5 rounded-xl bg-primary-500 text-white font-bold text-sm hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2">
                                <Calendar className="w-4 h-4" /> Confirm Booking
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirm Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-surface-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-lg font-bold mb-1">Confirm Booking</h3>
                        <div className="space-y-2 mt-4 text-sm">
                            <div className="flex justify-between"><span className="text-surface-500">Space</span><span className="font-medium">{currentSpace.name}</span></div>
                            <div className="flex justify-between"><span className="text-surface-500">Date</span><span className="font-medium">{format(new Date(selectedDate), 'MMM d, yyyy')}</span></div>
                            <div className="flex justify-between"><span className="text-surface-500">Time</span><span className="font-medium">{Math.min(...selectedSlots)}:00 – {Math.max(...selectedSlots) + 1}:00</span></div>
                            <div className="flex justify-between"><span className="text-surface-500">Duration</span><span className="font-medium">{selectedSlots.length} hour{selectedSlots.length > 1 ? 's' : ''}</span></div>
                            {parseFloat(currentSpace.hourly_rate) > 0 && (
                                <div className="flex justify-between pt-2 border-t border-surface-200 dark:border-surface-700">
                                    <span className="font-semibold">Total</span>
                                    <span className="font-bold text-primary-500">${(parseFloat(currentSpace.hourly_rate) * selectedSlots.length).toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowConfirm(false)}
                                className="flex-1 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 text-sm font-medium">
                                Cancel
                            </button>
                            <button onClick={handleBook} disabled={bookingLoading}
                                className="flex-1 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-bold hover:bg-primary-600 transition-colors flex items-center justify-center gap-2">
                                {bookingLoading
                                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    : <><Check className="w-4 h-4" /> Book Now</>}
                            </button>
                        </div>
                    </div>
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
