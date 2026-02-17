import { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuthStore } from '../../stores/authStore';
import { useMembershipStore } from '../../stores/membershipStore';
import { generateQRToken } from '../../lib/mockData';
import { Shield, Clock, RefreshCw, Wifi, WifiOff, Smartphone } from 'lucide-react';

export default function AccessCardPage() {
    const { user } = useAuthStore();
    const { currentMembership } = useMembershipStore();
    const [qrToken, setQrToken] = useState('');
    const [timeLeft, setTimeLeft] = useState(30);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    const generateNewToken = useCallback(() => {
        const token = generateQRToken(user?.id || 'u1');
        setQrToken(token);
        setTimeLeft(30);
    }, [user?.id]);

    useEffect(() => {
        generateNewToken();
        const rotationInterval = setInterval(generateNewToken, 30000);
        return () => clearInterval(rotationInterval);
    }, [generateNewToken]);

    useEffect(() => {
        const countdown = setInterval(() => {
            setTimeLeft(prev => (prev <= 1 ? 30 : prev - 1));
        }, 1000);
        return () => clearInterval(countdown);
    }, []);

    useEffect(() => {
        const onOnline = () => setIsOnline(true);
        const onOffline = () => setIsOnline(false);
        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);
        return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
    }, []);

    const statusColor = currentMembership.status === 'active' ? 'text-success-500' : 'text-danger-500';
    const statusBg = currentMembership.status === 'active' ? 'bg-success-500' : 'bg-danger-500';
    const circumference = 2 * Math.PI * 45;
    const progress = ((30 - timeLeft) / 30) * circumference;

    return (
        <div className="max-w-lg mx-auto space-y-6 page-enter page-enter-active">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-2xl md:text-3xl font-bold">Access Card</h1>
                <p className="text-surface-500 mt-1">Present this QR code at any scanner</p>
            </div>

            {/* Main Card */}
            <div className="bg-white dark:bg-surface-800/50 rounded-3xl border border-surface-200 dark:border-surface-700/50 shadow-xl overflow-hidden">
                {/* Card Header */}
                <div className="bg-gradient-to-r from-primary-600 to-accent-600 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/80 text-sm">Innovation Hub</p>
                            <p className="text-white font-bold text-lg">{user?.firstName} {user?.lastName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur text-white text-sm`}>
                                {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                                <span>{isOnline ? 'Live' : 'Offline'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* QR Code Section */}
                <div className="p-8 flex flex-col items-center">
                    <div className="relative">
                        {/* Countdown Ring */}
                        <svg className="absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)]" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" className="text-surface-200 dark:text-surface-700" />
                            <circle
                                cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2.5"
                                className="text-primary-500"
                                strokeDasharray={circumference}
                                strokeDashoffset={progress}
                                strokeLinecap="round"
                                transform="rotate(-90 50 50)"
                                style={{ transition: 'stroke-dashoffset 1s linear' }}
                            />
                        </svg>

                        {/* QR Code */}
                        <div className="relative bg-white p-4 rounded-2xl">
                            <QRCodeSVG
                                value={qrToken || 'loading'}
                                size={200}
                                level="H"
                                includeMargin={false}
                                fgColor="#0f172a"
                                bgColor="#ffffff"
                            />
                            {/* Anti-screenshot overlay */}
                            <div className="qr-overlay rounded-2xl" />
                        </div>
                    </div>

                    {/* Timer */}
                    <div className="flex items-center gap-2 mt-6 text-sm">
                        <Clock className="w-4 h-4 text-surface-400" />
                        <span className="text-surface-500">Refreshes in</span>
                        <span className="font-mono font-bold text-primary-600 dark:text-primary-400 text-lg">{timeLeft}s</span>
                    </div>

                    {/* Manual Refresh */}
                    <button
                        onClick={generateNewToken}
                        className="mt-3 flex items-center gap-2 text-sm text-primary-500 hover:text-primary-600 transition-colors">
                        <RefreshCw className="w-4 h-4" /> Refresh Now
                    </button>
                </div>

                {/* Status Footer */}
                <div className="border-t border-surface-200 dark:border-surface-700/50 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${statusBg} pulse-dot`} />
                            <span className={`text-sm font-semibold ${statusColor}`}>
                                {currentMembership.status === 'active' ? 'Access Granted' : 'Access Denied'}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-surface-500">
                            <Shield className="w-4 h-4" />
                            <span>{currentMembership.tier.name}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-surface-800/50 rounded-2xl p-4 border border-surface-200 dark:border-surface-700/50 text-center">
                    <Smartphone className="w-6 h-6 mx-auto text-primary-500 mb-2" />
                    <p className="text-xs text-surface-500">Hold your phone near the scanner</p>
                </div>
                <div className="bg-white dark:bg-surface-800/50 rounded-2xl p-4 border border-surface-200 dark:border-surface-700/50 text-center">
                    <Shield className="w-6 h-6 mx-auto text-success-500 mb-2" />
                    <p className="text-xs text-surface-500">Token changes every 30 seconds</p>
                </div>
            </div>
        </div>
    );
}
