import { WifiOff, RefreshCw, Home } from 'lucide-react';

export default function OfflinePage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 p-4">
            <div className="text-center max-w-md">
                <div className="w-20 h-20 rounded-2xl bg-surface-200 dark:bg-surface-800 flex items-center justify-center mx-auto mb-6">
                    <WifiOff className="w-10 h-10 text-surface-400" />
                </div>
                <h1 className="text-2xl font-bold mb-2">You're Offline</h1>
                <p className="text-surface-500 mb-6">
                    It looks like you've lost your internet connection. Some features may be limited until you're back online.
                </p>
                <div className="flex flex-col gap-3">
                    <button onClick={() => window.location.reload()}
                        className="flex items-center justify-center gap-2 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors">
                        <RefreshCw className="w-4 h-4" /> Try Again
                    </button>
                    <a href="/dashboard"
                        className="flex items-center justify-center gap-2 py-3 bg-surface-200 dark:bg-surface-800 font-semibold rounded-xl hover:bg-surface-300 dark:hover:bg-surface-700 transition-colors">
                        <Home className="w-4 h-4" /> Go to Dashboard
                    </a>
                </div>
                <p className="text-xs text-surface-400 mt-6">Your cached data is still available</p>
            </div>
        </div>
    );
}
