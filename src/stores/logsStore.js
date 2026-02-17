import { create } from 'zustand';
import { generateMockLogs } from '../lib/mockData';

const initialLogs = generateMockLogs(120);

export const useLogsStore = create((set, get) => ({
    logs: initialLogs,

    getFilteredLogs: (search, typeFilter, dateRange) => {
        let results = get().logs;
        if (search) {
            const q = search.toLowerCase();
            results = results.filter(l => l.memberName.toLowerCase().includes(q) || l.location.toLowerCase().includes(q) || l.device.toLowerCase().includes(q));
        }
        if (typeFilter && typeFilter !== 'all') {
            results = results.filter(l => l.type === typeFilter);
        }
        if (dateRange?.from) {
            results = results.filter(l => new Date(l.timestamp) >= new Date(dateRange.from));
        }
        if (dateRange?.to) {
            results = results.filter(l => new Date(l.timestamp) <= new Date(dateRange.to));
        }
        return results;
    },

    getMyLogs: (userId) => {
        return get().logs.filter(l => l.memberId === userId || !userId);
    },

    exportCSV: () => {
        const headers = ['ID', 'Type', 'Member', 'Timestamp', 'Location', 'Device', 'Success', 'Reason'];
        const rows = get().logs.map(l => [l.id, l.type, l.memberName, l.timestamp, l.location, l.device, l.success, l.reason]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `access-logs-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    },
}));
