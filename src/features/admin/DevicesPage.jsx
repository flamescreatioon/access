import { MonitorSmartphone, Wifi, WifiOff, Battery, Clock } from 'lucide-react';

export default function DevicesPage() {
    const devices = [
        { id: 'd1', name: 'Main Entrance Scanner', type: 'QR Scanner', location: 'Floor 1 - Main Gate', status: 'online', battery: 95, lastPing: new Date(Date.now() - 30000).toISOString() },
        { id: 'd2', name: 'Workshop Scanner', type: 'QR Scanner', location: 'Floor 2 - Workshop', status: 'online', battery: 78, lastPing: new Date(Date.now() - 60000).toISOString() },
        { id: 'd3', name: 'Conference Scanner', type: 'QR Scanner', location: 'Floor 2 - Conference Room', status: 'online', battery: 62, lastPing: new Date(Date.now() - 120000).toISOString() },
        { id: 'd4', name: 'Recording Room Scanner', type: 'NFC Reader', location: 'Floor 3 - Recording Studio', status: 'offline', battery: 15, lastPing: new Date(Date.now() - 3600000).toISOString() },
        { id: 'd5', name: 'Back Exit Scanner', type: 'QR Scanner', location: 'Floor 1 - Back Gate', status: 'online', battery: 88, lastPing: new Date(Date.now() - 45000).toISOString() },
    ];

    return (
        <div className="space-y-6 page-enter page-enter-active">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">Devices</h1>
                <p className="text-surface-500 mt-1">{devices.filter(d => d.status === 'online').length} of {devices.length} devices online</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {devices.map(d => (
                    <div key={d.id} className="bg-white dark:bg-surface-800/50 rounded-2xl p-5 border border-surface-200 dark:border-surface-700/50 hover:shadow-lg transition-all">
                        <div className="flex items-start justify-between">
                            <div className="w-11 h-11 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                <MonitorSmartphone className="w-5 h-5 text-primary-500" />
                            </div>
                            <div className="flex items-center gap-1.5">
                                {d.status === 'online' ? <Wifi className="w-4 h-4 text-success-500" /> : <WifiOff className="w-4 h-4 text-danger-500" />}
                                <span className={`text-xs font-semibold capitalize ${d.status === 'online' ? 'text-success-500' : 'text-danger-500'}`}>{d.status}</span>
                            </div>
                        </div>
                        <h3 className="font-semibold mt-3">{d.name}</h3>
                        <p className="text-sm text-surface-500 mt-0.5">{d.type}</p>
                        <p className="text-xs text-surface-400 mt-1">📍 {d.location}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-surface-400">
                            <span className="flex items-center gap-1"><Battery className="w-3.5 h-3.5" />{d.battery}%</span>
                            <div className="flex-1 h-1.5 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${d.battery > 50 ? 'bg-success-500' : d.battery > 20 ? 'bg-warning-500' : 'bg-danger-500'}`}
                                    style={{ width: `${d.battery}%` }} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
