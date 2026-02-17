import { create } from 'zustand';
import { generateMockBookings, ROOMS, EQUIPMENT, MEMBERSHIP_TIERS } from '../lib/mockData';

const initialBookings = generateMockBookings();

export const useBookingStore = create((set, get) => ({
    bookings: initialBookings,
    rooms: ROOMS,
    equipment: EQUIPMENT,

    addBooking: (booking) => {
        const conflicts = get().getConflicts(booking.resourceId, booking.startTime, booking.endTime);
        if (conflicts.length > 0) {
            return { success: false, error: 'Time slot conflict detected' };
        }
        const newBooking = {
            ...booking,
            id: `b${Date.now()}`,
            status: 'confirmed',
            createdAt: new Date().toISOString(),
        };
        set((state) => ({ bookings: [...state.bookings, newBooking].sort((a, b) => new Date(a.startTime) - new Date(b.startTime)) }));
        return { success: true };
    },

    cancelBooking: (id) => set((state) => ({
        bookings: state.bookings.map(b => b.id === id ? { ...b, status: 'cancelled' } : b),
    })),

    getConflicts: (resourceId, startTime, endTime) => {
        const start = new Date(startTime);
        const end = new Date(endTime);
        return get().bookings.filter(b =>
            b.resourceId === resourceId &&
            b.status !== 'cancelled' &&
            new Date(b.startTime) < end &&
            new Date(b.endTime) > start
        );
    },

    getBookingsForDate: (date) => {
        const d = new Date(date);
        return get().bookings.filter(b => {
            const bDate = new Date(b.startTime);
            return bDate.toDateString() === d.toDateString() && b.status !== 'cancelled';
        });
    },

    getMyBookings: () => get().bookings,
}));
