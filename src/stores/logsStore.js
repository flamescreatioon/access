import { create } from 'zustand';
import api from '../lib/api';

export const useLogsStore = create((set, get) => ({
    logs: [],
    isLoading: false,
    error: null,

    fetchLogs: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get('/access/logs');
            const mappedLogs = response.data.map(l => ({
                id: l.id,
                type: 'qr_scan', // Backend primarily does QR for now
                memberId: l.user_id,
                memberName: l.User ? l.User.name : 'Unknown',
                timestamp: l.createdAt,
                location: 'Main Entrance', // Mock location for now or derive from device
                device: l.Device ? l.Device.name : 'Unknown Device',
                success: l.decision === 'Grant',
                reason: l.decision.startsWith('Deny') ? l.decision.split(': ')[1] : 'Access Granted'
            }));
            set({ logs: mappedLogs, isLoading: false });
        } catch (error) {
            console.error('Error fetching logs:', error);
            set({ error: error.message, isLoading: false });
        }
    },

    getFilteredLogs: (search, typeFilter, dateRange) => {
        let results = get().logs;
        if (search) {
            const q = search.toLowerCase();
            results = results.filter(l => l.memberName.toLowerCase().includes(q) || l.location.toLowerCase().includes(q) || l.device.toLowerCase().includes(q));
        }
        if (typeFilter && typeFilter !== 'all') {
            results = results.filter(l => l.type === typeFilter);
        }
        // ... date range logic ...
        return results;
    },

    getMyLogs: (userId) => {
        return get().logs.filter(l => l.memberId === userId || !userId);
    },

    exportCSV: () => {
        // ... implementation ...
        console.log('Export CSV not fully implemented in API mode yet');
    },
}));
