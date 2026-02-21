import { useState, useEffect, useCallback, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuthStore } from '../../stores/authStore';
import { useMembershipStore } from '../../stores/membershipStore';
import {
    Shield as ShieldIcon,
    Clock as ClockIcon,
    RefreshCw as RefreshIcon,
    Wifi as WifiIcon,
    WifiOff as WifiOffIcon,
    Smartphone as PhoneIcon,
    ChevronLeft as BackIcon,
    Lock as LockIcon,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';

export default function AccessCardPage() {
    const { user } = useAuthStore();
    const { currentMembership, generateQrToken, fetchCurrentMembership } = useMembershipStore();
    const [qrToken, setQrToken] = useState('');
    const [timeLeft, setTimeLeft] = useState(30);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [generating, setGenerating] = useState(false);
    const [scanFeedback, setScanFeedback] = useState(null); // { status: 'Grant'|'Deny', id: string }
    const isGenerating = useRef(false);
    const pollingRef = useRef(null);

    // Initial load of membership if missing
    useEffect(() => {
        if (!currentMembership && user?.id) {
            fetchCurrentMembership(user.id);
        }
    }, [user?.id, currentMembership, fetchCurrentMembership]);

    const generateNewToken = useCallback(async () => {
        if (isGenerating.current) return;
        isGenerating.current = true;
        setGenerating(true);
        try {
            const token = await generateQrToken();
            if (token) {
                setQrToken(token);
                setTimeLeft(30);
            }
        } finally {
            isGenerating.current = false;
            setGenerating(false);
        }
    }, [generateQrToken]);

    useEffect(() => {
        if (currentMembership?.status === 'Active') {
            generateNewToken();
            const rotationInterval = setInterval(generateNewToken, 30000);

            // Start polling for scan feedback
            const checkStatus = async () => {
                try {
                    const res = await api.get('/access/my-last-scan');
                    if (res.data.status === 'Grant' || res.data.status === 'Deny') {
                        setScanFeedback(prev => {
                            if (prev?.id === res.data.scan_id && prev?.status === res.data.status) return prev;
                            return { status: res.data.status, id: res.data.scan_id };
                        });
                        // Clear feedback after 5 seconds
                        setTimeout(() => setScanFeedback(null), 5000);
                    }
                } catch (err) {
                    console.error('Status check failed:', err);
                }
            };
            pollingRef.current = setInterval(checkStatus, 2000);

            return () => {
                clearInterval(rotationInterval);
                if (pollingRef.current) clearInterval(pollingRef.current);
            };
        }
    }, [currentMembership?.status, generateNewToken]);

    useEffect(() => {
        let countdown;
        if (currentMembership?.status === 'Active') {
            countdown = setInterval(() => {
                setTimeLeft(prev => (prev <= 1 ? 30 : prev - 1));
            }, 1000);
        }
        return () => clearInterval(countdown);
    }, [currentMembership?.status]);

    useEffect(() => {
        const onOnline = () => setIsOnline(true);
        const onOffline = () => setIsOnline(false);
        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);
        return () => {
            window.removeEventListener('online', onOnline);
            window.removeEventListener('offline', onOffline);
        };
    }, []);

    if (!currentMembership) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
                <h2 className="text-xl font-bold mb-2">Syncing Your Access</h2>
                <p className="text-surface-500 max-w-xs">Connecting to secure servers to verify your membership status...</p>
            </div>
        );
    }

    const isActive = currentMembership.status === 'Active';
    const statusColor = isActive ? 'text-success-500' : 'text-danger-500';
    const statusBg = isActive ? 'bg-success-500' : 'bg-danger-500';
    const circumference = 2 * Math.PI * 45;
    const progress = ((30 - timeLeft) / 30) * circumference;

    return (
        <div className="max-w-lg mx-auto space-y-6 page-enter page-enter-active">
            {/* Success/Denied Overlay */}
            {scanFeedback && (
                <div className="fixed inset-x-4 top-24 z-50 animate-in slide-in-from-top-10 duration-500">
                    <div className={`p-6 rounded-[2rem] shadow-2xl backdrop-blur-xl border ${scanFeedback.status === 'Grant'
                            ? 'bg-success-500/90 border-success-400 text-white'
                            : 'bg-danger-500/90 border-danger-400 text-white'
                        } flex items-center gap-4`}>
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                            {scanFeedback.status === 'Grant' ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-black text-lg leading-tight">
                                {scanFeedback.status === 'Grant' ? 'Access Granted!' : 'Access Denied'}
                            </h3>
                            <p className="text-sm opacity-90 font-medium mt-0.5">
                                {scanFeedback.status === 'Grant' ? 'Welcome to the Hub.' : 'Please talk to the manager.'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="text-center relative">
                <Link to="/dashboard" className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors">
                    <BackIcon className="w-5 h-5 text-surface-500" />
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold">Access Card</h1>
                <p className="text-surface-500 mt-1">Present this QR code at any hub scanner</p>
            </div>

            {/* Main Card */}
            <div className={`bg-white dark:bg-surface-800/50 rounded-[2.5rem] border ${isActive ? 'border-surface-200 dark:border-surface-700/50' : 'border-danger-200 dark:border-danger-900/30 ring-4 ring-danger-500/5'} shadow-2xl overflow-hidden transition-all duration-500`}>
                {/* Card Header */}
                <div className={`${isActive ? 'bg-primary-600' : 'bg-danger-600'} px-8 py-6 transition-colors duration-500`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-1">Innovation Hub Pass</p>
                            <p className="text-white font-black text-xl tracking-tight">{user?.name || 'Hub Member'}</p>
                        </div>
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur text-white text-[10px] font-black uppercase tracking-wider`}>
                            {isOnline ? <WifiIcon className="w-3.5 h-3.5" /> : <WifiOffIcon className="w-3.5 h-3.5" />}
                            <span>{isOnline ? 'Encrypted' : 'Offline'}</span>
                        </div>
                    </div>
                </div>

                {/* QR Code Section */}
                <div className="p-10 flex flex-col items-center">
                    {isActive ? (
                        <div className="relative">
                            {/* Countdown Ring */}
                            <svg className="absolute -inset-6 w-[calc(100%+48px)] h-[calc(100%+48px)]" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-surface-100 dark:text-surface-800" />
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

                            {/* QR Code Container */}
                            <div className="relative bg-white p-5 rounded-3xl shadow-lg">
                                <QRCodeSVG
                                    value={qrToken || 'waiting_for_token'}
                                    size={220}
                                    level="H"
                                    includeMargin={false}
                                    fgColor="#0f172a"
                                    bgColor="#ffffff"
                                />
                                {/* Anti-screenshot overlay (CSS based) */}
                                <div className="qr-overlay rounded-3xl" />
                            </div>
                        </div>
                    ) : (
                        <div className="py-12 px-6 text-center space-y-4">
                            <div className="w-20 h-20 bg-danger-500/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                <ShieldIcon className="w-10 h-10 text-danger-500" />
                            </div>
                            <h3 className="text-xl font-black text-danger-600 dark:text-danger-400 uppercase tracking-tight">Access Locked</h3>
                            <p className="text-sm text-surface-500 max-w-xs mx-auto font-medium">
                                Your membership is currently {currentMembership?.status?.toLowerCase() || 'inactive'}. Please contact support or renew.
                            </p>
                        </div>
                    )}

                    {isActive && (
                        <>
                            {/* Timer */}
                            <div className="flex items-center gap-2 mt-10 px-4 py-2 bg-surface-50 dark:bg-surface-900 rounded-full border border-surface-100 dark:border-surface-700">
                                <ClockIcon className="w-4 h-4 text-primary-500" />
                                <span className="text-xs font-bold text-surface-500">Refreshing in</span>
                                <span className="font-mono font-black text-primary-600 dark:text-primary-400">{timeLeft}s</span>
                            </div>

                            {/* Manual Refresh */}
                            <button
                                onClick={generateNewToken}
                                disabled={generating}
                                className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-surface-400 hover:text-primary-500 transition-colors disabled:opacity-50">
                                <RefreshIcon className={`w-3 h-3 ${generating ? 'animate-spin' : ''}`} />
                                {generating ? 'Generating...' : 'Refresh Token'}
                            </button>
                        </>
                    )}
                </div>

                {/* Status Footer */}
                <div className="border-t border-surface-100 dark:border-surface-800 px-8 py-5 bg-surface-50/50 dark:bg-surface-900/30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${statusBg} ${isActive ? 'animate-pulse' : ''}`} />
                            <span className={`text-xs font-black uppercase tracking-wider ${statusColor}`}>
                                {isActive ? 'Validated Access' : 'Inactive Account'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-surface-500">
                            <ShieldIcon className="w-4 h-4" />
                            <span className="text-xs font-bold">{currentMembership?.AccessTier?.name || 'Standard'} Tier</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Instruction Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-surface-800/50 rounded-3xl p-6 border border-surface-200 dark:border-surface-700/50 text-center space-y-2">
                    <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center mx-auto">
                        <PhoneIcon className="w-5 h-5 text-primary-500" />
                    </div>
                    <p className="text-[10px] font-bold text-surface-500 leading-tight">Hold phone 2-4 inches from the scanner lens</p>
                </div>
                <div className="bg-white dark:bg-surface-800/50 rounded-3xl p-6 border border-surface-200 dark:border-surface-700/50 text-center space-y-2">
                    <div className="w-10 h-10 bg-success-500/10 rounded-xl flex items-center justify-center mx-auto">
                        <LockIcon className="w-5 h-5 text-success-500" />
                    </div>
                    <p className="text-[10px] font-bold text-surface-500 leading-tight">Rolling tokens prevent unauthorized screenshots</p>
                </div>
            </div>
        </div>
    );
}
