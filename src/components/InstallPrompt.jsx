import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [show, setShow] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShow(true);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        setShow(false);
    };

    if (!show) return null;

    return (
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50 animate-slide-up">
            <div className="bg-white dark:bg-surface-800 rounded-2xl p-4 shadow-2xl border border-surface-200 dark:border-surface-700 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shrink-0">
                    <Download className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">Install Hub Access</p>
                    <p className="text-xs text-surface-500 mt-0.5">Add to your home screen for quick access</p>
                    <div className="flex gap-2 mt-2">
                        <button onClick={handleInstall}
                            className="px-3 py-1.5 bg-primary-500 text-white text-xs font-medium rounded-lg hover:bg-primary-600 transition-colors">
                            Install
                        </button>
                        <button onClick={() => setShow(false)}
                            className="px-3 py-1.5 text-xs font-medium text-surface-500 hover:text-surface-700 transition-colors">
                            Not Now
                        </button>
                    </div>
                </div>
                <button onClick={() => setShow(false)} className="text-surface-400 hover:text-surface-600">
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
