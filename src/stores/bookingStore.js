import { create } from 'zustand';
import api from '../lib/api';

export const useBookingStore = create((set, get) => ({
    bookings: [],
    upcomingBookings: [],
    isLoading: false,
    error: null,

    fetchBookings: async (filters = {}) => {
        set({ isLoading: true, error: null });
        try {
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            if (filters.upcoming) params.append('upcoming', 'true');
            const res = await api.get(`/bookings?${params.toString()}`);
            set({ bookings: res.data, isLoading: false });
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to load bookings', isLoading: false });
        }
    },

    fetchUpcoming: async () => {
        try {
            const res = await api.get('/bookings?upcoming=true');
            set({ upcomingBookings: res.data });
        } catch (error) {
            console.error('Error fetching upcoming bookings:', error);
        }
    },

    createBooking: async (booking) => {
        try {
            const res = await api.post('/bookings', {
                space_id: booking.space_id,
                start_time: booking.start_time,
                end_time: booking.end_time,
                title: booking.title,
                notes: booking.notes,
            });
            // Refresh lists
            get().fetchBookings();
            get().fetchUpcoming();
            return { success: true, data: res.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Booking failed',
            };
        }
    },

    cancelBooking: async (id, reason) => {
        try {
            const res = await api.delete(`/bookings/${id}`, { data: { reason } });
            get().fetchBookings();
            get().fetchUpcoming();
            return { success: true, data: res.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Cancellation failed',
            };
        }
    },

    modifyBooking: async (id, changes) => {
        try {
            const res = await api.put(`/bookings/${id}`, changes);
            get().fetchBookings();
            return { success: true, data: res.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Modification failed',
            };
        }
    },

    getBookingsForDate: (date) => {
        const d = new Date(date);
        return get().bookings.filter(b => {
            const bDate = new Date(b.start_time);
            return bDate.toDateString() === d.toDateString();
        });
    },
}));
