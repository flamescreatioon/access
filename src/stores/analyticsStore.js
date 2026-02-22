import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

export const useAnalyticsStore = create(
    persist(
        (set) => ({
            stats: {
                totalMembers: 0,
                activeToday: 0,
                totalBookings: 0,
                securityFailures: 0,
                insideNow: 0,
                capacityLimit: 200
            },
            growthData: [],
            entryTrends: [],
            userImpact: {
                logsCount: 0,
                uniqueEquipmentCount: 0,
                totalBookings: 0,
                estimatedHours: 0,
                utilizationRate: 0
            },
            isLoading: false,
            error: null,

            fetchStats: async () => {
                set({ isLoading: true });
                try {
                    const res = await api.get('/analytics/stats');
                    set({ stats: res.data, isLoading: false });
                } catch (err) {
                    set({ error: 'Failed to fetch analytics stats', isLoading: false });
                }
            },

            fetchUserImpact: async () => {
                set({ isLoading: true });
                try {
                    const res = await api.get('/analytics/user-impact');
                    set({ userImpact: res.data, isLoading: false });
                } catch (err) {
                    set({ error: 'Failed to fetch user impact', isLoading: false });
                }
            },

            fetchGrowthData: async () => {
                try {
                    const res = await api.get('/analytics/growth');
                    set({ growthData: res.data });
                } catch (err) {
                    console.error('Error fetching growth data:', err);
                }
            },

            fetchEntryTrends: async () => {
                try {
                    const res = await api.get('/analytics/trends');
                    set({ entryTrends: res.data });
                } catch (err) {
                    console.error('Error fetching entry trends:', err);
                }
            },

            fetchAllAnalytics: async () => {
                set({ isLoading: true });
                try {
                    const [stats, growth, trends] = await Promise.all([
                        api.get('/analytics/stats'),
                        api.get('/analytics/growth'),
                        api.get('/analytics/trends')
                    ]);
                    set({
                        stats: stats.data,
                        growthData: growth.data,
                        entryTrends: trends.data,
                        isLoading: false
                    });
                } catch (err) {
                    set({ error: 'Failed to fetch analytics data', isLoading: false });
                }
            }
        }),
        {
            name: 'analytics-storage',
        }
    )
);
