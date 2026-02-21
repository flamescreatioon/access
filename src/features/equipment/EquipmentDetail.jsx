import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEquipmentStore } from '../../stores/equipmentStore';
import { useBookingStore } from '../../stores/bookingStore';
import {
    ChevronLeft, Wrench, ShieldCheck, ShieldAlert, Clock, Calendar, Check, X,
    AlertTriangle, Info, BookOpen, MapPin, Timer, AlertCircle, Zap
} from 'lucide-react';
import { format, addDays } from 'date-fns';

export default function EquipmentDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentEquipment, availability, loading, fetchEquipmentById, fetchAvailability, bookEquipment, clearCurrent } = useEquipmentStore();

    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        fetchEquipmentById(id);
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

            // Enforce contiguous selection
            for (let i = 1; i < newSlots.length; i++) {
                if (newSlots[i] - newSlots[i - 1] !== 1) {
                    showToast('Select contiguous time slots');
                    return prev;
                }
            }

            // Enforce max session duration
            if (currentEquipment?.max_session_hours > 0 && newSlots.length > currentEquipment.max_session_hours) {
                showToast(`Max ${currentEquipment.max_session_hours} hours per session`);
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

        const result = await bookEquipment(id, {
            start_time: start.toISOString(),
            end_time: end.toISOString(),
            title: `Reservation: ${currentEquipment?.name}`,
        });

        setBookingLoading(false);
        setShowConfirm(false);

        if (result.success) {
            showToast('✅ Equipment booked!');
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

    if (loading || !currentEquipment) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const tierName = currentEquipment.MinTier?.name;
    const tierColor = currentEquipment.MinTier?.color || '#6366f1';
    const slots = availability?.slots || [];
    const isMaintenance = currentEquipment.status === 'maintenance';
    const isCertified = currentEquipment.isCertified;

    return (
        <div className="max-w-4xl mx-auto space-y-6 page-enter page-enter-active">
            {/* Back */}
            <button onClick={() => navigate('/equipment')}
                className="flex items-center gap-1 text-sm text-surface-500 hover:text-primary-500 transition-colors">
                <ChevronLeft className="w-4 h-4" /> All Equipment
            </button>

            {/* Header / Info Section */}
            <div className="bg-white dark:bg-surface-800/50 rounded-3xl border border-surface-200 dark:border-surface-700/50 overflow-hidden">
                <div className="h-48 md:h-64 relative bg-surface-100 dark:bg-surface-800">
                    {currentEquipment.photo ? (
                        <img src={currentEquipment.photo} alt={currentEquipment.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-surface-200 dark:text-surface-700">
                            <Wrench className="w-24 h-24 stroke-[1]" />
                        </div>
                    )}

                    {/* Floating Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {tierName && (
                            <div className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase text-white shadow-lg" style={{ backgroundColor: tierColor }}>
                                {tierName}+ Tier
                            </div>
                        )}
                        {currentEquipment.requires_certification && (
                            <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase shadow-lg flex items-center gap-1.5 backdrop-blur
                                ${isCertified ? 'bg-success-500/90 text-white' : 'bg-danger-500/90 text-white'}`}>
                                {isCertified ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                                {isCertified ? 'Certified' : 'Not Certified'}
                            </div>
                        )}
                    </div>

                    {isMaintenance && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-6 text-center">
                            <div className="text-white">
                                <AlertTriangle className="w-12 h-12 text-warning-500 mx-auto mb-3" />
                                <h2 className="text-xl font-bold">Under Maintenance</h2>
                                <p className="text-sm opacity-80 mt-1 max-w-xs">This equipment is currently unavailable due to scheduled maintenance or repairs.</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                            <span className="text-[10px] font-black uppercase text-primary-500 tracking-[0.2em] font-mono">{currentEquipment.category}</span>
                            <h1 className="text-2xl md:text-4xl font-black mt-1">{currentEquipment.name}</h1>
                            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-surface-500 font-medium">
                                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary-500/60" /> {currentEquipment.location}</span>
                                <span className="flex items-center gap-1.5"><Timer className="w-4 h-4 text-primary-500/60" /> Max {currentEquipment.max_session_hours}hrs/session</span>
                                {parseFloat(currentEquipment.hourly_cost) > 0 && (
                                    <span className="flex items-center gap-1.5 text-primary-600 dark:text-primary-400 font-bold">
                                        <Zap className="w-4 h-4 fill-current" /> ${currentEquipment.hourly_cost}/hr
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-12 gap-6">
                {/* Left: Info & Safety */}
                <div className="md:col-span-4 space-y-6">
                    {/* Description */}
                    <div className="bg-white dark:bg-surface-800/50 rounded-2xl p-6 border border-surface-200 dark:border-surface-700/50">
                        <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-primary-500" /> About
                        </h3>
                        <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed font-medium">
                            {currentEquipment.description}
                        </p>
                    </div>

                    {/* Safety Panel */}
                    <div className="bg-danger-500/5 border border-danger-500/10 rounded-2xl p-6">
                        <h3 className="font-bold text-sm mb-3 text-danger-600 dark:text-danger-400 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> Safety First
                        </h3>
                        <div className="space-y-3">
                            {currentEquipment.safety_guidelines?.split('. ').map((line, i) => (
                                <div key={i} className="flex gap-2 text-xs font-semibold text-surface-700 dark:text-surface-300 leading-normal">
                                    <span className="w-1.5 h-1.5 rounded-full bg-danger-500 mt-1.5 shrink-0" />
                                    {line}
                                </div>
                            ))}
                        </div>
                    </div>

                    {!isCertified && currentEquipment.requires_certification && (
                        <div className="bg-primary-500/10 border border-primary-500/20 rounded-2xl p-6">
                            <h3 className="font-bold text-sm mb-2 text-primary-700 dark:text-primary-300">Certification Needed</h3>
                            <p className="text-xs font-medium text-primary-600 dark:text-primary-400 mb-4 leading-relaxed">
                                You must be certified for <strong>"{currentEquipment.certification_name}"</strong> to use this equipment.
                            </p>
                            <Link to="/profile" className="text-xs font-bold text-primary-500 hover:text-primary-600 flex items-center gap-1">
                                Check my status <ChevronRight className="w-3 h-3" />
                            </Link>
                        </div>
                    )}
                </div>

                {/* Right: Booking Calendar */}
                <div className="md:col-span-8 space-y-6">
                    {/* Booking Section Container */}
                    <div className={`bg-white dark:bg-surface-800/50 rounded-3xl p-6 border-2 border-surface-200 dark:border-surface-700/50 shadow-inner
                        ${(isMaintenance || (!isCertified && currentEquipment.requires_certification)) ? 'opacity-40 grayscale pointer-events-none' : ''}`}>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <h3 className="font-black text-lg tracking-tight flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary-500" /> Choose a Time
                            </h3>

                            {/* Simple Date Select */}
                            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                                {dates.map(d => (
                                    <button key={d.value} onClick={() => { setSelectedDate(d.value); setSelectedSlots([]); }}
                                        className={`flex flex-col items-center min-w-[56px] px-3 py-2.5 rounded-xl border transition-all
                                        ${selectedDate === d.value
                                                ? 'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/20'
                                                : 'bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-500 hover:border-primary-500/50'}`}>
                                        <span className="text-[10px] font-black uppercase opacity-60 leading-none mb-1">{d.label}</span>
                                        <span className="text-lg font-black leading-none">{d.date}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Slots Grid */}
                        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                            {slots.map(slot => {
                                const isSelected = selectedSlots.includes(slot.hour);
                                return (
                                    <button key={slot.hour}
                                        onClick={() => slot.available && toggleSlot(slot.hour)}
                                        disabled={!slot.available}
                                        className={`group relative py-3 rounded-xl text-xs font-black transition-all border
                                        ${isSelected
                                                ? 'bg-primary-500 border-primary-500 text-white shadow-md scale-105 z-10'
                                                : slot.available
                                                    ? 'bg-success-500/5 border-success-500/20 text-success-700 dark:text-success-400 hover:bg-success-500/10 hover:border-success-500/40'
                                                    : 'bg-surface-100 dark:bg-surface-800/80 border-transparent text-surface-400 cursor-not-allowed grayscale'}`}>
                                        {slot.label}
                                        {isSelected && <div className="absolute -top-1 -right-1 w-3 h-3 bg-white dark:bg-surface-900 rounded-full flex items-center justify-center text-primary-500 border border-primary-500"><Check className="w-2 h-2" /></div>}
                                    </button>
                                );
                            })}
                        </div>

                        {slots.length === 0 && (
                            <div className="flex items-center justify-center py-12 text-surface-400 italic text-sm">Loading availability...</div>
                        )}

                        {/* Booking Summary Floating Panel */}
                        {selectedSlots.length > 0 && (
                            <div className="mt-8 pt-6 border-t border-surface-200 dark:border-surface-700/50 animate-in slide-in-from-bottom-2">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <span className="text-[10px] font-black text-primary-500 uppercase">Selected Slot</span>
                                        <h4 className="font-bold text-lg">
                                            {format(new Date(selectedDate), 'MMMM d')} at {Math.min(...selectedSlots)}:00
                                        </h4>
                                        <p className="text-xs text-surface-500 font-medium">{selectedSlots.length} hour session · Total: ${(parseFloat(currentEquipment.hourly_cost) * selectedSlots.length).toFixed(2)}</p>
                                    </div>
                                    <button onClick={() => setShowConfirm(true)}
                                        className="px-8 py-3.5 bg-primary-500 text-white rounded-2xl font-black text-sm hover:bg-primary-600 shadow-xl shadow-primary-500/30 transition-all flex items-center gap-2">
                                        Confirm Booking
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Confirm Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                    <div className="bg-white dark:bg-surface-800 rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/40 rounded-2xl flex items-center justify-center">
                                <Wrench className="w-6 h-6 text-primary-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black tracking-tight">Confirm Booking</h3>
                                <p className="text-sm text-surface-500 font-medium">Please review your reservation</p>
                            </div>
                        </div>

                        <div className="space-y-3 bg-surface-50 dark:bg-surface-900/50 rounded-2xl p-5 border border-surface-100 dark:border-surface-800">
                            <div className="flex justify-between items-center text-sm font-bold">
                                <span className="text-surface-500 font-medium">Date</span>
                                <span>{format(new Date(selectedDate), 'EEE, MMM d, yyyy')}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold">
                                <span className="text-surface-500 font-medium">Time</span>
                                <span>{Math.min(...selectedSlots)}:00 – {Math.max(...selectedSlots) + 1}:00</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold pt-3 border-t border-surface-200 dark:border-surface-700">
                                <span className="text-surface-900 dark:text-surface-100">Total Price</span>
                                <span className="text-primary-500 font-black text-lg">${(parseFloat(currentEquipment.hourly_cost) * selectedSlots.length).toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <button onClick={() => setShowConfirm(false)}
                                className="py-3.5 rounded-2xl border-2 border-surface-200 dark:border-surface-800 text-sm font-bold hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
                                Back
                            </button>
                            <button onClick={handleBook} disabled={bookingLoading}
                                className="py-3.5 rounded-2xl bg-primary-500 text-white text-sm font-black hover:bg-primary-600 shadow-lg shadow-primary-500/25 transition-all flex items-center justify-center gap-2">
                                {bookingLoading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <><Check className="w-4 h-4" /> Finalize</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-24 md:bottom-12 left-1/2 -translate-x-1/2 z-[100] bg-surface-900 dark:bg-surface-100 text-white dark:text-surface-900 px-8 py-4 rounded-2xl shadow-2xl text-sm font-bold flex items-center gap-3 animate-in slide-in-from-bottom-4">
                    <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                    {toast}
                </div>
            )}
        </div>
    );
}
