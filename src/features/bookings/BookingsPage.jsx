import { useState } from 'react';
import { useBookingStore } from '../../stores/bookingStore';
import { CalendarDays, Clock, MapPin, X, Check, ChevronLeft, ChevronRight, Plus, Filter } from 'lucide-react';
import { format, addDays, isSameDay, startOfDay } from 'date-fns';

const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = 8 + i;
    return { hour, label: `${hour.toString().padStart(2, '0')}:00` };
});

export default function BookingsPage() {
    const { bookings, rooms, equipment, addBooking, cancelBooking, getBookingsForDate } = useBookingStore();
    const [tab, setTab] = useState('rooms');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showModal, setShowModal] = useState(false);
    const [selectedResource, setSelectedResource] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [duration, setDuration] = useState(1);

    const days = Array.from({ length: 7 }, (_, i) => addDays(startOfDay(new Date()), i));
    const dayBookings = getBookingsForDate(selectedDate);

    const handleBookSlot = (resource, slot) => {
        setSelectedResource(resource);
        setSelectedSlot(slot);
        setShowModal(true);
    };

    const confirmBooking = () => {
        const startTime = new Date(selectedDate);
        startTime.setHours(selectedSlot.hour, 0, 0, 0);
        const endTime = new Date(startTime);
        endTime.setHours(startTime.getHours() + duration);

        const result = addBooking({
            resourceType: tab === 'rooms' ? 'room' : 'equipment',
            resourceId: selectedResource.id,
            resourceName: selectedResource.name,
            resourceEmoji: selectedResource.image,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
        });

        if (result.success) {
            setShowModal(false);
        } else {
            alert(result.error);
        }
    };

    const isSlotBooked = (resourceId, hour) => {
        return dayBookings.some(b => {
            const bStart = new Date(b.startTime).getHours();
            const bEnd = new Date(b.endTime).getHours();
            return b.resourceId === resourceId && hour >= bStart && hour < bEnd;
        });
    };

    const myUpcoming = bookings.filter(b => new Date(b.startTime) > new Date() && b.status !== 'cancelled');

    return (
        <div className="space-y-6 page-enter page-enter-active">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Bookings</h1>
                    <p className="text-surface-500 mt-1">Reserve rooms and equipment</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                {['rooms', 'equipment'].map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all capitalize
              ${tab === t ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20' : 'bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700'}`}>
                        {t}
                    </button>
                ))}
            </div>

            {/* Day Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {days.map(day => (
                    <button key={day.toISOString()} onClick={() => setSelectedDate(day)}
                        className={`flex flex-col items-center px-4 py-2.5 rounded-xl text-sm transition-all shrink-0
              ${isSameDay(selectedDate, day) ? 'bg-primary-500 text-white shadow-md' : 'bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 hover:border-primary-300'}`}>
                        <span className="text-xs opacity-70">{format(day, 'EEE')}</span>
                        <span className="font-bold">{format(day, 'd')}</span>
                    </button>
                ))}
            </div>

            {/* Resource Grid */}
            {tab === 'rooms' && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {rooms.map(room => (
                        <div key={room.id} className="bg-white dark:bg-surface-800/50 rounded-2xl border border-surface-200 dark:border-surface-700/50 overflow-hidden hover:shadow-lg transition-all">
                            <div className="p-5">
                                <div className="flex items-start justify-between">
                                    <div className="text-3xl mb-2">{room.image}</div>
                                    <span className="text-xs bg-surface-100 dark:bg-surface-700 px-2 py-1 rounded-full">Floor {room.floor}</span>
                                </div>
                                <h3 className="font-semibold">{room.name}</h3>
                                <p className="text-sm text-surface-500 mt-0.5">Capacity: {room.capacity}</p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {room.amenities.slice(0, 3).map(a => (
                                        <span key={a} className="text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full">{a}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="border-t border-surface-200 dark:border-surface-700/50 px-5 py-3">
                                <div className="flex gap-1 overflow-x-auto">
                                    {timeSlots.slice(0, 6).map(slot => {
                                        const booked = isSlotBooked(room.id, slot.hour);
                                        return (
                                            <button key={slot.hour} disabled={booked}
                                                onClick={() => handleBookSlot(room, slot)}
                                                className={`text-xs px-2 py-1 rounded-lg flex-1 min-w-[40px] transition-all
                          ${booked ? 'bg-danger-100 dark:bg-danger-900/20 text-danger-500 cursor-not-allowed' : 'bg-success-50 dark:bg-success-900/20 text-success-600 hover:bg-success-100 dark:hover:bg-success-900/40'}`}>
                                                {slot.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'equipment' && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {equipment.map(eq => (
                        <div key={eq.id} className="bg-white dark:bg-surface-800/50 rounded-2xl p-5 border border-surface-200 dark:border-surface-700/50 hover:shadow-lg transition-all">
                            <div className="text-3xl mb-3">{eq.image}</div>
                            <h3 className="font-semibold">{eq.name}</h3>
                            <div className="flex items-center justify-between mt-3">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${eq.available ? 'bg-success-100 dark:bg-success-900/20 text-success-600' : 'bg-danger-100 dark:bg-danger-900/20 text-danger-500'}`}>
                                    {eq.available ? 'Available' : 'In Use'}
                                </span>
                                {eq.available && (
                                    <button onClick={() => handleBookSlot(eq, timeSlots[0])} className="text-sm text-primary-500 hover:text-primary-600 font-medium">Reserve</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* My Bookings */}
            <div>
                <h2 className="text-lg font-semibold mb-3">My Upcoming Bookings</h2>
                {myUpcoming.length === 0 ? (
                    <p className="text-surface-500 text-sm">No upcoming bookings</p>
                ) : (
                    <div className="space-y-3">
                        {myUpcoming.map(b => (
                            <div key={b.id} className="flex items-center justify-between bg-white dark:bg-surface-800/50 rounded-xl p-4 border border-surface-200 dark:border-surface-700/50">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{b.resourceEmoji}</span>
                                    <div>
                                        <p className="font-medium text-sm">{b.resourceName}</p>
                                        <p className="text-xs text-surface-500">{format(new Date(b.startTime), 'MMM d, h:mm a')} – {format(new Date(b.endTime), 'h:mm a')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize
                    ${b.status === 'confirmed' ? 'bg-success-100 dark:bg-success-900/20 text-success-600' : b.status === 'pending' ? 'bg-warning-100 dark:bg-warning-900/20 text-warning-600' : 'bg-surface-100 text-surface-500'}`}>
                                        {b.status}
                                    </span>
                                    {b.status !== 'cancelled' && (
                                        <button onClick={() => cancelBooking(b.id)} className="p-1.5 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-900/20 text-danger-500 transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Booking Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-surface-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-lg font-bold mb-4">Confirm Booking</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-700/50 rounded-xl">
                                <span className="text-2xl">{selectedResource?.image}</span>
                                <div>
                                    <p className="font-medium">{selectedResource?.name}</p>
                                    <p className="text-sm text-surface-500">{format(selectedDate, 'EEEE, MMMM d')}</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-surface-500 mb-1 block">Start Time</label>
                                    <p className="font-semibold">{selectedSlot?.label}</p>
                                </div>
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-surface-500 mb-1 block">Duration</label>
                                    <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}
                                        className="w-full p-2 rounded-xl border border-surface-200 dark:border-surface-700 bg-transparent">
                                        {[1, 2, 3, 4].map(d => <option key={d} value={d}>{d} hour{d > 1 ? 's' : ''}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowModal(false)}
                                className="flex-1 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 text-sm font-medium hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors">
                                Cancel
                            </button>
                            <button onClick={confirmBooking}
                                className="flex-1 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors shadow-md shadow-primary-500/20">
                                Confirm Booking
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
