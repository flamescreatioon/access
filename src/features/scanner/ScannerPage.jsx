import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { ROLES } from '../../lib/mockData';
import {
    Camera, Zap, ZapOff, X, Check, Ban, AlertTriangle,
    Shield, Crown, Clock, User, Keyboard, RotateCcw, ChevronRight
} from 'lucide-react';

/* ───── Scan Result Overlay ───── */
function ScanResultOverlay({ result, onDecision, loading }) {
    if (!result) return null;

    const isValid = result.status === 'VALID';
    const isDenied = result.status === 'DENIED';

    const denyReasons = {
        expired_membership: 'Membership Expired',
        suspended_membership: 'Membership Suspended',
        no_membership: 'No Membership',
        expired_token: 'QR Code Expired',
        invalid_token: 'Invalid QR Code',
        user_not_found: 'Member Not Found',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 pb-28 md:pb-4">
            <div className={`w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 ${isValid
                ? 'bg-gradient-to-br from-success-500 to-success-600'
                : isDenied
                    ? 'bg-gradient-to-br from-danger-500 to-danger-600'
                    : 'bg-gradient-to-br from-warning-500 to-warning-600'
                }`}>
                {/* Status Header */}
                <div className="px-6 pt-6 pb-4 text-center text-white">
                    <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-3 ${isValid ? 'bg-white/20' : 'bg-white/20'}`}>
                        {isValid ? <Check className="w-8 h-8" /> : <Ban className="w-8 h-8" />}
                    </div>
                    <h2 className="text-2xl font-bold">
                        {isValid ? 'VERIFIED' : isDenied ? 'DENIED' : 'ERROR'}
                    </h2>
                    {isDenied && (
                        <p className="mt-1 text-white/80 text-sm">
                            {denyReasons[result.reason] || result.message}
                        </p>
                    )}
                </div>

                {/* Member Info (when valid) */}
                {(isValid || result.member) && result.member && (
                    <div className="mx-4 bg-white dark:bg-surface-800 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold">
                                {(result.member.name || '?').split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-bold text-surface-900 dark:text-surface-100">{result.member.name}</h3>
                                <p className="text-xs text-surface-500">{result.member.email}</p>
                            </div>
                        </div>

                        {result.membership && (
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-surface-50 dark:bg-surface-700/50 rounded-xl p-2.5">
                                    <p className="text-[10px] text-surface-400 uppercase tracking-wider">Tier</p>
                                    <p className="font-semibold text-sm flex items-center gap-1 mt-0.5">
                                        <Crown className="w-3.5 h-3.5" style={{ color: '#eab308' }} />
                                        {result.membership.tier || 'N/A'}
                                    </p>
                                </div>
                                <div className="bg-surface-50 dark:bg-surface-700/50 rounded-xl p-2.5">
                                    <p className="text-[10px] text-surface-400 uppercase tracking-wider">Status</p>
                                    <p className={`font-semibold text-sm mt-0.5 ${result.membership.status === 'Active' ? 'text-success-500' : 'text-danger-500'}`}>
                                        {result.membership.status}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="p-4 space-y-2">
                    {isValid ? (
                        <div className="flex gap-2">
                            <button onClick={() => onDecision('DENY')} disabled={loading}
                                className="flex-1 py-3.5 rounded-xl bg-white/20 text-white font-semibold text-sm hover:bg-white/30 transition-colors flex items-center justify-center gap-2">
                                <Ban className="w-4 h-4" /> Deny Entry
                            </button>
                            <button onClick={() => onDecision('GRANT')} disabled={loading}
                                className="flex-[2] py-3.5 rounded-xl bg-white text-success-600 font-bold text-sm hover:bg-white/90 transition-colors shadow-lg flex items-center justify-center gap-2">
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-success-600 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <><Check className="w-5 h-5" /> Grant Entry</>
                                )}
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => onDecision('DISMISS')}
                            className="w-full py-3.5 rounded-xl bg-white/20 text-white font-semibold text-sm hover:bg-white/30 transition-colors">
                            Dismiss
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════ */
/* ───── SCANNER PAGE ────────────────── */
/* ═══════════════════════════════════════ */

export default function ScannerPage() {
    const { user } = useAuthStore();
    const isAdmin = user?.role === ROLES.ADMIN;
    const [deviceStatus, setDeviceStatus] = useState(null);
    const [deviceLoading, setDeviceLoading] = useState(true);
    const [scanning, setScanning] = useState(false);
    const [isStarting, setIsStarting] = useState(false);

    const [flashOn, setFlashOn] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [decisionLoading, setDecisionLoading] = useState(false);
    const [manualEntry, setManualEntry] = useState(false);
    const [manualCode, setManualCode] = useState('');
    const [toast, setToast] = useState(null);
    const [lastScan, setLastScan] = useState(null);
    const scannerRef = useRef(null);
    const html5QrRef = useRef(null);

    // Admins bypass device registration — always authorized
    useEffect(() => {
        if (isAdmin) {
            setDeviceStatus({ status: 'ACTIVE_SCANNER', id: 'ADMIN_DIRECT' });
            setDeviceLoading(false);
            return;
        }
        api.get('/devices/my-device')
            .then(res => setDeviceStatus(res.data))
            .catch(err => {
                if (err.response?.status === 404) setDeviceStatus({ status: 'NONE' });
                else console.error(err);
            })
            .finally(() => setDeviceLoading(false));
    }, [isAdmin]);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    // Use ref for handleScan so the scanner callback always has the latest version
    const handleScanRef = useRef(null);

    // Start camera scanning
    const startScanning = useCallback(async () => {
        if (!scannerRef.current || isStarting) return;
        setIsStarting(true);

        // Check for secure context (HTTPS) — CRITICAL for mobile camera access
        if (!window.isSecureContext && window.location.hostname !== 'localhost') {
            showToast('❌ Error: Camera requires HTTPS for mobile access');
            console.error('Insecure context: Browser will block camera access.');
        }

        // Clean up any leftover scanner DOM content
        if (html5QrRef.current) {
            try { await html5QrRef.current.stop(); } catch (e) { /* ignore */ }
            html5QrRef.current = null;
        }

        try {
            showToast('⏳ Loading scanner library...');
            const { Html5Qrcode } = await import('html5-qrcode');

            showToast('🔍 Searching for cameras...');
            const scanner = new Html5Qrcode('scanner-viewport');
            html5QrRef.current = scanner;

            const onScanSuccess = (decodedText) => {
                showToast('🎯 Code detected! Validating...');
                if (handleScanRef.current) handleScanRef.current(decodedText);
            };

            const config = {
                fps: 15,
                qrbox: (viewfinderWidth, viewfinderHeight) => {
                    const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                    const size = Math.floor(minEdge * 0.7);
                    return { width: size, height: size };
                },
                aspectRatio: 1.0,
            };

            showToast('📸 Requesting camera access...');
            try {
                // Try rear camera first (mobile)
                await scanner.start(
                    { facingMode: 'environment' },
                    config,
                    onScanSuccess,
                    (errorMessage) => {
                        // Ignored scan hints
                    }
                );
                showToast('✅ Camera active');
            } catch (rearCamError) {
                console.warn('Rear camera failed, trying fallback...', rearCamError);
                // Fallback: use any available camera (desktop webcam)
                await scanner.start(
                    { facingMode: 'user' },
                    config,
                    onScanSuccess,
                    () => { }
                );
                showToast('✅ Camera active (fallback)');
            }

            setScanning(true);
        } catch (error) {
            console.error('Detailed camera error:', error);
            const errorMsg = error.message || 'unknown error';
            if (errorMsg.includes('Permission')) {
                showToast('🚫 Camera permission denied');
            } else if (errorMsg.includes('NotFound')) {
                showToast('❓ No camera found on this device');
            } else {
                showToast(`❌ Camera error: ${errorMsg}`);
            }
            html5QrRef.current = null;
        } finally {
            setIsStarting(false);
        }
    }, [isStarting]);

    const stopScanning = useCallback(async () => {
        if (html5QrRef.current) {
            try {
                await html5QrRef.current.stop();
            } catch (e) { /* ignore */ }
            try {
                await html5QrRef.current.clear();
            } catch (e) { /* ignore */ }
            html5QrRef.current = null;
        }
        // Remove any leftover DOM elements injected by html5-qrcode
        // This prevents React's removeChild error
        if (scannerRef.current) {
            while (scannerRef.current.firstChild) {
                scannerRef.current.removeChild(scannerRef.current.firstChild);
            }
        }
        setScanning(false);
    }, []);

    useEffect(() => {
        return () => { stopScanning(); };
    }, [stopScanning]);

    // Handle scanned QR code
    const handleScan = async (qrToken) => {
        // Prevent rapid re-scans of same code
        if (lastScan === qrToken) return;
        setLastScan(qrToken);

        await stopScanning();

        try {
            const res = await api.post('/scan/validate', {
                qr_token: qrToken,
                device_id: deviceStatus?.id,
            });
            setScanResult(res.data);
        } catch (error) {
            setScanResult({
                status: 'ERROR',
                message: error.response?.data?.message || 'Scan validation failed',
            });
        }
    };
    // Keep the ref in sync so the scanner callback always uses the latest handleScan
    handleScanRef.current = handleScan;

    // Handle manual entry
    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (manualCode.trim()) {
            handleScan(manualCode.trim());
            setManualCode('');
            setManualEntry(false);
        }
    };

    // Handle grant/deny decision
    const handleDecision = async (decision) => {
        if (decision === 'DISMISS') {
            setScanResult(null);
            setLastScan(null);
            startScanning();
            return;
        }

        setDecisionLoading(true);
        try {
            await api.post('/scan/decision', {
                scan_id: scanResult.scan_id,
                decision,
            });
            showToast(decision === 'GRANT' ? '✅ Entry granted' : '🚫 Entry denied');
        } catch (error) {
            showToast('Failed to log decision');
        } finally {
            setDecisionLoading(false);
            setScanResult(null);
            setLastScan(null);
            setTimeout(() => startScanning(), 1000);
        }
    };

    // Loading state
    if (deviceLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Device not activated
    if (!deviceStatus || deviceStatus.status !== 'ACTIVE_SCANNER') {
        return (
            <div className="max-w-md mx-auto text-center py-16 page-enter page-enter-active">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-warning-500/10 flex items-center justify-center mb-6">
                    <Shield className="w-10 h-10 text-warning-500" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Scanner Not Available</h1>
                <p className="text-surface-500 mb-6">
                    {deviceStatus?.status === 'NONE'
                        ? 'You need to register your device first before scanning.'
                        : deviceStatus?.status === 'PENDING_ACTIVATION'
                            ? 'Your device is pending admin activation. Contact the admin to approve your device.'
                            : deviceStatus?.status === 'SUSPENDED'
                                ? 'Your scanner device has been suspended. Contact admin.'
                                : 'Your scanner device has been revoked.'}
                </p>
                {deviceStatus?.status === 'NONE' && (
                    <a href="/device-setup"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors">
                        Register Device <ChevronRight className="w-4 h-4" />
                    </a>
                )}
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto space-y-4 page-enter page-enter-active">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-2xl font-bold">QR Scanner</h1>
                <p className="text-surface-500 text-sm mt-1">Point camera at member's QR code</p>
            </div>

            {/* Camera Viewport */}
            <div className="relative rounded-3xl overflow-hidden bg-black shadow-2xl">
                {/* html5-qrcode container — MUST stay empty for React, library manages its own DOM */}
                <div id="scanner-viewport" ref={scannerRef}
                    className="w-full aspect-square bg-surface-900" />
                {/* Placeholder overlay — separate from scanner div to avoid DOM conflicts */}
                {!scanning && (
                    <div className="absolute inset-0 flex items-center justify-center bg-surface-900 z-[1]">
                        <div className="text-center text-surface-400">
                            <Camera className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">Tap Start to begin scanning</p>
                        </div>
                    </div>
                )}

                {/* Scanner Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex items-center justify-center gap-4">
                        {!scanning ? (
                            <button onClick={startScanning} disabled={isStarting}
                                className="px-8 py-3 rounded-2xl bg-primary-500 text-white font-semibold shadow-lg shadow-primary-500/30 hover:bg-primary-600 transition-all flex items-center gap-2 disabled:opacity-50">
                                {isStarting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Starting...
                                    </>
                                ) : (
                                    <>
                                        <Camera className="w-5 h-5" /> Start Scanning
                                    </>
                                )}
                            </button>
                        ) : (
                            <>
                                <button onClick={() => setManualEntry(true)}
                                    className="p-3 rounded-xl bg-white/10 backdrop-blur text-white hover:bg-white/20 transition-colors"
                                    title="Manual entry">
                                    <Keyboard className="w-5 h-5" />
                                </button>
                                <button onClick={stopScanning}
                                    className="px-6 py-3 rounded-2xl bg-danger-500 text-white font-semibold shadow-lg hover:bg-danger-600 transition-all flex items-center gap-2">
                                    <X className="w-5 h-5" /> Stop
                                </button>
                                <button onClick={() => {
                                    setLastScan(null);
                                    showToast('Scanner reset');
                                }}
                                    className="p-3 rounded-xl bg-white/10 backdrop-blur text-white hover:bg-white/20 transition-colors"
                                    title="Reset last scan">
                                    <RotateCcw className="w-5 h-5" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Status Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-surface-800/50 rounded-2xl border border-surface-200 dark:border-surface-700/50">
                <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${scanning ? 'bg-success-400 pulse-dot' : 'bg-surface-300'}`} />
                    <span className="text-sm font-medium">
                        {scanning ? 'Camera active' : 'Camera off'}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-surface-500">
                    <Shield className="w-3.5 h-3.5 text-success-500" />
                    <span>Device Authorized</span>
                </div>
            </div>

            {/* Manual Entry Modal */}
            {manualEntry && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <form onSubmit={handleManualSubmit}
                        className="bg-white dark:bg-surface-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-lg font-bold mb-1">Manual Entry</h3>
                        <p className="text-sm text-surface-500 mb-4">Enter the member's QR code string</p>
                        <input type="text" value={manualCode} onChange={e => setManualCode(e.target.value)}
                            placeholder="IHAP:userId:timestamp:hash"
                            className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-transparent text-sm focus:outline-none focus:border-primary-500 transition-colors mb-4" />
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setManualEntry(false)}
                                className="flex-1 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 text-sm font-medium">
                                Cancel
                            </button>
                            <button type="submit"
                                className="flex-1 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors">
                                Validate
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Scan Result Overlay */}
            <ScanResultOverlay result={scanResult} onDecision={handleDecision} loading={decisionLoading} />

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[51] bg-surface-900 dark:bg-surface-100 text-white dark:text-surface-900 px-6 py-3 rounded-xl shadow-2xl text-sm font-medium">
                    {toast}
                </div>
            )}
        </div>
    );
}
