import { create } from 'zustand';
import api from '../lib/api';
import { ROOMS, EQUIPMENT } from '../lib/mockData';

export const useBookingStore = create((set, get) => ({
    bookings: [],
    rooms: ROOMS,
    equipment: EQUIPMENT,
    isLoading: false,
    error: null,

    fetchBookings: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get('/bookings');
            // Enrich with resource details from mock data
            const enrichedBookings = response.data.map(b => {
                const resource = [...ROOMS, ...EQUIPMENT].find(r => r.id === b.resource_id) || { name: 'Unknown', image: '❓' };
                return {
                    ...b,
                    id: b.id,
                    startTime: b.start_time,
                    endTime: b.end_time,
                    resourceId: b.resource_id,
                    resourceName: resource.name,
                    resourceEmoji: resource.image,
                    status: b.status || 'confirmed' // Backend doesn't have status col yet? 
                    // Actually Booking model doesn't have status, assuming all valid bookings are confirmed.
                    // Wait, I should check Booking model.
                };
            });
            set({ bookings: enrichedBookings, isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    addBooking: async (booking) => {
        try {
            const response = await api.post('/bookings', {
                resource_id: booking.resourceId,
                start_time: booking.startTime,
                end_time: booking.endTime
            });

            // Re-fetch to update list
            get().fetchBookings();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Booking failed' };
        }
    },

    cancelBooking: async (id) => {
        try {
            await api.delete(`/bookings/${id}`);
            get().fetchBookings();
        } catch (error) {
            console.error(error);
        }
    },

    // Helper for UI (still useful for optimistic checks or finding conflicts in UI before submit)
    // But relying on backend for real conflict check
    getConflicts: (resourceId, startTime, endTime) => {
        const start = new Date(startTime);
        const end = new Date(endTime);
        return get().bookings.filter(b =>
            b.resourceId === resourceId &&
            new Date(b.startTime) < end &&
            new Date(b.endTime) > start
        );
    },

    getBookingsForDate: (date) => {
        const d = new Date(date);
        return get().bookings.filter(b => {
            const bDate = new Date(b.startTime);
            return bDate.toDateString() === d.toDateString();
        });
    },

    getMyBookings: () => get().bookings,
}));
